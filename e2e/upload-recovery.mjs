import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const books = [{ id: 'closed-book', book_number: 4, series_year: 2026, status: 'CLOSED' }];
const pageErrors = [];
const requests = [];
let uploadMode = 'ready';
let uploadAttempts = 0;
let attachmentAttempts = 0;
page.on('pageerror', (error) => pageErrors.push(error.message));

await context.addCookies([
  { name: 'portal_token', value: 'upload-recovery-e2e', url: baseUrl },
  { name: 'user_role', value: 'lawyer', url: baseUrl },
]);

await page.route('**/api/portal/proxy*', async (route) => {
  const request = route.request();
  const requestUrl = new URL(request.url());
  const path = requestUrl.searchParams.get('path') ?? '';

  if (requestUrl.pathname.endsWith('/proxy-post')) {
    requests.push({ path, body: request.postDataBuffer()?.toString('latin1') ?? '' });
    if (path.startsWith('/documents/upload?')) {
      uploadAttempts += 1;
      if (uploadMode === 'ready' && uploadAttempts === 1) {
        await route.fulfill({ status: 409, json: {
          message: 'A signed copy is expected for an existing document.',
          details: { reason: 'READY_FOR_SIGNATURE_EXISTS', related_documents: [{
            document_id: 'waiting-doc', file_name: 'Prepared deed',
            parties: [{ f_name: 'Avery', l_name: 'Reviewer', email: 'avery@example.com', role: 'signer' }],
          }], errors: [] },
        } });
        return;
      }
      if (uploadMode === 'new-record' && uploadAttempts === 1) {
        await route.fulfill({ status: 409, json: { message: 'A signed copy is expected.', details: { reason: 'READY_FOR_SIGNATURE_EXISTS', related_documents: [] } } });
        return;
      }
      if (uploadMode === 'new-record' && uploadAttempts === 2) {
        await route.fulfill({ status: 503, json: { message: 'Temporary filing failure.' } });
        return;
      }
      if (uploadMode === 'duplicate') {
        await route.fulfill({ status: 409, json: { message: 'This PDF is already filed.', details: { reason: 'DUPLICATE_FILE', document_id: 'duplicate-doc' } } });
        return;
      }
      if (uploadMode === 'conflict') {
        await route.fulfill({ status: 409, json: { message: 'The register page is full.', details: { reason: 'REGISTER_PAGE_FULL', errors: [{ field: 'page_no', message: 'Choose another page.' }] } } });
        return;
      }
      await route.fulfill({ status: 201, json: { document_id: 'new-doc', lifecycle: 'SIGNED', status: null } });
      return;
    }
    if (path.startsWith('/documents/waiting-doc/signed-copy?')) {
      attachmentAttempts += 1;
      if (attachmentAttempts === 1) {
        await route.fulfill({ status: 503, json: { message: 'Temporary storage failure.', details: { errors: [{ field: 'file', message: 'Storage is retrying.' }] } } });
      } else {
        await route.fulfill({ status: 200, json: { document_id: 'waiting-doc', lifecycle: 'SIGNED', status: null } });
      }
      return;
    }
    await route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    return;
  }

  if (path === '/users/') await route.fulfill({ status: 200, json: { role: 'document_issuer' } });
  else if (path === '/books/?limit=50&offset=0') await route.fulfill({ status: 200, json: books });
  else await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
});

async function startUpload(mode) {
  uploadMode = mode;
  uploadAttempts = 0;
  attachmentAttempts = 0;
  await page.goto(`${baseUrl}/portal/upload`);
  const book = page.getByRole('button', { name: 'Register book' });
  await book.waitFor({ state: 'visible' });
  await book.click();
  await page.getByRole('option', { name: /Register book 4/ }).click();
  await page.getByLabel('Document title').fill('Signed deed');
  await page.getByLabel('Paper document number').fill('12');
  await page.getByLabel('Paper page number').fill('3');
  await page.locator('input[type="file"]').setInputFiles({ name: 'signed.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 signed copy') });
}

try {
  await startUpload('ready');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }).waitFor();
  assert.match(await page.getByRole('group', { name: 'Upload recovery' }).innerText(), /Avery Reviewer.*avery@example\.com.*signer/);
  await page.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }).click();
  await page.getByRole('alert').filter({ hasText: 'Temporary storage failure.' }).first().waitFor();
  assert.equal(await page.locator('input[type="file"]').evaluate((input) => input.files?.[0]?.name), 'signed.pdf');
  assert.equal(await page.getByLabel('Paper document number').inputValue(), '12');
  await page.getByRole('button', { name: 'Attach signed PDF to Prepared deed' }).click();
  await page.waitForURL('**/portal/documents/waiting-doc');
  const attachRequest = requests.find(({ path }) => path.startsWith('/documents/waiting-doc/signed-copy?'));
  assert.match(attachRequest.body, /filename="signed\.pdf"/);
  assert.equal(new URLSearchParams(attachRequest.path.split('?')[1]).get('book_id'), 'closed-book');
  assert.equal(new URLSearchParams(attachRequest.path.split('?')[1]).get('doc_no'), '12');
  assert.equal(new URLSearchParams(attachRequest.path.split('?')[1]).get('page_no'), '3');

  await startUpload('new-record');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('button', { name: 'No, this is a new document' }).click();
  await page.getByRole('alert').filter({ hasText: 'Temporary filing failure.' }).waitFor();
  assert.equal(await page.locator('input[type="file"]').evaluate((input) => input.files?.[0]?.name), 'signed.pdf');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.waitForURL('**/portal/documents/new-doc');
  const newRecordPaths = requests.filter(({ path }) => path.startsWith('/documents/upload?')).slice(-3).map(({ path }) => path);
  assert.equal(new URLSearchParams(newRecordPaths[0].split('?')[1]).has('confirm_new_record'), false);
  assert.equal(new URLSearchParams(newRecordPaths[1].split('?')[1]).get('confirm_new_record'), 'true');
  assert.equal(new URLSearchParams(newRecordPaths[2].split('?')[1]).get('confirm_new_record'), 'true');

  await startUpload('duplicate');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('alert').filter({ hasText: 'This PDF is already filed.' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'View existing document' }).getAttribute('href'), '/portal/documents/duplicate-doc');

  await startUpload('conflict');
  await page.getByRole('button', { name: 'Confirm and file' }).click();
  await page.getByRole('alert').filter({ hasText: 'The register page is full.' }).waitFor();
  assert.match(await page.getByRole('alert').filter({ hasText: 'The register page is full.' }).innerText(), /page_no: Choose another page\./);
  assert.equal(await page.getByLabel('Paper page number').inputValue(), '3');
  assert.deepEqual(pageErrors, []);

  console.log('Upload recovery browser checks passed: waiting-document attach and retry, explicit new-record request and retry, duplicate link, and ordinary conflict validation.');
} finally {
  await browser.close();
}
