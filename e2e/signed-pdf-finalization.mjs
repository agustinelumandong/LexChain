import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const documentId = 'e2e-signed-document';
const signedFingerprint = 'e2e-synthetic-signed-pdf-fingerprint';
const record = {
  document_id: documentId,
  onchain_document_id: 'e2e-synthetic-chain-record',
  data_hash: signedFingerprint,
  tx_hash: 'e2e-synthetic-transaction',
};
const savedText = 'Reviewed clause: payment is due within thirty days.';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const finalizePosts = [];
const detailFingerprints = [];
const savedEdits = [];
const askRequests = [];
const searchRequests = [];
let finalizeSeen;
let releaseFinalize;
const finalizeRequested = new Promise((resolve) => { finalizeSeen = resolve; });
const finalizeResponse = new Promise((resolve) => { releaseFinalize = resolve; });
let mainStatus = 'SIGNED';
let extractionReviewed = false;
let extractionText = 'Original OCR wording with a reviewable typo.';

const signedCopy = {
  id: `${documentId}-signed-copy`,
  storage_url: 'https://fixtures.example.test/signed.pdf',
  original_filename: 'signed.pdf',
  content_type: 'application/pdf',
  size_bytes: 42,
  sha256: signedFingerprint,
  is_current: true,
  created_at: '2026-10-18T00:00:00Z',
};

function documentFixture(id, lifecycle = 'SIGNED', status = null) {
  const finalized = lifecycle === 'FINALIZED';
  return {
    document_id: id,
    file_name: id === documentId ? 'E2E signed agreement' : id,
    lifecycle,
    status,
    on_chain: finalized,
    document_hash: finalized ? signedFingerprint : null,
    signed_copy: { ...signedCopy, id: `${id}-signed-copy` },
    created_at: '2026-10-18T00:00:00Z',
    finalized_at: finalized ? '2026-10-18T00:01:00Z' : null,
    permissions: {
      can_view: true,
      can_rename: false,
      can_create_draft: false,
      can_mark_ready: false,
      can_reopen: false,
      can_attach_signed_copy: false,
      can_replace_signed_copy: false,
      can_correct_entry: false,
      can_cancel: false,
      can_finalize: !finalized,
      can_share: false,
      can_revoke: false,
    },
  };
}

function extractionFixture(isReviewed = extractionReviewed) {
  return {
    extraction_id: `${documentId}-extraction`,
    document_id: documentId,
    storage_url: signedCopy.storage_url,
    engine: 'route-fixture-ocr',
    page_count: 1,
    confidence_avg: 0.9,
    blocks: [{
      index: 0,
      editable: true,
      type: 'text',
      text: extractionText,
      original_text: 'Original OCR wording with a reviewable typo.',
      bbox: [10, 10, 500, 100],
      page_idx: 0,
      text_level: 0,
      score: 0.9,
      is_html: false,
      edited: extractionText !== 'Original OCR wording with a reviewable typo.',
    }],
    is_reviewed: isReviewed,
    reviewed_by: isReviewed ? 'e2e-fixture-issuer' : null,
    reviewed_at: isReviewed ? '2026-10-18T00:02:00Z' : null,
    status: isReviewed ? 'COMPLETED' : 'AWAITING_REVIEW',
    flag_count: 0,
    flags: [],
    high_severity_count: 0,
    edited_block_count: extractionText === 'Original OCR wording with a reviewable typo.' ? 0 : 1,
    content_hash: isReviewed ? 'e2e-synthetic-extraction-content-hash' : null,
  };
}

await context.addCookies([
  { name: 'portal_token', value: 'signed-pdf-finalization-e2e', url: baseUrl },
  { name: 'user_role', value: 'lawyer', url: baseUrl },
]);

