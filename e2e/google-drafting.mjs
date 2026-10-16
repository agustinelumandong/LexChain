import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const requests = [];
const pageErrors = [];
let googleConnected = false;
let draftMode = 'reconnect';
let draftAttempts = 0;
page.on('pageerror', (error) => pageErrors.push(error.message));

let document = {
  document_id: 'doc-117',
  file_name: 'Prepared deed',
  lifecycle: 'PREPARING',
  status: null,
  on_chain: false,
  book_id: null,
  doc_no: null,
  page_no: null,
  draft_url: null,
  signed_copy: null,
  created_at: '2026-10-16T00:00:00Z',
  permissions: {
    can_view: true,
    can_rename: false,
    can_create_draft: true,
    can_mark_ready: false,
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

await context.addCookies([
  { name: 'portal_token', value: 'google-drafting-e2e', url: baseUrl },
  { name: 'user_role', value: 'lawyer', url: baseUrl },
]);

await page.route('https://apis.google.com/js/api.js', (route) => route.fulfill({
  status: 200,
  contentType: 'application/javascript',
  body: `
    window.__googlePickerAction = window.__googlePickerAction ?? 'picked';
    window.__googlePickerMimeTypes = '';
    window.__googlePickerSelection = window.__googlePickerSelection ?? 0;
    window.gapi = { load: (_name, callback) => callback() };
    window.google = { picker: {
      Action: { PICKED: 'picked', CANCEL: 'cancel' },
      ViewId: { DOCS: 'docs' },
      DocsView: class { setMimeTypes(types) { window.__googlePickerMimeTypes = types; return this; } },
      PickerBuilder: class {
        addView() { return this; }
        setOAuthToken() { return this; }
        setDeveloperKey() { return this; }
        setAppId() { return this; }
        setTitle() { return this; }
        setCallback(callback) { this.callback = callback; return this; }
        build() {
          return { setVisible: (visible) => {
            if (!visible) return;
            if (window.__googlePickerAction === 'cancel') this.callback({ action: 'cancel' });
            else {
              const id = window.__googlePickerSelection++ === 0 ? 'template-original' : 'template-replacement';
              this.callback({ action: 'picked', docs: [{ id, name: id === 'template-original' ? 'Client template' : 'Replacement template' }] });
            }
          } };
        }
      },
    } };
  `,
}));

const connectedCallback = `${baseUrl}/portal/profile/account?google=connected`;
const errorCallback = `${baseUrl}/portal/profile/account?google=error&message=access_denied`;
await page.route('https://accounts.google.com/**', (route) => route.fulfill({
  status: 200,
  contentType: 'text/html',
  body: `<!doctype html><html><body>
    <h1>Stubbed Google consent screen</h1>
    <button id="approve" onclick="location.href='${connectedCallback}'">Allow Google Drive</button>
    <button id="deny" onclick="location.href='${errorCallback}'">Cancel consent</button>
  </body></html>`,
}));

await page.route('**/api/portal/proxy*', async (route) => {
  const request = route.request();
  const requestUrl = new URL(request.url());
  const path = requestUrl.searchParams.get('path') ?? '';
  const isPostProxy = requestUrl.pathname.endsWith('/proxy-post');

  if (isPostProxy) {
    requests.push({ method: request.method(), path });
    if (path === '/google/connect' && request.method() === 'POST') {
      await route.fulfill({ status: 200, json: { authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?state=stubbed' } });
      return;
    }
    if (path === '/google/connection' && request.method() === 'DELETE') {
      googleConnected = false;
      await route.fulfill({ status: 200, json: { connected: false } });
      return;
    }
    if (path === '/documents/doc-117/draft' && request.method() === 'POST') {
      draftAttempts += 1;
      if (draftMode === 'reconnect' && draftAttempts === 1) {
        await route.fulfill({ status: 409, json: { message: 'Reconnect Google Drive.', details: { reason: 'GOOGLE_RECONNECT_REQUIRED' } } });
        return;
      }
      if (draftMode === 'expired') {
        await route.fulfill({ status: 400, json: { detail: 'The selected Google Doc is unavailable.' } });
        return;
      }
      document = {
        ...document,
        draft_url: 'https://docs.google.com/document/d/created-draft',
        permissions: { ...document.permissions, can_create_draft: false, can_mark_ready: true },
      };
      await route.fulfill({ status: 201, json: document });
      return;
    }
    await route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    return;
  }

  if (path === '/users/') await route.fulfill({ status: 200, json: { f_name: 'Avery', l_name: 'Lawyer', email: 'avery@example.test', role: 'lawyer' } });
  else if (path === '/google/connection') await route.fulfill({ status: 200, json: { connected: googleConnected } });
  else if (path === '/google/picker-token') await route.fulfill({ status: 200, json: { access_token: 'stub-picker-token', expires_at: '2099-01-01T00:00:00Z' } });
  else if (path === '/documents/doc-117') await route.fulfill({ status: 200, json: document });
  else if (path === '/documents/doc-117/comments') await route.fulfill({ status: 200, json: { document_id: 'doc-117', unresolved: 0, comments: [] } });
  else if (path.startsWith('/books/')) await route.fulfill({ status: 200, json: [] });
  else await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
});

try {
  await page.goto(`${baseUrl}/portal/documents/doc-117`);
  await page.getByRole('tab', { name: 'Files' }).click();
  await page.getByRole('combobox', { name: 'Draft source' }).selectOption('template');
  await page.getByRole('button', { name: 'Choose Google Doc' }).click();
  await page.getByText('Selected: Client template').waitFor();
  assert.equal(await page.evaluate(() => window.__googlePickerMimeTypes), 'application/vnd.google-apps.document');

  await page.evaluate(() => { window.__googlePickerAction = 'cancel'; });
  await page.getByRole('button', { name: 'Choose Google Doc' }).click();
  await page.getByText('Selected: Client template').waitFor();
  await page.getByRole('button', { name: 'Create draft from template' }).click();
  const connectLink = page.getByRole('link', { name: 'Connect Google in account settings' });
  await connectLink.waitFor();
  assert.equal(await connectLink.getAttribute('href'), '/portal/profile/account?google_draft_return=1');
  await connectLink.click();
  await page.waitForURL('**/portal/profile/account?google_draft_return=1');

  await page.getByRole('button', { name: 'Connect Google' }).click();
  const consentWarning = page.getByText("On Google's screen, tick the Google Drive permission.");
  const consentLink = page.getByRole('link', { name: 'Continue to Google' });
  await consentLink.waitFor();
  assert.equal(await consentWarning.evaluate((warning, link) => Boolean(warning.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING), await consentLink.elementHandle()), true);
  await consentLink.click();
  await page.waitForURL('https://accounts.google.com/**');
  googleConnected = true;
  await page.getByRole('button', { name: 'Allow Google Drive' }).click();
  await page.waitForURL('**/portal/documents/doc-117');
  assert.equal(draftAttempts, 1, 'returning from consent must not automatically create a draft');
  await page.waitForFunction(() => sessionStorage.getItem('lexchain:google-draft-return') === null);

  await page.getByRole('tab', { name: 'Files' }).click();
  assert.equal(await page.getByRole('combobox', { name: 'Draft source' }).inputValue(), 'template');
  await page.getByText('Selected: Client template').waitFor();
  draftMode = 'expired';
  await page.getByRole('button', { name: 'Create draft from template' }).click();
  await page.getByRole('alert').filter({ hasText: 'The selected Google Doc is unavailable.' }).waitFor();
  assert.equal(await page.getByRole('combobox', { name: 'Draft source' }).inputValue(), 'template');
  assert.equal(await page.getByText('Selected: Client template').count(), 0);

  draftMode = 'success';
  await page.evaluate(() => { window.__googlePickerAction = 'picked'; window.__googlePickerSelection = 1; });
  await page.getByRole('button', { name: 'Choose Google Doc' }).click();
  await page.getByText('Selected: Replacement template').waitFor();
  await page.getByRole('button', { name: 'Create draft from template' }).click();
  const draftLink = page.getByRole('link', { name: 'Open Google draft' });
  await draftLink.waitFor();
  assert.equal(await draftLink.getAttribute('target'), '_blank');
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByRole('button', { name: 'Mark ready for signature' }).waitFor();
  assert.equal(draftAttempts, 3);

  await page.goto(`${baseUrl}/portal/profile/account`);
  await page.getByRole('button', { name: 'Disconnect Google' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Disconnect Google' }).click();
  await page.getByText('Not connected').waitFor();
  await page.getByRole('dialog').waitFor({ state: 'detached' });

  const accountConnectButton = page.getByRole('button', { name: 'Connect Google' });
  assert.equal(await accountConnectButton.isEnabled(), true);
  await accountConnectButton.click();
  const accountConsentLink = page.getByRole('link', { name: 'Continue to Google' });
  await accountConsentLink.waitFor({ timeout: 8000 }).catch(async (error) => {
    console.error('Account-origin connection did not produce the consent link:', await page.locator('body').innerText(), requests.slice(-8), pageErrors);
    throw error;
  });
  await accountConsentLink.click();
  await page.waitForURL('https://accounts.google.com/**');
  await page.getByRole('button', { name: 'Cancel consent' }).click();
  await page.waitForURL('**/portal/profile/account?google=error&message=access_denied');
  await page.getByText('Google connection was cancelled. You can try again.').waitFor();

  await page.getByRole('button', { name: 'Connect Google' }).click();
  await page.getByRole('link', { name: 'Continue to Google' }).click();
  await page.waitForURL('https://accounts.google.com/**');
  googleConnected = true;
  await page.getByRole('button', { name: 'Allow Google Drive' }).click();
  await page.waitForURL('**/portal/profile/account?google=connected');
  await page.getByText('Google connected successfully.').waitFor();

  await page.evaluate(() => sessionStorage.setItem('lexchain:google-draft-return', JSON.stringify({
    documentId: 'doc-117',
    source: 'template',
    picked: { id: 'file-1', name: 'Template' },
    returnTo: 'https://attacker.example',
  })));
  await page.goto(`${baseUrl}/portal/profile/account?google=connected`);
  await page.getByText('Google connected successfully.').waitFor();
  assert.equal(new URL(page.url()).pathname, '/portal/profile/account', 'unsafe stored return data must not leave the account route');
  assert.deepEqual(pageErrors, []);

  console.log('Google drafting frontend browser check passed (OAuth, Picker, and Drive were stubbed; deployed GOOGLE_CONNECTED_REDIRECT was not verified).');
} finally {
  await browser.close();
}
