import assert from 'node:assert/strict';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const books = [
  { id: 'open-book', book_number: 5, series_year: 2026, status: 'OPEN' },
  { id: 'closed-book', book_number: 4, series_year: 2025, status: 'CLOSED' },
];
let document = {
  document_id: 'prepared-document',
  file_name: 'Prepared deed',
  lifecycle: 'PREPARING',
  status: null,
  on_chain: false,
  book_id: null,
  doc_no: null,
  page_no: null,
  signed_copy: null,
  draft_url: 'https://docs.google.com/document/d/draft',
  permissions: {
    can_view: true,
    can_rename: false,
    can_create_draft: false,
    can_mark_ready: true,
    can_reopen: false,
    can_attach_signed_copy: false,
    can_replace_signed_copy: false,
    can_correct_entry: false,
    can_cancel: false,
    can_finalize: false,
    can_share: false,
    can_revoke: false,
  },
};
const filingRequests = [];
let attachmentAttempts = 0;
const oversizedPdfPath = join(tmpdir(), `lexchain-oversized-${process.pid}.pdf`);

await context.addCookies([
  { name: 'portal_token', value: 'signed-filing-e2e', url: baseUrl },
  { name: 'user_role', value: 'lawyer', url: baseUrl },
]);
await page.route('**/api/portal/proxy*', async (route) => {
  const request = route.request();
  const requestUrl = new URL(request.url());
  const path = requestUrl.searchParams.get('path') ?? '';

  if (requestUrl.pathname.endsWith('/proxy-post')) {
    if (path === '/documents/prepared-document/ready') {
      document = { ...document, lifecycle: 'READY_FOR_SIGNATURE', permissions: { ...document.permissions, can_mark_ready: false, can_attach_signed_copy: true } };
      await route.fulfill({ status: 200, json: document });
      return;
    }

    if (path.startsWith('/documents/prepared-document/signed-copy?')) {
      filingRequests.push({ path, contentType: request.headers()['content-type'] ?? '', body: request.postDataBuffer()?.toString('latin1') ?? '' });
      attachmentAttempts += 1;
      if (attachmentAttempts === 1) {
        await route.fulfill({ status: 503, json: { message: 'Temporary storage failure' } });
        return;
      }
      document = {
        ...document,
        lifecycle: 'SIGNED',
        book_id: 'open-book',
        signed_copy: { id: 'copy-1', storage_url: 'https://example.test/signed.pdf', original_filename: 'signed.pdf', content_type: 'application/pdf', size_bytes: 20, sha256: 'hash', is_current: true, created_at: '2026-10-16T00:00:00Z' },
        permissions: { ...document.permissions, can_attach_signed_copy: false, can_replace_signed_copy: true },
      };
      await route.fulfill({ status: 200, json: document });
      return;
    }

    if (path.startsWith('/documents/upload?')) {
      filingRequests.push({ path, contentType: request.headers()['content-type'] ?? '', body: request.postDataBuffer()?.toString('latin1') ?? '' });
      const uploaded = { ...document, document_id: 'direct-upload', file_name: 'Direct deed', lifecycle: 'SIGNED', book_id: 'open-book' };
      document = uploaded;
      await route.fulfill({ status: 201, json: uploaded });
      return;
    }

    await route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    return;
  }

  if (path === '/users/') {
    await route.fulfill({ status: 200, json: { role: 'document_issuer' } });
  } else if (path === '/books/?limit=50&offset=0') {
    await route.fulfill({ status: 200, json: books });
  } else if (path === '/documents/prepared-document' || path === '/documents/direct-upload') {
    await route.fulfill({ status: 200, json: document });
  } else {
    await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
  }
});