await page.route('**/api/portal/proxy*', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const path = url.searchParams.get('path') ?? '';
  const method = request.method();
  const id = path.match(/^\/documents\/([^/]+)/)?.[1] ?? '';

  if (url.pathname.endsWith('/proxy-post')) {
    if (path === `/documents/${documentId}/finalize`) {
      finalizePosts.push(id);
      finalizeSeen();
      await finalizeResponse;
      mainStatus = 'PROCESSING';
      await route.fulfill({ status: 200, json: record });
    } else if (path === '/search') {
      const body = request.postDataJSON();
      searchRequests.push(body);
      await route.fulfill({ status: 200, json: { query: body.query, results: [{ document_id: documentId, chunk_id: 'e2e-chunk', chunk_index: 0, score: 1, text: extractionText }] } });
    } else if (path === `/documents/${documentId}/ask`) {
      askRequests.push(request.postDataJSON());
      await route.fulfill({ status: 200, json: { answer: `Fixture answer based on approved text: ${extractionText}` } });
    } else if (path === `/documents/${documentId}/extraction` && method === 'PATCH') {
      const body = request.postDataJSON();
      savedEdits.push(body.edits);
      for (const edit of body.edits) extractionText = edit.text;
      await route.fulfill({ status: 200, json: extractionFixture(false) });
    } else if (path === `/documents/${documentId}/extraction/approve`) {
      extractionReviewed = true;
      mainStatus = 'COMPLETED';
      await route.fulfill({ status: 200, json: { extraction_id: `${documentId}-extraction`, content_hash: 'e2e-synthetic-extraction-content-hash', status: 'COMPLETED', is_reviewed: true } });
    } else if (path === '/documents/e2e-chain-failure/finalize') {
      await route.fulfill({ status: 409, json: { message: 'Blockchain rejected this finalization fixture.', status_code: 409, details: { reason: 'CHAIN_REJECTED' } } });
    } else if (path === '/documents/e2e-lost-response/finalize') {
      finalizePosts.push(id);
      await route.abort('timedout');
    } else {
      await route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    }
    return;
  }

  if (path === '/users/') {
    await route.fulfill({ status: 200, json: { role: 'document_issuer' } });
  } else if (path === `/documents/${documentId}`) {
    const document = documentFixture(documentId, mainStatus === 'SIGNED' ? 'SIGNED' : 'FINALIZED', mainStatus === 'SIGNED' ? null : mainStatus);
    detailFingerprints.push(document.document_hash ?? document.signed_copy.sha256);
    await route.fulfill({ status: 200, json: document });
  } else if (path === '/documents/e2e-chain-failure') {
    await route.fulfill({ status: 200, json: documentFixture(id) });
  } else if (path === '/documents/e2e-lost-response') {
    await route.fulfill({ status: 200, json: documentFixture(id) });
  } else if (path === '/documents/e2e-processing-failure') {
    await route.fulfill({ status: 200, json: documentFixture(id, 'FINALIZED', 'FAILED') });
  } else if (path === `/documents/${documentId}/extraction`) {
    await route.fulfill({ status: 200, json: extractionFixture() });
  } else if (path === `/documents/${documentId}/history`) {
    await route.fulfill({ status: 200, json: { entries: [] } });
  } else if (path === `/documents/${documentId}/signed-copies`) {
    await route.fulfill({ status: 200, json: { copies: [signedCopy] } });
  } else if (path.includes('/comments') || path.includes('/audit-logs') || path.includes('/access')) {
    await route.fulfill({ status: 200, json: { comments: [], unresolved: 0, synced_at: null, entries: [], participants: [] } });
  } else {
    await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
  }
});

