import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Every backend-shaped response in this journey is intercepted below. No live
// backend, Google, OCR service, or blockchain is contacted.
const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const id = 'e2e-prepared-journey';
const browser = await chromium.launch();
const pageErrors = [];
const mutations = [];
let commentsResolved = false;
let lifecycle = 'PREPARING';
let finalizationStatus = 'SIGNED';
let extractionApproved = false;
let extractionText = 'Original extracted wording.';
const comments = () => ({
  document_id: id,
  unresolved: commentsResolved ? 0 : 1,
  synced_at: '2026-10-18T00:00:00Z',
  comments: [{ id: 'comment-1', author_name: 'Client Reviewer', is_lawyer: false, content: 'Clarify this clause.', quoted_text: 'Payment is due.', resolved: commentsResolved, created_at: '2026-10-18T00:00:00Z', replies: [] }],
});
const permissions = () => ({
  can_view: true, can_rename: false, can_create_draft: lifecycle === 'PREPARING' && !document.draft_url,
  can_mark_ready: lifecycle === 'PREPARING' && Boolean(document.draft_url),
  can_reopen: false, can_attach_signed_copy: lifecycle === 'READY_FOR_SIGNATURE',
  can_replace_signed_copy: false, can_correct_entry: false, can_cancel: false,
  can_finalize: lifecycle === 'SIGNED', can_share: false, can_revoke: false,
});
const document = {
  document_id: id, file_name: 'Prepared journey deed', lifecycle: 'PREPARING', status: null,
  on_chain: false, book_id: null, doc_no: null, page_no: null, draft_url: null,
  signed_copy: null, created_at: '2026-10-18T00:00:00Z', permissions: null,
};
document.permissions = permissions();
const transaction = { document_id: id, onchain_document_id: 'fixture-chain-record', data_hash: 'ab'.repeat(32), tx_hash: 'cd'.repeat(32) };
const signedCopy = { id: 'copy-1', storage_url: 'https://fixtures.example.test/signed.pdf', original_filename: 'signed.pdf', content_type: 'application/pdf', size_bytes: 20, sha256: 'ab'.repeat(32), is_current: true, created_at: '2026-10-18T00:00:00Z' };

function extraction() {
  return { extraction_id: `${id}-extraction`, document_id: id, storage_url: signedCopy.storage_url, engine: 'fixture-ocr', page_count: 1, confidence_avg: 0.9,
    blocks: [{ index: 0, editable: true, type: 'text', text: extractionText, original_text: 'Original extracted wording.', bbox: [10, 10, 500, 100], page_idx: 0, text_level: 0, score: 0.9, is_html: false, edited: extractionText !== 'Original extracted wording.' }],
    is_reviewed: extractionApproved, reviewed_by: extractionApproved ? 'fixture-lawyer' : null,
    reviewed_at: extractionApproved ? '2026-10-18T00:02:00Z' : null, status: extractionApproved ? 'COMPLETED' : 'AWAITING_REVIEW', flag_count: 0, flags: [], high_severity_count: 0, edited_block_count: Number(extractionText !== 'Original extracted wording.'), content_hash: extractionApproved ? 'fixture-content-hash' : null };
}

