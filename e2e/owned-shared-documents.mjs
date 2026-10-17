import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const pageErrors = [];
const unexpectedRequests = [];
const requests = [];

function document(name, isOwner, lifecycle, status, day) {
  return {
    id: name.toLowerCase().replaceAll(' ', '-'), file_name: `${name}.pdf`, is_owner: isOwner, my_role: isOwner ? 'owner' : 'viewer',
    lifecycle, status, on_chain: lifecycle === 'FINALIZED',
    created_at: `2026-10-${String(day).padStart(2, '0')}T00:00:00Z`,
    shared_at: isOwner ? null : '2026-10-17T00:00:00Z',
  };
}

// Deliberately stale statuses must not turn pre-finalized records into processing work.
const documents = [
  document('Owned draft', true, 'PREPARING', 'FAILED', 16),
  document('Owned ready', true, 'READY_FOR_SIGNATURE', 'PROCESSING', 15),
  document('Owned signed', true, 'SIGNED', 'AWAITING_REVIEW', 14),
  ...['AWAITING_REVIEW', 'FAILED', 'PROCESSING', 'PENDING', 'COMPLETED', null, 'COMPLETED'].map((status, index) =>
    document(`Owned match ${index}`, true, 'FINALIZED', status, 13 - index)),
  document('Shared draft', false, 'PREPARING', 'PROCESSING', 24),
  ...['AWAITING_REVIEW', 'FAILED', 'PROCESSING', 'COMPLETED', null, 'COMPLETED'].map((status, index) =>
    document(`Shared match ${index}`, false, 'FINALIZED', status, 23 - index)),
];
const permissions = {
  can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: false,
  can_reopen: false, can_attach_signed_copy: false, can_replace_signed_copy: false,
  can_correct_entry: false, can_cancel: false, can_finalize: false,
  can_share: false, can_revoke: false,
};

async function session(role) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' });
  await context.addCookies([
    { name: 'portal_token', value: `issue-121-${role}`, url: baseUrl },
    { name: 'user_role', value: role === 'document_issuer' ? 'lawyer' : 'user', url: baseUrl },
  ]);
  await context.route((url) => url.origin === new URL(baseUrl).origin && url.pathname.startsWith('/api/'), async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.searchParams.get('path');
    requests.push({ role, path: path ?? url.pathname });
    let json;
    if (request.method() === 'GET' && url.pathname === '/api/portal/proxy') {
      if (path === '/users/') json = { role, email: `${role}@example.test`, f_name: 'Fixture', l_name: 'Account', avatar: 'icon1' };
      else if (path === '/documents/') json = documents;
      else if (path === '/notifications/') json = { notifications: [], total: 0 };
      else if (path === '/notifications/unread-count') json = { unread: 0 };
      else {
        const item = documents.find(({ id }) => path === `/documents/${id}`);
        if (item) json = { ...item, document_id: item.id, signed_copy: null, permissions };
      }
    } else if (request.method() === 'GET' && url.pathname === '/api/admin/dashboard') {
      json = { total_users: 2, total_lawyers: 1, total_documents: 17, total_processed: 5, total_failed: 2, total_on_chain: 13, pending_invitations: 0 };
    }
    if (json !== undefined) return route.fulfill({ status: 200, json });
    unexpectedRequests.push(`${role}: ${request.method()} ${url.pathname} ${path ?? ''}`);
    return route.fulfill({ status: 500, json: { message: 'Unexpected fixture request' } });
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(`${role}: ${error.message}`));
  page.setDefaultTimeout(10000);
  return { context, page };
}

function card(page, heading) {
  return page.locator('article, section').filter({ has: page.getByRole('heading', { name: heading, exact: true }) }).last();
}

async function metric(page, label, value) {
  const metricCard = page.getByRole('article').filter({ has: page.getByRole('paragraph').filter({ hasText: new RegExp(`^${label}$`) }) });
  await metricCard.getByText(String(value), { exact: true }).waitFor();
}

async function selected(page, name) {
  await page.getByRole('tab', { name, exact: true, selected: true }).waitFor();
}

async function filters(page) {
  const toggle = page.getByText(/^More Filters/);
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
}

async function reset(page) {
  await filters(page);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('heading', { name: 'Document Directory' }).click();
}

