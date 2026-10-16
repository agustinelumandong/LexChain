import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const pageErrors = [];
const page = await browser.newPage();
let uploadStatus = 422;
let uploadRequests = 0;
let logoutRequests = 0;
let loginDocumentRequests = 0;
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('request', (request) => {
  if (request.isNavigationRequest() && new URL(request.url()).pathname === '/login') loginDocumentRequests += 1;
});

try {
  await page.context().addCookies([
    { name: 'portal_token', value: 'session-recovery-e2e', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);
  await page.route('**/api/portal/logout', async (route) => {
    logoutRequests += 1;
    await route.continue();
  });
  await page.route('**/api/portal/proxy*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.searchParams.get('path') ?? '';
    if (path === '/documents/') {
      await route.fulfill({ status: 401, json: { message: 'Session expired.' } });
      return;
    }
    await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
  });

  await page.goto(`${baseUrl}/portal/documents`);
  await page.getByRole('heading', { name: /sign in/i }).waitFor();
  assert.equal(loginDocumentRequests, 1);
  assert.equal(logoutRequests, 1);

  const uploadPage = await browser.newPage();
  let uploadLoginRequests = 0;
  uploadPage.on('pageerror', (error) => pageErrors.push(error.message));
  uploadPage.on('request', (request) => {
    if (request.isNavigationRequest() && new URL(request.url()).pathname === '/login') uploadLoginRequests += 1;
  });
  await uploadPage.context().addCookies([
    { name: 'portal_token', value: 'session-recovery-e2e', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);
  await uploadPage.route('**/api/portal/proxy*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.searchParams.get('path') ?? '';
    if (path === '/users/') await route.fulfill({ status: 200, json: { role: 'document_issuer' } });
    else if (path === '/books/?limit=50&offset=0') await route.fulfill({ status: 200, json: [{ id: 'book-1', book_number: 1, series_year: 2026, status: 'OPEN' }] });
    else await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
  });
  await uploadPage.route('**/api/portal/proxy-post*', async (route) => {
    uploadRequests += 1;
    if (uploadStatus === 422) {
      await route.fulfill({ status: 422, json: { message: 'The register page is unavailable.', details: { errors: [{ field: 'page_no', message: 'Choose another page.' }] } } });
    } else if (uploadStatus === 403) {
      await route.fulfill({ status: 403, json: { message: 'You cannot file this document.' } });
    } else {
      await route.fulfill({ status: 404, json: { message: 'Register book not found.' } });
    }
  });

  await uploadPage.goto(`${baseUrl}/portal/upload`);
  await uploadPage.getByRole('button', { name: 'Register book' }).click();
  await uploadPage.getByRole('option', { name: /Register book 1/ }).click();
  await uploadPage.getByLabel('Enter paper register numbers').check();
  await uploadPage.getByLabel('Document title').fill('Recovery deed');
  await uploadPage.getByLabel('Paper document number').fill('28');
  await uploadPage.getByLabel('Paper page number').fill('6');
  await uploadPage.locator('input[type="file"]').setInputFiles({ name: 'recovery.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 recovery') });

  await uploadPage.getByRole('button', { name: 'Confirm and file' }).click();
  await uploadPage.getByRole('alert').filter({ hasText: 'The register page is unavailable.' }).waitFor();
  await uploadPage.getByText('Choose another page.').waitFor();
  assert.equal(await uploadPage.getByLabel('Paper page number').inputValue(), '6');
  assert.equal(await uploadPage.locator('input[type="file"]').evaluate((input) => input.files?.[0]?.name), 'recovery.pdf');

  for (const [status, message] of [[403, 'You cannot file this document.'], [404, 'Register book not found.']]) {
    uploadStatus = status;
    await uploadPage.getByRole('button', { name: 'Confirm and file' }).click();
    await uploadPage.getByRole('alert').filter({ hasText: message }).waitFor();
    assert.equal(new URL(uploadPage.url()).pathname, '/portal/upload');
    assert.equal(await uploadPage.getByLabel('Paper page number').inputValue(), '6');
  }

  assert.equal(loginDocumentRequests, 1);
  assert.equal(uploadLoginRequests, 0);
  assert.equal(logoutRequests, 1);
  assert.equal(uploadRequests, 3);
  assert.deepEqual(pageErrors, []);
  console.log('Session recovery browser checks passed: rejected portal cookie logs out and navigates once to sign-in; upload validation retains values; 403/404 preserve the page without sign-in navigation. Backend responses were stubbed.');
} finally {
  await browser.close();
}