try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(60_000);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await context.addCookies([
    { name: 'portal_token', value: 'prepared-journey-fixture', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);
  await page.route('**/api/portal/proxy*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.searchParams.get('path') ?? '';
    const method = request.method();
    if (url.pathname.endsWith('/proxy-post')) {
      mutations.push(`${method} ${path}`);
      if (path === `/documents/${id}/draft`) {
        document.draft_url = 'https://docs.google.com/document/d/fixture-draft';
        document.permissions = permissions();
        return route.fulfill({ status: 201, json: document });
      }
      if (path === `/documents/${id}/comments/sync`) {
        commentsResolved = true;
        return route.fulfill({ status: 200, json: comments() });
      }
      if (path === `/documents/${id}/ready`) {
        if (!commentsResolved) return route.fulfill({ status: 409, json: { message: 'Resolve comments before marking ready.', details: { reason: 'UNRESOLVED_COMMENTS', unresolved: 1, draft_url: document.draft_url } } });
        lifecycle = document.lifecycle = 'READY_FOR_SIGNATURE';
        document.permissions = permissions();
        return route.fulfill({ status: 200, json: document });
      }
      if (path.startsWith(`/documents/${id}/signed-copy?`)) {
        lifecycle = document.lifecycle = 'SIGNED';
        document.book_id = 'open-book';
        document.signed_copy = signedCopy;
        document.permissions = permissions();
        return route.fulfill({ status: 200, json: document });
      }
      if (path === `/documents/${id}/finalize`) {
        finalizationStatus = 'QUEUED';
        lifecycle = document.lifecycle = 'FINALIZED';
        document.status = 'QUEUED';
        document.on_chain = true;
        return route.fulfill({ status: 200, json: transaction });
      }
      if (path === `/documents/${id}/extraction` && method === 'PATCH') {
        for (const edit of request.postDataJSON().edits) extractionText = edit.text;
        return route.fulfill({ status: 200, json: extraction() });
      }
      if (path === `/documents/${id}/extraction/approve`) {
        extractionApproved = true;
        finalizationStatus = 'COMPLETED';
        return route.fulfill({ status: 200, json: { extraction_id: `${id}-extraction`, content_hash: 'fixture-content-hash', status: 'COMPLETED', is_reviewed: true } });
      }
      if (path === '/search') return route.fulfill({ status: 200, json: { query: request.postDataJSON().query, results: [{ document_id: id, chunk_id: 'fixture-chunk', chunk_index: 0, score: 1, text: extractionText }] } });
      if (path === `/documents/${id}/ask`) return route.fulfill({ status: 200, json: { answer: `Fixture answer: ${extractionText}` } });
      return route.fulfill({ status: 404, json: { message: `Unexpected mutation ${path}` } });
    }
    if (path === '/users/') return route.fulfill({ status: 200, json: { role: 'document_issuer', f_name: 'Fixture', l_name: 'Lawyer' } });
    if (path === `/documents/${id}`) return route.fulfill({ status: 200, json: { ...document, lifecycle, status: finalizationStatus, permissions: permissions(), document_hash: lifecycle === 'FINALIZED' ? 'ab'.repeat(32) : undefined, finalized_at: lifecycle === 'FINALIZED' ? '2026-10-18T00:01:00Z' : undefined } });
    if (path === `/documents/${id}/comments`) return route.fulfill({ status: 200, json: comments() });
    if (path === `/documents/${id}/signed-copies`) return route.fulfill({ status: 200, json: { document_id: id, copies: document.signed_copy ? [signedCopy] : [] } });
    if (path === `/documents/${id}/history`) return route.fulfill({ status: 200, json: { document_id: id, events: [] } });
    if (path === `/documents/${id}/extraction`) return route.fulfill({ status: 200, json: extraction() });
    if (path === `/documents/${id}/verify`) return route.fulfill({ status: 200, json: { document_id: id, file_name: document.file_name, status: 'AUTHENTIC', is_authentic: true, baseline_trusted: true, tx_hash: transaction.tx_hash, verified_at: '2026-10-18T00:03:00Z', message: 'Fixture verification.' } });
    if (path === '/books/?limit=50&offset=0' || path.startsWith('/books/')) return route.fulfill({ status: 200, json: [{ id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' }] });
    if (path === '/documents/' || path === '/notifications/' || path === '/notifications') return route.fulfill({ status: 200, json: [] });
    if (path === '/notifications/unread-count') return route.fulfill({ status: 200, json: { unread: 0 } });
    return route.fulfill({ status: 404, json: { message: `Unexpected request ${method} ${path}` } });
  });

  await page.goto(`${baseUrl}/portal/documents/${id}`);
  await page.getByRole('heading', { name: document.file_name, exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Files' }).click();
  await page.getByRole('button', { name: 'Create blank Google draft' }).click();
  await page.getByRole('link', { name: 'Open Google draft' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Open Google draft' }).getAttribute('href'), document.draft_url);
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByText('Clarify this clause.').waitFor();
  await page.getByText('Check the draft for pending suggestions in Google Docs before marking it ready. Clients can only read the draft after it is ready; reopen it for revisions.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Mark ready for signature' }).click();
  await page.getByRole('alert').filter({ hasText: 'Resolve comments before marking ready.' }).waitFor();
  await page.getByText('1 unresolved comments remain.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Open Google draft to resolve comments' }).getAttribute('href'), document.draft_url);
  await page.getByRole('button', { name: 'Sync comments' }).click();
  await page.getByText(/0 unresolved · Last synced/).waitFor();
  await page.getByRole('button', { name: 'Mark ready for signature' }).click();
  await page.getByRole('tab', { name: 'Files' }).click();
  await page.getByRole('button', { name: 'Attach signed PDF' }).click();
  await page.getByRole('button', { name: 'Register book' }).click();
  await page.getByRole('option', { name: /Register book 5/ }).click();
  await page.getByLabel('Signed PDF').setInputFiles({ name: 'signed.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 fixture') });
  await page.getByRole('button', { name: 'Confirm attachment' }).click();
  await page.getByRole('status').filter({ hasText: 'Signed PDF attached.' }).waitFor();
  await page.getByRole('tab', { name: 'Comments' }).click();
  assert.equal(await page.getByRole('button', { name: 'Reopen draft' }).count(), 0, 'reopen is unavailable because this fixture denies can_reopen');
  await page.getByRole('tab', { name: 'Files' }).click();
  assert.equal(await page.getByRole('button', { name: 'Replace signed PDF' }).count(), 0, 'replacement is unavailable because this fixture denies can_replace_signed_copy');
  await page.getByRole('button', { name: 'Finalize' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Confirm finalization' });
  await confirmation.getByRole('button', { name: 'Confirm finalization' }).click();
  await page.getByRole('status').filter({ hasText: 'Demo finalization complete. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.' }).waitFor();
  assert.equal(mutations.filter((mutation) => mutation === `POST /documents/${id}/finalize`).length, 1);

  await page.goto(`${baseUrl}/portal/upload/processing?id=${id}`);
  await page.getByText('Current status: Queued', { exact: false }).waitFor();
  finalizationStatus = document.status = 'AWAITING_REVIEW';
  await page.getByRole('link', { name: 'Review extracted text' }).waitFor();
  await page.getByRole('link', { name: 'Review extracted text' }).click();
  await page.getByRole('tab', { name: 'Raw' }).click();
  await page.getByRole('textbox', { name: 'Reviewed text for block 0' }).fill('Approved prepared journey text.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Approve reviewed text' }).click();
  await page.getByRole('dialog', { name: 'Approve reviewed text?' }).getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByText('Processing is complete.', { exact: false }).waitFor();
  await page.goto(`${baseUrl}/portal/search`);
  await page.getByPlaceholder('Search across all your documents...').fill('Approved prepared journey');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByText('Approved prepared journey text.', { exact: true }).waitFor();
  await page.goto(`${baseUrl}/portal/documents/${id}/ask`);
  await page.getByPlaceholder('Type a question...').fill('What does this document say?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await page.getByText(`Fixture answer: ${extractionText}`, { exact: true }).waitFor();
  assert.equal(mutations.filter((mutation) => mutation === `POST /documents/${id}/ask`).length, 1);
  await page.goto(`${baseUrl}/portal/documents/${id}/verify`);
  await page.getByRole('heading', { name: 'Document is authentic', exact: true }).waitFor();
  await page.getByText('Mock verification is simulated and does not represent a real backend or blockchain verification.', { exact: true }).waitFor();
  assert.deepEqual(pageErrors, []);
  await context.close();
  console.log('Prepared document journey passed with mocked backend-shaped responses only; Google, OCR, and blockchain integrations were not contacted.');
} finally {
  await browser.close();
}
