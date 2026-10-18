import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const origin = new URL(baseUrl).origin;
const documentId = 'e2e-document-verification';
const hash = 'a1'.repeat(32);
const document = {
  document_id: documentId,
  file_name: 'E2E finalized agreement',
  lifecycle: 'FINALIZED',
  status: 'COMPLETED',
  on_chain: false,
  signed_copy: null,
  created_at: '2026-10-18T00:00:00Z',
  permissions: {
    can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: false,
    can_reopen: false, can_attach_signed_copy: false, can_replace_signed_copy: false,
    can_correct_entry: false, can_cancel: false, can_finalize: false,
    can_share: false, can_revoke: false,
  },
};
const outcomes = [
  ['AUTHENTIC', 'Document is authentic'],
  ['TAMPERED', 'Document was tampered with'],
  ['SNAPSHOT_COMPROMISED', 'Trusted snapshot is compromised'],
  ['NOT_ANCHORED', 'Document is not anchored'],
  ['VERIFICATION_UNAVAILABLE', 'Integrity status unavailable'],
];
const browser = await chromium.launch();
const pageErrors = [];
const unexpectedRequests = [];
let verificationRequests = 0;
let status = 'AUTHENTIC';
let txHash = `0x${hash}`;

try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(60_000);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await context.addCookies([
    { name: 'portal_token', value: 'document-verification-e2e', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    // The portal imports this stylesheet; fonts are outside this behavior check.
    if (request.url() === 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Montserrat:wght@900&display=swap') {
      return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    }

    const path = url.searchParams.get('path');
    if (url.origin === origin && url.pathname === '/api/portal/proxy' && request.method() === 'GET') {
      if (path === `/documents/${documentId}/verify`) {
        verificationRequests += 1;
        return route.fulfill({ status: 200, json: {
          document_id: documentId,
          file_name: document.file_name,
          status,
          is_authentic: status === 'AUTHENTIC',
          baseline_trusted: status === 'AUTHENTIC' || status === 'TAMPERED',
          tx_hash: txHash,
          verified_at: '2026-10-18T00:01:00Z',
          message: status === 'VERIFICATION_UNAVAILABLE' ? 'Integrity is unknown because the current file could not be read.' : `Mocked ${status} result.`,
        } });
      }
      if (path === `/documents/${documentId}`) return route.fulfill({ status: 200, json: document });
      if (path === '/users/') return route.fulfill({ status: 200, json: { role: 'document_issuer', f_name: 'E2E', l_name: 'Issuer' } });
      if (path === '/documents/') return route.fulfill({ status: 200, json: [] });
      if (path === '/notifications/') return route.fulfill({ status: 200, json: { notifications: [], total: 0 } });
      if (path === '/notifications/unread-count') return route.fulfill({ status: 200, json: { unread: 0 } });
    }
    unexpectedRequests.push(`${request.method()} ${url.origin}${url.pathname}${url.search}`);
    return route.fulfill({ status: 500, json: { message: 'Unexpected browser-check request' } });
  });

  await page.goto(`${baseUrl}/portal/documents/${documentId}`);
  await page.getByRole('heading', { name: document.file_name, exact: true }).waitFor();
  const verifyAction = page.getByRole('link', { name: 'Verify integrity', exact: true });
  await verifyAction.waitFor();
  assert.equal(await verifyAction.getAttribute('href'), `/portal/documents/${documentId}/verify`);
  assert.equal(verificationRequests, 0);
  await verifyAction.click();
  await page.waitForURL(`**/portal/documents/${documentId}/verify`);

  for (const [outcome, heading] of outcomes) {
    if (outcome !== 'AUTHENTIC') {
      status = outcome;
      txHash = `0X0x${hash}`;
      await page.reload();
    }
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, `/portal/documents/${documentId}/verify`);
    const retryable = outcome === 'NOT_ANCHORED' || outcome === 'VERIFICATION_UNAVAILABLE';
    assert.equal(await page.getByRole('button', { name: 'Retry verification', exact: true }).count(), retryable ? 1 : 0);
    if (outcome === 'VERIFICATION_UNAVAILABLE') {
      assert.equal(await page.getByRole('heading', { name: 'Document was tampered with', exact: true }).count(), 0);
      await page.getByText('Integrity is unknown because the current file could not be read.', { exact: true }).waitFor();
    }
    const transactionLink = page.getByRole('link', { name: 'View transaction on Base Sepolia', exact: true });
    await transactionLink.waitFor();
    assert.equal(await transactionLink.getAttribute('href'), `https://sepolia.basescan.org/tx/0x${hash}`);
    assert.equal(await transactionLink.getAttribute('target'), '_blank');
    await page.getByRole('region', { name: 'Verification result' }).getByRole('button', { name: 'Copy', exact: true }).waitFor();
  }

  assert.equal(verificationRequests, outcomes.length);
  status = 'AUTHENTIC';
  await page.getByRole('button', { name: 'Retry verification', exact: true }).click();
  await page.getByRole('heading', { name: 'Document is authentic', exact: true }).waitFor();
  assert.equal(verificationRequests, outcomes.length + 1, 'One retry must make exactly one verification request');
  assert.equal(await page.getByRole('heading', { name: 'Integrity status unavailable', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Retry verification', exact: true }).count(), 0);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(unexpectedRequests, []);
  await context.close();
  console.log('Document verification browser checks passed: finalized on_chain:false action, five distinct outcomes, retry availability, unavailable-to-authentic retry request count, copy control, and canonical Base Sepolia links for prefixed/repeated-prefix hashes. Same-origin API responses were intercepted: this is mocked frontend evidence, not real backend or blockchain verification.');
} finally {
  await browser.close();
}