try {
  const lawyer = await session('document_issuer');
  const page = lawyer.page;
  await page.goto(`${baseUrl}/portal/documents`);
  await selected(page, 'My documents (10)');
  await page.getByRole('tab', { name: 'Shared with me (7)', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Create document draft' }).waitFor();
  await metric(page, 'Total Documents', 10);
  await metric(page, 'Finalized', 7);
  await metric(page, 'Ready for Review', 1);
  await metric(page, 'Failed', 1);
  const table = page.getByRole('table');
  for (const [name, lifecycle] of [['Owned draft', 'Preparing'], ['Owned ready', 'Ready for signature'], ['Owned signed', 'Signed']]) {
    const row = table.getByRole('row').filter({ hasText: `${name}.pdf` });
    await row.getByText(lifecycle, { exact: true }).waitFor();
    assert.equal(await row.getByText(/^(Failed|Processing|Ready for review)$/).count(), 0);
  }
  await table.getByText('Ready for review', { exact: true }).waitFor();
  await table.getByText('Processing failed', { exact: true }).waitFor();
  assert.equal(await table.getByText(/^Shared/).count(), 0);
  const distribution = card(page, 'Status Distribution');
  await distribution.getByText('10', { exact: true }).waitFor();
  await distribution.getByText('Signed', { exact: true }).waitFor();
  const recent = card(page, 'Recently Created');
  await recent.getByRole('link', { name: 'Owned draft.pdf', exact: true }).waitFor();
  assert.equal(await recent.getByRole('link', { name: /^Shared/ }).count(), 0);
  assert.equal(await recent.getByText(/Failed|Processing|Ready for review/).count(), 0);

  // Search and lifecycle filters affect rows, while summaries and tab counts keep partition totals.
  await page.getByRole('textbox', { name: 'Search documents' }).fill('Shared');
  await table.getByText('No matching documents in My documents', { exact: true }).waitFor();
  await metric(page, 'Total Documents', 10);
  await distribution.getByText('10', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Shared with me (7)' }).click();
  await selected(page, 'Shared with me (7)');
  await table.getByText('Shared draft.pdf', { exact: true }).waitFor();
  assert.equal(await page.getByRole('textbox', { name: 'Search documents' }).inputValue(), 'Shared');
  await metric(page, 'Total Documents', 7);
  await distribution.getByText('7', { exact: true }).waitFor();
  assert.equal(await distribution.getByText('Signed', { exact: true }).count(), 0);
  await recent.getByRole('link', { name: 'Shared draft.pdf', exact: true }).waitFor();
  assert.equal(await recent.getByRole('link', { name: /^Owned/ }).count(), 0);
  await reset(page);
  await page.getByRole('tab', { name: 'My documents (10)' }).click();
  await filters(page);
  await page.getByRole('button', { name: 'All Lifecycles', exact: true }).click();
  await page.getByRole('button', { name: 'Signed', exact: true }).click();
  await table.getByText('Owned signed.pdf', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Shared with me (7)' }).click();
  await table.getByText('No matching documents in Shared with me', { exact: true }).waitFor();
  await filters(page);
  await page.getByRole('button', { name: 'Signed', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Signed', exact: true }).count(), 2);
  await page.getByRole('button', { name: 'Preparing', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Ready for signature', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'All Lifecycles', exact: true }).click();
  await reset(page);

  // Both ownership partitions have enough finalized matches to cross a page boundary.
  await page.getByRole('tab', { name: 'My documents (10)' }).click();
  await page.getByRole('textbox', { name: 'Search documents' }).fill('match');
  await filters(page);
  await page.getByRole('button', { name: 'All Lifecycles', exact: true }).click();
  await page.getByRole('button', { name: 'Finalized', exact: true }).click();
  await page.getByRole('heading', { name: 'Document Directory' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByText('Showing 6–7 of 7 documents', { exact: true }).waitFor();
  await table.getByText('Owned match 5.pdf', { exact: true }).waitFor();
  assert.equal(await table.getByText('Owned match 0.pdf', { exact: true }).count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileCards = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Open', exact: true }), hasNot: page.getByRole('table') });
  await mobileCards.filter({ hasText: 'Owned match 5.pdf' }).waitFor();
  assert.equal(await mobileCards.count(), 2);
  assert.equal(await mobileCards.filter({ hasText: 'Owned match 0.pdf' }).count(), 0);
  await page.getByRole('tab', { name: 'Shared with me (7)' }).click();
  await page.getByText('Showing 1–5 of 6 documents', { exact: true }).waitFor();
  await mobileCards.filter({ hasText: 'Shared match 0.pdf' }).waitFor();
  assert.equal(await mobileCards.count(), 5);
  assert.equal(await mobileCards.filter({ hasText: 'Shared match 5.pdf' }).count(), 0);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await table.getByText('Shared match 0.pdf', { exact: true }).waitFor();
  assert.equal(await table.getByText('Shared match 5.pdf', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('textbox', { name: 'Search documents' }).inputValue(), 'match');
  await filters(page);
  await page.getByRole('button', { name: 'Finalized', exact: true }).waitFor();
  await metric(page, 'Total Documents', 7);
  await reset(page);
  await page.getByRole('button', { name: 'Newest first', exact: true }).click();
  await page.getByRole('button', { name: 'Name A–Z', exact: true }).click();
  assert.match(await table.getByRole('row').nth(1).innerText(), /Shared draft.pdf/);
  await page.getByRole('tab', { name: 'Shared with me (7)' }).focus();
  await page.keyboard.press('ArrowLeft');
  await selected(page, 'My documents (10)');

  await page.goto(`${baseUrl}/portal/dashboard`);
  const recentDashboard = card(page, 'Recent documents');
  await recentDashboard.getByRole('link', { name: /Owned draft.pdf/ }).waitFor();
  assert.equal(await recentDashboard.getByRole('link', { name: /^Shared/ }).count(), 0);
  const attention = card(page, 'Documents needing attention');
  await attention.getByRole('link', { name: /Owned match 1.pdf/ }).waitFor();
  assert.equal(await attention.getByRole('link').count(), 1);
  const processing = card(page, 'Processing');
  await processing.getByRole('link', { name: /Owned match 2.pdf/ }).waitFor();
  await processing.getByRole('link', { name: /Owned match 3.pdf/ }).waitFor();
  assert.equal(await processing.getByRole('link').count(), 2);
  await page.getByRole('link', { name: 'View processing documents' }).getByText('3 documents processing', { exact: true }).waitFor();
  for (const name of ['Owned draft', 'Owned ready', 'Owned signed']) {
    const link = recentDashboard.getByRole('link', { name: new RegExp(`${name}.pdf`) });
    assert.equal(await link.getByText(/^(Failed|Processing|Ready for review)$/).count(), 0);
  }

  for (const [name, lifecycle] of [['Owned draft', 'Preparing'], ['Owned ready', 'Ready for signature'], ['Owned signed', 'Signed']]) {
    const id = name.toLowerCase().replaceAll(' ', '-');
    await page.goto(`${baseUrl}/portal/documents/${id}`);
    await page.getByRole('heading', { name: `${name}.pdf`, exact: true }).waitFor();
    await page.getByRole('tabpanel').getByText(lifecycle, { exact: true }).waitFor();
    assert.equal(await page.getByText('Processing status', { exact: true }).count(), 0);
    assert.equal(await page.getByText(/^(Failed|Processing|Ready for review)$/).count(), 0);
    await page.goto(`${baseUrl}/portal/upload/processing?id=${id}`);
    await page.getByText('Waiting for finalization', { exact: true }).waitFor();
    await page.getByText(`Lifecycle: ${lifecycle}`, { exact: true }).waitFor();
    assert.equal(await page.getByText(/^(Processing failed|Extracted text ready for review|Processing your document\.\.\.)$/).count(), 0);
  }
  await page.goto(`${baseUrl}/portal/upload/processing?id=owned-match-0`);
  await page.getByText('Extracted text ready for review', { exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Review extracted text' }).getAttribute('href'), '/portal/documents/owned-match-0/review');
  await page.goto(`${baseUrl}/portal/upload/processing?id=owned-match-1`);
  await page.getByText('Processing failed', { exact: true }).waitFor();
  await page.getByText('Lifecycle: Finalized', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'View document', exact: true }).click();
  await page.waitForURL('**/portal/documents/owned-match-1');
  await page.getByRole('heading', { name: 'Owned match 1.pdf', exact: true }).waitFor();
  await page.getByRole('tabpanel').getByText('Processing failed', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Finalize', exact: true }).count(), 0);
  await lawyer.context.close();

  const client = await session('document_participant');
  await client.page.goto(`${baseUrl}/portal/documents`);
  await selected(client.page, 'Shared with me (7)');
  await metric(client.page, 'Total Documents', 7);
  assert.equal(await client.page.getByRole('button', { name: 'Create document draft' }).count(), 0);
  assert.equal(await client.page.getByRole('table').getByText(/^Owned/).count(), 0);
  await client.page.getByRole('tab', { name: 'My documents (10)' }).click();
  await selected(client.page, 'My documents (10)');
  await metric(client.page, 'Total Documents', 10);
  await client.page.goto(`${baseUrl}/portal/dashboard`);
  await client.page.getByText('Welcome to the Document Portal', { exact: true }).waitFor();
  assert.equal(await client.page.getByRole('heading', { name: 'Recent documents' }).count(), 0);
  assert.equal(await client.page.getByRole('link', { name: 'View processing documents' }).count(), 0);
  assert.equal(requests.some((request) => request.role === 'document_participant' && request.path === '/api/admin/dashboard'), false);
  assert.deepEqual(unexpectedRequests, []);
  assert.deepEqual(pageErrors, []);
  await client.context.close();
  console.log('Owned/shared document browser checks passed: role defaults, tab counts and keyboard switching, scoped search/filter/sort and summaries, pagination reset, lawyer cards, client welcome, lifecycle/status visibility, canonical review, and finalized-failure recovery. No browser page errors. API responses were stubbed same-origin frontend evidence; live backend behavior was not verified.');
} catch (error) {
  console.error({ unexpectedRequests, pageErrors });
  throw error;
} finally {
  await browser.close();
}
