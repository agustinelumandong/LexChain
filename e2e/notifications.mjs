import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const pageErrors = [];
const requests = [];
const unexpectedRequests = [];
const notifications = [
  { id: 'document-ready', type: 'document_processed', title: 'Document ready', body: 'The document is ready.', is_read: false, created_at: '2026-10-18T08:00:00.000Z', event_metadata: { document_id: 'document_1' } },
  { id: 'draft-ready', type: 'draft_comment', title: 'Draft comment', body: 'A draft comment is ready.', is_read: false, created_at: '2026-10-18T08:01:00.000Z', event_metadata: { draft_url: 'https://docs.google.com/document/d/draft123/edit' } },
  { id: 'draft-fallback', type: 'draft_reply', title: 'Draft fallback', body: 'This draft has no safe URL.', is_read: true, created_at: '2026-10-18T08:02:00.000Z', event_metadata: { draft_url: 'https://evil.example/document/d/unsafe', document_id: 'document_2' } },
  { id: 'missing-metadata', type: 'document_failed', title: 'Missing metadata', body: 'This notification has no destination.', is_read: false, created_at: '2026-10-18T08:03:00.000Z' },
  { id: 'malformed-metadata', type: 'document_processed', title: 'Malformed metadata', body: 'This notification has an unsafe ID.', is_read: false, created_at: '2026-10-18T08:04:00.000Z', event_metadata: { document_id: '../unsafe' } },
  { id: 'unknown-type', type: 'unknown_event', title: 'Unknown event', body: 'This event has no known destination.', is_read: false, created_at: '2026-10-18T08:05:00.000Z', event_metadata: { document_id: 'document_1' } },
];
let arrived = false;
let arrivedListResponses = 0;
let failedDocumentRead = false;
const itemReadAttempts = new Map();

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(30_000);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.context().addCookies([
    { name: 'portal_token', value: 'notifications-e2e', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);
  await page.route('**/api/portal/proxy*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.searchParams.get('path') ?? '';
    requests.push(`${route.request().method()} ${path}`);
    if (path === '/notifications/' || path === '/notifications') {
      const response = arrived ? [...notifications, { id: 'arrived-notification', type: 'document_recorded', title: 'New document', body: 'A document arrived while the portal was open.', is_read: false, created_at: '2026-10-18T08:06:00.000Z', event_metadata: { document_id: 'document_3' } }] : notifications;
      if (arrived) arrivedListResponses += 1;
      await route.fulfill({ status: 200, json: { notifications: response, total: response.length } });
      return;
    }
    if (path === '/notifications/unread-count') {
      await route.fulfill({ status: 200, json: { unread: notifications.filter((notification) => !notification.is_read).length + Number(arrived) } });
      return;
    }
    if (path === '/users/') {
      await route.fulfill({ status: 200, json: { role: 'document_issuer' } });
      return;
    }
    if (path.startsWith('/documents/')) {
      if (path === '/documents/') {
        await route.fulfill({ status: 200, json: [] });
        return;
      }
      await route.fulfill({ status: 404, json: { message: 'Document not found.' } });
      return;
    }
    unexpectedRequests.push(`GET ${path}`);
    await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
  });
  await page.route('**/api/portal/proxy-post*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.searchParams.get('path') ?? '';
    requests.push(`${route.request().method()} ${path}`);
    if (path === '/notifications/read-all') {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    const match = path.match(/^\/notifications\/([^/]+)\/read$/);
    assert.ok(match, `Unexpected notification mutation path: ${path}`);
    const id = match[1];
    itemReadAttempts.set(id, (itemReadAttempts.get(id) ?? 0) + 1);
    if (id === 'missing-metadata' && !failedDocumentRead) {
      failedDocumentRead = true;
      await route.fulfill({ status: 503, json: { message: 'Notification read failed.' } });
      return;
    }
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto(`${baseUrl}/portal/notifications`);
  await page.getByRole('heading', { name: 'Notifications', exact: true }).waitFor();
  await page.clock.install();
  const documentLink = page.getByRole('link', { name: /Document ready/ });
  assert.equal(await documentLink.getAttribute('href'), '/portal/documents/document_1');
  const draftLink = page.getByRole('link', { name: /Draft comment/ });
  assert.equal(await draftLink.getAttribute('href'), 'https://docs.google.com/document/d/draft123/edit');
  assert.equal(await draftLink.getAttribute('rel'), 'noreferrer');
  assert.equal(await page.getByRole('link', { name: /Draft fallback/ }).getAttribute('href'), '/portal/documents/document_2');
  for (const title of ['Missing metadata', 'Malformed metadata', 'Unknown event']) {
    assert.equal(await page.getByRole('link', { name: new RegExp(title) }).count(), 0);
    assert.equal(await page.getByRole('button', { name: `Mark ${title} as read` }).count(), 1);
  }

  const [draftPage] = await Promise.all([page.waitForEvent('popup'), draftLink.click()]);
  assert.equal(new URL(draftPage.url()).hostname, 'docs.google.com');
  await draftPage.close();
  assert.equal(itemReadAttempts.get('draft-ready'), 1);
  assert.equal(requests.filter((request) => request === 'PATCH /notifications/read-all').length, 0);

  arrived = true;
  await page.clock.fastForward(45_000);
  await page.getByRole('link', { name: /New document/ }).waitFor();
  assert.ok(arrivedListResponses > 0, 'the active shell or inbox list must refetch after 45 seconds');
  await page.getByRole('button', { name: 'View notifications' }).locator('span').filter({ hasText: '6' }).waitFor();
  await page.goto(`${baseUrl}/portal/dashboard`);
  await page.getByRole('button', { name: 'View notifications' }).click();
  const malformedMetadataLink = page.getByRole('link', { name: /Malformed metadata/ });
  assert.equal(await malformedMetadataLink.getAttribute('href'), '/portal/notifications');
  await malformedMetadataLink.click();
  await page.waitForURL('**/portal/notifications');
  assert.equal(itemReadAttempts.get('malformed-metadata'), 1);
  await page.getByRole('button', { name: 'View notifications' }).click();

  const missingMetadataButton = page.getByRole('button', { name: 'Mark Missing metadata as read' });
  await missingMetadataButton.click();
  await page.getByRole('alert').filter({ hasText: 'Notification read failed.' }).waitFor();
  assert.equal(await missingMetadataButton.count(), 1, 'a failed read must leave the notification available to retry');
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === 'PATCH' && new URL(response.url()).searchParams.get('path') === '/notifications/missing-metadata/read'),
    missingMetadataButton.click(),
  ]);
  assert.equal(itemReadAttempts.get('missing-metadata'), 2);

  await page.getByRole('link', { name: /Document ready/ }).click();
  await page.waitForURL('**/portal/documents/document_1');
  assert.equal(itemReadAttempts.get('document-ready'), 1);
  await page.getByRole('button', { name: 'View notifications' }).waitFor();
  assert.equal(requests.filter((request) => request === 'PATCH /notifications/read-all').length, 0);

  await page.goto(`${baseUrl}/portal/notifications`);
  await page.getByRole('heading', { name: 'Notifications', exact: true }).waitFor();
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === 'PATCH' && new URL(response.url()).searchParams.get('path') === '/notifications/read-all'),
    page.getByRole('button', { name: 'Mark all as read' }).click(),
  ]);
  assert.equal(requests.filter((request) => request === 'PATCH /notifications/read-all').length, 1);
  assert.equal(requests.filter((request) => request === 'PATCH /notifications/document-ready/read').length, 1);

  await page.waitForLoadState('networkidle');
  const notificationPolls = () => requests.filter((request) => request === 'GET /notifications/' || request === 'GET /notifications/unread-count').length;
  const pollsBeforeLeaving = notificationPolls();
  await page.goto(`${baseUrl}/login`);
  await page.clock.fastForward(90_000);
  assert.equal(notificationPolls(), pollsBeforeLeaving, 'notification polling must stop after leaving the portal');
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(unexpectedRequests, []);
  console.log('Notifications browser checks passed: active 45-second polling, safe document/draft destinations and fallbacks, individual-read retry, separate read-all, and polling cleanup. Portal API responses were intercepted; this is stubbed frontend behavior.');
} finally {
  await browser.close();
}