try {
  await writeFile(oversizedPdfPath, Buffer.alloc(60 * 1024 * 1024 + 1));
  await page.goto(`${baseUrl}/portal/documents/prepared-document`);
  page.on('pageerror', (error) => console.error(`Browser error: ${error.message}`));
  try {
    await page.getByRole('tab', { name: 'Comments' }).waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    throw new Error(`Document screen did not load: ${await page.locator('body').innerText()}`);
  }
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByRole('button', { name: 'Mark ready for signature' }).click();
  await page.getByRole('tab', { name: 'Files' }).click();
  await page.getByRole('button', { name: 'Attach signed PDF' }).click();
  const bookSelect = page.getByRole('button', { name: 'Register book' });
  await bookSelect.waitFor({ state: 'visible' });
  await bookSelect.click();
  await page.getByRole('option', { name: /Register book 5/ }).click();
  const attachFile = { name: 'signed.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 signed copy') };
  await page.getByLabel('Signed PDF').setInputFiles(attachFile);
  await page.getByRole('button', { name: 'Confirm attachment' }).click();
  await page.getByRole('alert').filter({ hasText: 'Temporary storage failure' }).waitFor();
  assert.equal(await page.getByLabel('Signed PDF').evaluate((input) => input.files?.[0]?.name), 'signed.pdf');
  assert.match(await page.getByText(/selected file and filing details have been kept/i).textContent(), /kept/i);
  await page.getByRole('button', { name: 'Confirm attachment' }).click();
  await page.getByRole('status').filter({ hasText: 'Signed PDF attached.' }).waitFor();

  const attachmentRequest = filingRequests[1];
  assert.match(attachmentRequest.contentType, /^multipart\/form-data; boundary=/);
  assert.match(attachmentRequest.body, /filename="signed\.pdf"/);
  const attachmentQuery = new URLSearchParams(attachmentRequest.path.split('?')[1]);
  assert.equal(attachmentQuery.get('book_id'), 'open-book');
  assert.equal(attachmentQuery.has('doc_no'), false);
  assert.equal(attachmentQuery.has('page_no'), false);

  await page.goto(`${baseUrl}/portal/upload`);
  await page.getByRole('button', { name: 'Register book' }).waitFor({ state: 'visible' });
  const filePicker = page.locator('input[type="file"]');
  await filePicker.setInputFiles(oversizedPdfPath);
  await page.getByRole('alert').filter({ hasText: 'PDF files must be 60 MiB or smaller.' }).waitFor();
  assert.equal(filingRequests.length, 2);
  await page.getByRole('button', { name: 'Register book' }).click();
  await page.getByRole('option', { name: /Register book 5/ }).click();
  await page.getByLabel('Document title').fill('Open manual deed');
  await page.getByLabel('Enter paper register numbers').check();
  await page.getByLabel('Paper document number').fill('8');
  await page.getByLabel('Paper page number').fill('4');
  await filePicker.setInputFiles(attachFile);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.waitForURL('**/portal/documents/direct-upload');

  const directUploadRequest = filingRequests[2];
  assert.match(directUploadRequest.contentType, /^multipart\/form-data; boundary=/);
  assert.match(directUploadRequest.body, /filename="signed\.pdf"/);
  const directUploadQuery = new URLSearchParams(directUploadRequest.path.split('?')[1]);
  assert.equal(directUploadQuery.get('book_id'), 'open-book');
  assert.equal(directUploadQuery.get('doc_no'), '8');
  assert.equal(directUploadQuery.get('page_no'), '4');

  await page.goto(`${baseUrl}/portal/upload`);
  await page.getByRole('button', { name: 'Register book' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Register book' }).click();
  await page.getByRole('option', { name: /Register book 4/ }).click();
  await page.getByLabel('Document title').fill('Closed book deed');
  await filePicker.setInputFiles(attachFile);
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('alert').filter({ hasText: 'Enter the paper register document number.' }).waitFor();
  await page.getByLabel('Paper document number').fill('12');
  await page.getByLabel('Paper page number').fill('24');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.waitForURL('**/portal/documents/direct-upload');
  const closedUploadQuery = new URLSearchParams(filingRequests[3].path.split('?')[1]);
  assert.equal(closedUploadQuery.get('book_id'), 'closed-book');
  assert.equal(closedUploadQuery.get('doc_no'), '12');
  assert.equal(closedUploadQuery.get('page_no'), '24');
  assert.equal(filingRequests.some(({ path }) => path.includes('processing')), false);

  console.log('Signed filing browser checks passed: ready without a book, automatic attachment numbering, attachment retry, 60 MiB rejection, open-book manual and closed-book required numbering, and no OCR polling.');
} finally {
  await unlink(oversizedPdfPath).catch(() => {});
  await browser.close();
}
