import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const requests = [];
const pageErrors = [];
let role = 'user';
let readyAttempts = 0;
let commentsSynced = false;
let document = {
  document_id: 'doc-118',
  file_name: 'Prepared deed',
  lifecycle: 'PREPARING',
  status: null,
  on_chain: false,
  draft_url: 'https://docs.google.com/document/d/draft-118',
  signed_copy: null,
  created_at: '2026-10-16T00:00:00Z',
  permissions: {
    can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: true, can_reopen: false,
    can_attach_signed_copy: false, can_replace_signed_copy: false, can_correct_entry: false,
    can_cancel: false, can_finalize: false, can_share: false, can_revoke: false,
  },
};
const initialComments = {
  document_id: 'doc-118', unresolved: 2, synced_at: '2026-10-16T00:00:00Z',
  comments: [{
    id: 'comment-1', author_name: 'Client Reviewer', author_user_id: null, is_lawyer: false,
    content: 'Please clarify this clause.', quoted_text: 'Payment is due immediately.', resolved: false,
    created_at: '2026-10-16T00:00:00Z', replies: [
      { author_name: 'Lawyer Reviewer', author_user_id: null, is_lawyer: true, content: 'Resolved in Google Docs.', action: 'resolve', created_at: '2026-10-16T00:01:00Z' },
      { author_name: 'Client Reviewer', is_lawyer: false, content: 'Reopened in Google Docs.', action: 'reopen', created_at: '2026-10-16T00:02:00Z' },
    ],
  }],
};
const resolvedComments = {
  ...initialComments, unresolved: 0, synced_at: '2026-10-16T00:05:00Z',
  comments: initialComments.comments.map((comment) => ({ ...comment, resolved: true })),
};
page.on('pageerror', (error) => pageErrors.push(error.message));

await context.addCookies([
  { name: 'portal_token', value: 'google-comments-e2e', url: baseUrl },
  { name: 'user_role', value: role, url: baseUrl },
]);

await page.route('**/api/portal/proxy*', async (route) => {
  const request = route.request();
  const requestUrl = new URL(request.url());
  const path = requestUrl.searchParams.get('path') ?? '';
  const isMutationProxy = requestUrl.pathname.endsWith('/proxy-post');

  if (isMutationProxy) {
    requests.push({ method: request.method(), path });
    if (path === '/documents/doc-118/comments/sync' && request.method() === 'POST') {
      commentsSynced = true;
      await route.fulfill({ status: 200, json: resolvedComments });
      return;
    }
    if (path === '/documents/doc-118/ready' && request.method() === 'POST') {
      readyAttempts += 1;
      if (readyAttempts === 1) {
        await route.fulfill({ status: 409, json: { message: 'Resolve 2 comments before marking ready.', details: {
          reason: 'UNRESOLVED_COMMENTS', unresolved: 2, draft_url: document.draft_url,
        } } });
        return;
      }
      document = { ...document, lifecycle: 'READY_FOR_SIGNATURE', permissions: { ...document.permissions, can_mark_ready: false, can_reopen: true } };
      await route.fulfill({ status: 200, json: document });
      return;
    }
    if (path === '/documents/doc-118/reopen' && request.method() === 'POST') {
      document = { ...document, lifecycle: 'PREPARING', permissions: { ...document.permissions, can_mark_ready: true, can_reopen: false } };
      await route.fulfill({ status: 200, json: document });
      return;
    }
    await route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    return;
  }

  if (path === '/users/') await route.fulfill({ status: 200, json: { f_name: 'Portal', l_name: 'Reviewer', email: 'reviewer@example.test', role } });
  else if (path === '/documents/doc-118') await route.fulfill({ status: 200, json: {
    ...document,
    permissions: {
      ...document.permissions,
      can_mark_ready: role === 'lawyer' && document.lifecycle === 'PREPARING',
      can_reopen: role === 'lawyer' && document.lifecycle === 'READY_FOR_SIGNATURE',
    },
  } });
  else if (path === '/documents/doc-118/comments') await route.fulfill({ status: 200, json: commentsSynced ? resolvedComments : initialComments });
  else if (path === '/documents/doc-118/signed-copies') await route.fulfill({ status: 200, json: { document_id: 'doc-118', copies: [] } });
  else if (path === '/documents/doc-118/history') await route.fulfill({ status: 200, json: { document_id: 'doc-118', events: [] } });
  else if (path.startsWith('/books/')) await route.fulfill({ status: 200, json: [] });
  else await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
});

try {
  await page.goto(`${baseUrl}/portal/documents/doc-118`);
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByText(/Leave feedback with comments \(select text → comment button\), not by typing in the document\./).waitFor();
  await page.getByText(/Google Docs suggestions are outside LexChain's comment mirror/).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Mark ready for signature' }).count(), 0);

  role = 'lawyer';
  await page.goto(`${baseUrl}/portal/documents/doc-118`);
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByText(/Check the draft for pending suggestions in Google Docs before marking it ready\./).waitFor();
  await page.getByText('Client Reviewer', { exact: true }).waitFor();
  await page.getByText('Payment is due immediately.').waitFor();
  await page.getByText(/Resolved thread/).waitFor();
  await page.getByText(/Reopened thread/).waitFor();
  await page.getByText('Please clarify this clause.').waitFor();

  await page.getByRole('button', { name: 'Mark ready for signature' }).click();
  await page.getByRole('alert').filter({ hasText: 'Resolve 2 comments before marking ready.' }).waitFor();
  await page.getByText('2 unresolved comments remain.').waitFor();
  const draftLink = page.getByRole('link', { name: 'Open Google draft to resolve comments' });
  assert.equal(await draftLink.getAttribute('href'), document.draft_url);

  await page.getByRole('button', { name: 'Sync comments' }).click();
  await page.getByText('Resolved in Google Docs.').waitFor();
  await page.getByText(/0 unresolved · Last synced/).waitFor();
  await page.getByRole('button', { name: 'Mark ready for signature' }).click();
  await page.getByRole('button', { name: 'Reopen draft' }).waitFor();
  role = 'user';
  await page.goto(`${baseUrl}/portal/documents/doc-118`);
  await page.getByRole('tab', { name: 'Comments' }).click();
  assert.equal(await page.getByRole('button', { name: 'Mark ready for signature' }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Reopen draft' }).count(), 0);
  role = 'lawyer';
  await page.goto(`${baseUrl}/portal/documents/doc-118`);
  await page.getByRole('tab', { name: 'Comments' }).click();
  await page.getByRole('button', { name: 'Reopen draft' }).click();
  await page.getByRole('button', { name: 'Mark ready for signature' }).waitFor();

  assert.deepEqual(requests.filter(({ path }) => /\/(reply|resolve|reopen-comment)(\/|$)/.test(path)), []);
  assert.deepEqual(pageErrors, []);
  console.log('Google comments frontend browser check passed (same-origin backend routes were stubbed; live backend and Google behavior were not verified).');
} finally {
  await browser.close();
}
