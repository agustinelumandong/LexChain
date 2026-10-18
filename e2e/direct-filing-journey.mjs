import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const origin = new URL(baseUrl).origin;
const browser = await chromium.launch();
const pageErrors = [];
const requests = [];
const documentId = 'e2e-direct-open';
const txHash = `0x${'ab'.repeat(32)}`;
let uploadMode = 'open';
let docLifecycle = 'SIGNED';
let processingStatus = null;
let verificationRequests = 0;
let successfulAttachment;
let extractionText = 'Directly filed extracted text.';
let extractionApproved = false;

const books = [
  { id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' },
  { id: 'closed-book', book_number: 4, series_year: 2025, status: 'CLOSED' },
];

function documentFixture(lifecycle = docLifecycle) {
  const finalized = lifecycle === 'FINALIZED';
  return {
    document_id: documentId,
    file_name: 'Directly filed deed',
    lifecycle,
    status: finalized ? processingStatus : null,
    on_chain: finalized,
    doc_no: 21,
    page_no: 1,
    signed_copy: {
      id: 'e2e-direct-copy', storage_url: 'https://fixtures.example.test/signed.pdf',
      original_filename: 'signed.pdf', content_type: 'application/pdf', size_bytes: 20,
      sha256: 'e2e-synthetic-hash', is_current: true, created_at: '2026-10-18T00:00:00Z',
    },
    created_at: '2026-10-18T00:00:00Z',
    finalized_at: finalized ? '2026-10-18T00:01:00Z' : null,
    permissions: {
      can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: false,
      can_reopen: false, can_attach_signed_copy: false, can_replace_signed_copy: false,
      can_correct_entry: false, can_cancel: false, can_finalize: !finalized,
      can_share: false, can_revoke: false,
    },
  };
}

function extractionFixture() {
  return { extraction_id: `${documentId}-extraction`, document_id: documentId, storage_url: 'https://fixtures.example.test/signed.pdf', engine: 'fixture-ocr', page_count: 1, confidence_avg: 0.9,
    blocks: [{ index: 0, editable: true, type: 'text', text: extractionText, original_text: 'Directly filed extracted text.', bbox: [10, 10, 500, 100], page_idx: 0, text_level: 0, score: 0.9, is_html: false, edited: extractionText !== 'Directly filed extracted text.' }],
    is_reviewed: extractionApproved, reviewed_by: extractionApproved ? 'fixture-lawyer' : null,
    reviewed_at: extractionApproved ? '2026-10-18T00:02:00Z' : null, status: extractionApproved ? 'COMPLETED' : 'AWAITING_REVIEW', flag_count: 0, flags: [], high_severity_count: 0, edited_block_count: Number(extractionText !== 'Directly filed extracted text.'), content_hash: extractionApproved ? 'fixture-content-hash' : null };
}

try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(60_000);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await context.addCookies([
    { name: 'portal_token', value: 'direct-filing-journey-e2e', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    const path = url.searchParams.get('path') ?? '';
    const post = url.pathname.endsWith('/proxy-post');

    if (post) {
      if (path.startsWith('/documents/upload?')) {
        requests.push({ path, body: request.postDataBuffer()?.toString('latin1') ?? '' });
        if (uploadMode === 'conflict') {
          return route.fulfill({ status: 409, json: {
            message: 'A signed copy is expected for an existing document.',
            details: { reason: 'READY_FOR_SIGNATURE_EXISTS', related_documents: [{
              document_id: 'prepared-doc', file_name: 'Prepared deed', parties: [],
            }], errors: [] },
          } });
        }
        if (uploadMode === 'duplicate') {
          return route.fulfill({ status: 409, json: {
            message: 'This PDF is already filed.',
            details: { reason: 'DUPLICATE_FILE', document_id: 'existing-doc' },
          } });
        }
        const closed = uploadMode === 'closed';
        return route.fulfill({ status: 201, json: {
          document_id: closed ? 'e2e-direct-closed' : documentId,
          file_name: closed ? 'Closed book deed' : 'Directly filed deed', lifecycle: 'SIGNED', status: null,
          book_id: closed ? 'closed-book' : 'open-book', doc_no: closed ? 12 : 21, page_no: closed ? 24 : 1,
        } });
      }
      if (path.startsWith('/documents/prepared-doc/signed-copy?')) {
        successfulAttachment = { path, body: request.postDataBuffer()?.toString('latin1') ?? '' };
        return route.fulfill({ status: 200, json: { document_id: 'prepared-doc', file_name: 'Prepared deed', lifecycle: 'SIGNED', status: null, book_id: 'open-book', doc_no: 8, page_no: 1 } });
      }
      if (path === `/documents/${documentId}/finalize`) {
        docLifecycle = 'FINALIZED';
        processingStatus = 'AWAITING_REVIEW';
        return route.fulfill({ status: 200, json: {
          document_id: documentId, onchain_document_id: 'e2e-synthetic-chain-id',
          data_hash: 'e2e-synthetic-hash', tx_hash: txHash,
        } });
      }
      if (path === `/documents/${documentId}/extraction` && request.method() === 'PATCH') {
        for (const edit of request.postDataJSON().edits) extractionText = edit.text;
        return route.fulfill({ status: 200, json: extractionFixture() });
      }
      if (path === `/documents/${documentId}/extraction/approve`) {
        extractionApproved = true;
        processingStatus = 'COMPLETED';
        return route.fulfill({ status: 200, json: { extraction_id: `${documentId}-extraction`, content_hash: 'fixture-content-hash', status: 'COMPLETED', is_reviewed: true } });
      }
      return route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    }

    if (url.pathname === '/api/portal/proxy' && request.method() === 'GET') {
      if (path === '/users/') return route.fulfill({ status: 200, json: { role: 'document_issuer', f_name: 'E2E', l_name: 'Issuer' } });
      if (path === '/books/?limit=50&offset=0') return route.fulfill({ status: 200, json: books });
      if (path === `/documents/${documentId}`) return route.fulfill({ status: 200, json: documentFixture() });
      if (path === `/documents/${documentId}/verify`) {
        verificationRequests += 1;
        return route.fulfill({ status: 200, json: {
          document_id: documentId, file_name: 'Directly filed deed', status: 'AUTHENTIC',
          is_authentic: true, baseline_trusted: true, tx_hash: txHash,
          verified_at: '2026-10-18T00:02:00Z', message: 'Mocked verification result.',
        } });
      }
      if (path === `/documents/${documentId}/extraction`) return route.fulfill({ status: 200, json: extractionFixture() });
      if (path === '/documents/prepared-doc') return route.fulfill({ status: 200, json: { ...documentFixture('SIGNED'), document_id: 'prepared-doc', file_name: 'Prepared deed', book_id: 'open-book', permissions: { ...documentFixture('SIGNED').permissions, can_attach_signed_copy: false } } });
      if (path === '/documents/prepared-doc/signed-copies') return route.fulfill({ status: 200, json: { document_id: 'prepared-doc', copies: [{ id: 'attached-copy', storage_url: 'https://fixtures.example.test/signed.pdf', original_filename: 'signed.pdf', content_type: 'application/pdf', size_bytes: 20, sha256: 'synthetic-hash', is_current: true, created_at: '2026-10-18T00:00:00Z' }] } });
      if (path === '/notifications/') return route.fulfill({ status: 200, json: { notifications: [], total: 0 } });
      if (path === '/notifications/unread-count') return route.fulfill({ status: 200, json: { unread: 0 } });
    }
    return route.fulfill({ status: 404, json: { message: `Unexpected ${request.method()} ${path}` } });
  });

  const pdf = { name: 'signed.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 synthetic browser fixture') };
  async function openUpload(mode, bookName) {
    uploadMode = mode;
    await page.goto(`${baseUrl}/portal/upload`);
    const book = page.getByRole('button', { name: 'Register book' });
    await book.waitFor({ state: 'visible' });
    await book.click();
    await page.getByRole('option', { name: new RegExp(`Register book ${bookName}`) }).click();
    await page.getByLabel('Document title').fill(mode === 'closed' ? 'Closed book deed' : 'Directly filed deed');
    await page.locator('input[type="file"]').setInputFiles(pdf);
  }

  // Open books assign register numbers automatically.
  await openUpload('open', 5);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByText('Document number 21 · Page 1', { exact: true }).waitFor();
  const openQuery = new URLSearchParams(requests[0].path.split('?')[1]);
  assert.equal(openQuery.get('book_id'), 'open-book');
  assert.equal(openQuery.has('doc_no'), false);
  assert.equal(openQuery.has('page_no'), false);
  await page.getByRole('button', { name: 'View document' }).click();
  await page.waitForURL(`**/portal/documents/${documentId}`);
  await page.getByRole('heading', { name: 'Directly filed deed', exact: true }).waitFor();

  await page.getByRole('button', { name: 'Finalize' }).click();
  await page.getByRole('dialog', { name: 'Confirm finalization' }).getByRole('button', { name: 'Confirm finalization' }).click();
  await page.getByRole('status').filter({ hasText: /finalization complete|finalized and anchored on-chain/i }).waitFor();
  await page.getByRole('tab', { name: 'Files' }).click();
  assert.equal(await page.getByRole('button', { name: 'Replace signed PDF' }).count(), 0, 'replacement is unavailable because this fixture denies can_replace_signed_copy');
  await page.goto(`${baseUrl}/portal/upload/processing?id=${documentId}`);
  await page.getByRole('link', { name: 'Review extracted text' }).waitFor();
  await page.getByRole('link', { name: 'Review extracted text' }).click();
  await page.getByRole('tab', { name: 'Raw' }).click();
  await page.getByRole('textbox', { name: 'Reviewed text for block 0' }).fill('Approved direct filing text.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Approve reviewed text' }).click();
  await page.getByRole('dialog', { name: 'Approve reviewed text?' }).getByRole('button', { name: 'Approve', exact: true }).click();
  await page.waitForURL(`**/portal/upload/processing?id=${documentId}`);
  await page.getByText('Processing is complete.', { exact: false }).waitFor();
  await page.goto(`${baseUrl}/portal/documents/${documentId}`);
  await page.getByRole('heading', { name: 'Directly filed deed', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Verify integrity', exact: true }).click();
  await page.waitForURL(`**/portal/documents/${documentId}/verify`);
  await page.getByRole('heading', { name: 'Document is authentic', exact: true }).waitFor();
  await page.getByText('Mock verification is simulated and does not represent a real backend or blockchain verification.', { exact: true }).waitFor();
  assert.equal(verificationRequests, 1);

  // Closed books require explicit register numbers before submission.
  await openUpload('closed', 4);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('alert').filter({ hasText: 'Enter the paper register document number.' }).waitFor();
  assert.equal(requests.length, 1, 'missing closed-book numbering must not submit an upload');
  await page.getByLabel('Paper document number').fill('12');
  await page.getByLabel('Paper page number').fill('24');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByText('Document number 12 · Page 24', { exact: true }).waitFor();
  const closedQuery = new URLSearchParams(requests[1].path.split('?')[1]);
  assert.equal(closedQuery.get('book_id'), 'closed-book');
  assert.equal(closedQuery.get('doc_no'), '12');
  assert.equal(closedQuery.get('page_no'), '24');

  // Existing prepared work can be chosen after the backend identifies a conflict.
  await openUpload('conflict', 5);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }).waitFor();
  await page.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }).click();
  await page.waitForURL('**/portal/documents/prepared-doc');
  await page.getByRole('heading', { name: 'Prepared deed', exact: true }).waitFor();
  assert.ok(successfulAttachment?.path.startsWith('/documents/prepared-doc/signed-copy?book_id=open-book'));
  assert.ok(successfulAttachment.body.includes('signed.pdf') && successfulAttachment.body.includes('%PDF-1.7 synthetic browser fixture'), 'attach-instead must submit the selected PDF successfully');

  // Duplicate PDFs provide a safe route to the existing record.
  await openUpload('duplicate', 5);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('alert').filter({ hasText: 'This PDF is already filed.' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'View existing document' }).getAttribute('href'), '/portal/documents/existing-doc');

  assert.deepEqual(pageErrors, []);
  await context.close();
  console.log('Direct filing journey passed with mocked backend responses: open-book automatic numbering, closed-book required numbering, successful conflict attach-instead, duplicate recovery, finalization, OCR review and approval, then verification. Replacement was permission-denied in this fixture. These checks do not prove live backend, OCR, or blockchain behavior.');
} finally {
  await browser.close();
}