try {
  page.on('pageerror', (error) => console.error(`Browser error: ${error.message}`));
  await page.goto(`${baseUrl}/portal/documents/${documentId}`);
  await page.getByRole('heading', { name: 'E2E signed agreement' }).waitFor();

  await page.getByRole('tab', { name: 'Files' }).click();
  await page.getByRole('button', { name: 'Finalize' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Confirm finalization' });
  await confirmation.getByText('Demo mode: this action uses synthetic data. No real PDF digest or blockchain transaction will be produced.', { exact: true }).waitFor();
  await confirmation.getByRole('button', { name: 'Confirm finalization' }).click();
  await finalizeRequested;
  const pendingFinalize = confirmation.getByRole('button', { name: 'Finalizing…' });
  await pendingFinalize.waitFor();
  assert.equal(await pendingFinalize.isDisabled(), true);
  assert.equal(finalizePosts.length, 1);
  releaseFinalize();
  for (const value of Object.values(record)) await page.getByText(value, { exact: true }).waitFor();
  await page.getByRole('status').filter({ hasText: 'Demo finalization complete. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.' }).waitFor();
  assert.ok(detailFingerprints.every((fingerprint) => fingerprint === signedFingerprint));

  await page.goto(`${baseUrl}/portal/upload/processing?id=${documentId}`);
  await page.getByText('Current status: Processing', { exact: false }).waitFor();
  mainStatus = 'AWAITING_REVIEW';
  await page.getByRole('link', { name: 'Review extracted text' }).waitFor({ timeout: 5000 });
  await page.getByRole('link', { name: 'Review extracted text' }).click();
  await page.getByRole('tab', { name: 'Raw' }).click();
  const editor = page.getByRole('textbox', { name: 'Reviewed text for block 0' });
  await editor.waitFor();
  await editor.fill(savedText);
  const saveChanges = page.getByRole('button', { name: 'Save changes' });
  await saveChanges.click();
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent === 'Save changes');
    return button?.disabled === true;
  });
  assert.equal(savedEdits.length, 1);
  assert.deepEqual(savedEdits[0], [{ index: 0, text: savedText }]);
  await page.getByRole('button', { name: 'Approve reviewed text' }).click();
  await page.getByRole('dialog', { name: 'Approve reviewed text?' }).getByRole('button', { name: 'Approve', exact: true }).click();
  await page.waitForURL(`**/portal/upload/processing?id=${documentId}`);
  await page.getByText('Processing is complete.', { exact: false }).waitFor();
  assert.ok(detailFingerprints.every((fingerprint) => fingerprint === signedFingerprint));
  assert.ok(detailFingerprints.length >= 2, 'document detail was read before and after extraction edits');

  await page.goto(`${baseUrl}/portal/search`);
  await page.getByPlaceholder('Search across all your documents...').fill('thirty days');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.waitForURL('**/portal/search?q=thirty%20days');
  await page.getByText(savedText, { exact: true }).waitFor();
  assert.deepEqual(searchRequests, [{ query: 'thirty days' }]);

  await page.goto(`${baseUrl}/portal/documents/${documentId}/ask`);
  await page.getByPlaceholder('Type a question...').fill('When is payment due?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await page.getByText(`Fixture answer based on approved text: ${savedText}`, { exact: true }).waitFor();
  assert.deepEqual(askRequests, [{ question: 'When is payment due?' }]);

  await page.goto(`${baseUrl}/portal/documents/e2e-chain-failure`);
  await page.getByRole('heading', { name: 'e2e-chain-failure' }).waitFor();
  await page.getByRole('button', { name: 'Finalize' }).click();
  await page.getByRole('button', { name: 'Confirm finalization' }).click();
  await page.getByRole('alert').filter({ hasText: 'Blockchain rejected this finalization fixture.' }).waitFor();
  assert.equal(await page.getByRole('dialog', { name: 'Confirm finalization' }).getByRole('button', { name: 'Confirm finalization' }).isDisabled(), false);

  await page.goto(`${baseUrl}/portal/upload/processing?id=e2e-processing-failure`);
  await page.getByText('Processing failed', { exact: true }).waitFor();
  assert.equal(finalizePosts.length, 1, 'a processing failure happens after finalization and cannot repeat the finalize POST');

  await page.goto(`${baseUrl}/portal/documents/e2e-lost-response`);
  await page.getByRole('heading', { name: 'e2e-lost-response' }).waitFor();
  await page.getByRole('button', { name: 'Finalize' }).click();
  await page.getByRole('button', { name: 'Confirm finalization' }).click();
  await page.getByText('Finalization outcome unknown.', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'Check status' }).click();
  await page.getByText('Status is inconclusive.', { exact: false }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Check status' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Finalize' }).count(), 0);
  await page.getByRole('button', { name: 'Check status' }).click();
  await page.getByText('Status is inconclusive.', { exact: false }).waitFor();
  assert.equal(finalizePosts.filter((id) => id === 'e2e-lost-response').length, 1, 'refresh and GET SIGNED must not submit finalize again');

  assert.ok(detailFingerprints.every((fingerprint) => fingerprint === signedFingerprint));
  console.log('Signed PDF finalization browser checks passed: fixture-only signed fingerprint, pending one-shot finalization and actual response, queued/review/completed processing, extraction edit/approval, reviewed-text Search and Ask, distinct chain and processing failures, and timeout/refresh GET-only recovery. No live backend or blockchain was contacted.');
} finally {
  await browser.close();
}
