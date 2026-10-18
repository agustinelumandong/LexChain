import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
const pageErrors = [];
const documentId = 'doc-119';
const document = {
  document_id: documentId,
  file_name: 'Shared deed',
  lifecycle: 'SIGNED',
  status: 'COMPLETED',
  on_chain: true,
  signed_copy: null,
  created_at: '2026-10-16T00:00:00Z',
  permissions: {
    can_view: true, can_rename: false, can_create_draft: false, can_mark_ready: false,
    can_reopen: false, can_attach_signed_copy: false, can_replace_signed_copy: false,
    can_correct_entry: false, can_cancel: false, can_finalize: false,
    can_share: false, can_revoke: false,
  },
};
const party = {
  id: 'party-1', user_id: 'client-1', document_id: documentId,
  email: 'client@example.test', f_name: 'Client', l_name: 'One',
  role: 'viewer', status: 'accepted', created_at: '2026-10-16T00:00:00Z',
};

function installErrorCheck(page) {
  page.on('pageerror', (error) => pageErrors.push(error.message));
}

function installCommonRoutes(context, role, permissions) {
  return context.route('**/api/portal/proxy*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.searchParams.get('path') ?? '';
    if (path === '/users/') {
      await route.fulfill({ status: 200, json: { email: `${role}@example.test`, f_name: role, l_name: 'Test', avatar: 'icon1', role } });
    } else if (path === `/documents/${documentId}`) {
      if (role === 'user' && !clientAccepted) {
        await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      } else {
        await route.fulfill({ status: 200, json: { ...document, permissions } });
      }
    } else if (path.startsWith('/users/search?')) {
      await route.fulfill({ status: 404, json: { message: 'Account not found' } });
    } else if (path === '/documents/invitations/mine') {
      await route.fulfill({ status: 200, json: { invitations: clientInvitations, total: clientInvitations.length } });
    } else {
      await route.fulfill({ status: 404, json: { message: `Unexpected GET ${path}` } });
    }
  });
}

let clientAccepted = false;
let acceptAttempts = 0;
let clientInvitations = [
  { invitation_id: 'invite-decline', document_id: 'doc-declined', file_name: 'Declined deed', role: 'viewer', status: 'pending', invited_at: '2026-10-16T00:00:00Z' },
  { invitation_id: 'invite-accept', document_id: documentId, file_name: document.file_name, role: 'viewer', status: 'pending', invited_at: '2026-10-16T00:00:00Z' },
];

try {
  const lawyer = await browser.newContext();
  const lawyerPage = await lawyer.newPage();
  installErrorCheck(lawyerPage);
  await lawyer.addCookies([
    { name: 'portal_token', value: 'issue-119-lawyer', url: baseUrl },
    { name: 'user_role', value: 'lawyer', url: baseUrl },
  ]);

  // Direct entry must fetch document capabilities and apply the independent flags.
  await installCommonRoutes(lawyer, 'lawyer', { ...document.permissions, can_share: true, can_revoke: false });
  await lawyer.route(`**/api/portal/documents/${documentId}/parties`, async (route) => route.fulfill({ status: 200, json: { document_id: documentId, issuer: party, parties: [party] } }));
  await lawyerPage.goto(`${baseUrl}/portal/documents/${documentId}/participants`);
  await lawyerPage.getByRole('heading', { name: 'Invite a participant' }).waitFor();
  assert.equal(await lawyerPage.getByRole('button', { name: 'Revoke' }).count(), 0);
  assert.deepEqual(await lawyerPage.getByLabel('Permission').locator('option').allTextContents(), ['Viewer', 'Signer', 'Editor']);

  // Unknown accounts cannot be invited and the entered email remains visible.
  await lawyerPage.getByLabel('Email').fill('missing@example.test');
  await lawyerPage.getByRole('button', { name: 'Find account' }).click();
  await lawyerPage.getByText('No account found. Invitations can only be sent to existing accounts.').waitFor();
  assert.equal(await lawyerPage.getByRole('button', { name: 'Send invitation' }).isDisabled(), true);
  assert.equal(await lawyerPage.getByLabel('Email').inputValue(), 'missing@example.test');

  // Reload as a separate lawyer page with revoke only.
  await lawyerPage.unroute('**/api/portal/proxy*');
  await installCommonRoutes(lawyer, 'lawyer', { ...document.permissions, can_share: false, can_revoke: true });
  await lawyerPage.goto(`${baseUrl}/portal/documents/${documentId}/participants`);
  await lawyerPage.getByRole('button', { name: 'Revoke' }).waitFor();
  assert.equal(await lawyerPage.getByRole('heading', { name: 'Invite a participant' }).count(), 0);
  await lawyer.close();

  // Client session starts without document access and retains decline behavior.
  const client = await browser.newContext();
  const clientPage = await client.newPage();
  installErrorCheck(clientPage);
  await client.addCookies([
    { name: 'portal_token', value: 'issue-119-client', url: baseUrl },
    { name: 'user_role', value: 'user', url: baseUrl },
  ]);
  await installCommonRoutes(client, 'user', document.permissions);
  await client.route('**/api/portal/proxy-post*', async (route) => {
    const path = new URL(route.request().url()).searchParams.get('path') ?? '';
    const match = path.match(/^\/documents\/invitations\/([^/]+)\/(accept|decline)$/);
    if (!match) return route.fulfill({ status: 404, json: { message: `Unexpected POST ${path}` } });
    const [, invitationId, action] = match;
    if (action === 'accept' && acceptAttempts++ === 0) {
      await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      return;
    }
    if (action === 'accept') clientAccepted = true;
    clientInvitations = clientInvitations.filter((invitation) => invitation.invitation_id !== invitationId);
    await route.fulfill({ status: 204, body: '' });
  });

  await clientPage.goto(`${baseUrl}/portal/documents/${documentId}`);
  await clientPage.getByRole('alert').filter({ hasText: 'You do not have access to this document.' }).waitFor();
  await clientPage.goto(`${baseUrl}/portal/invitations`);
  await clientPage.getByRole('heading', { name: 'Invitations' }).waitFor();
  await clientPage.getByRole('button', { name: 'Decline' }).first().click();
  await clientPage.getByText('Declined deed').waitFor({ state: 'detached' });
  assert.equal(new URL(clientPage.url()).pathname, '/portal/invitations');
  await clientPage.getByRole('button', { name: 'Accept' }).click();
  await clientPage.getByRole('alert').filter({ hasText: 'Forbidden' }).waitFor();
  assert.equal(new URL(clientPage.url()).pathname, '/portal/invitations');
  await clientPage.getByRole('button', { name: 'Accept' }).click();
  await clientPage.waitForURL(`**/portal/documents/${documentId}`);
  await clientPage.getByRole('heading', { name: document.file_name }).waitFor();
  assert.deepEqual(pageErrors, []);
  await client.close();

  console.log('Document permissions browser checks passed in isolated lawyer/client sessions: direct permission loading, independent share/revoke flags, nonexistent-account handling, decline stays in invitations, and accepted-only document access. Backend calls were stubbed; deployed role support was not verified.');
} finally {
  await browser.close();
}
