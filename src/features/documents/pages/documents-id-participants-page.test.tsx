// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, Suspense } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import DocumentParticipantsPage from '@/features/documents/pages/documents-id-participants-page';

const { portalFetch, listDocumentParties, inviteDocumentParty, revokeDocumentParty, searchUserByEmail } = vi.hoisted(() => ({
  portalFetch: vi.fn(),
  listDocumentParties: vi.fn(),
  inviteDocumentParty: vi.fn(),
  revokeDocumentParty: vi.fn(),
  searchUserByEmail: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({ portalFetch }));
vi.mock('@/features/access', () => ({
  listDocumentParties,
  inviteDocumentParty,
  revokeDocumentParty,
  searchUserByEmail,
  isParticipantAccessCapabilityError: () => false,
}));

afterEach(cleanup);

const document: ApiSchema<'DocumentResponse'> = {
  document_id: 'doc-1',
  file_name: 'agreement.pdf',
  status: null,
  lifecycle: 'PREPARING',
  on_chain: false,
  draft_url: null,
  signed_copy: null,
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
    can_finalize: false,
    can_share: false,
    can_revoke: false,
  },
  created_at: '2026-10-16T00:00:00Z',
};

const party = {
  id: 'party-1',
  user_id: 'user-1',
  email: 'client@example.com',
  f_name: 'Client',
  l_name: 'Example',
  role: 'viewer',
  status: 'accepted',
  created_at: '2026-10-16T00:00:00Z',
};

const params = Promise.resolve({ id: 'doc-1' });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(createElement(
    Suspense,
    { fallback: createElement('p', null, 'Loading route') },
    createElement(QueryClientProvider, { client: queryClient },
      createElement(DocumentParticipantsPage, { params }),
    ),
  ));
}

async function showPage() {
  await act(async () => {
    renderPage();
  });
}

beforeEach(() => {
  portalFetch.mockReset().mockResolvedValue(document);
  listDocumentParties.mockReset().mockResolvedValue({ document_id: 'doc-1', issuer: party, parties: [party] });
  inviteDocumentParty.mockReset().mockResolvedValue(party);
  revokeDocumentParty.mockReset().mockResolvedValue({});
  searchUserByEmail.mockReset();
});

describe('DocumentParticipantsPage permissions', () => {
  it('loads document permissions on direct navigation and gates invite and revoke independently', async () => {
    portalFetch.mockResolvedValue({ ...document, permissions: { ...document.permissions, can_share: true, can_revoke: false } });
    await showPage();

    expect(await screen.findByRole('heading', { name: 'Participant management' })).toBeTruthy();
    expect(portalFetch).toHaveBeenCalledWith('/documents/doc-1');
    expect(listDocumentParties).toHaveBeenCalledWith('doc-1');
    expect(await screen.findByRole('heading', { name: 'Invite a participant' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull();
  });

  it('shows revoke without invite when only can_revoke is granted', async () => {
    portalFetch.mockResolvedValue({ ...document, permissions: { ...document.permissions, can_revoke: true } });
    await showPage();

    expect(await screen.findByRole('button', { name: 'Revoke' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Invite a participant' })).toBeNull();
  });

  it('keeps invite available when participant listing fails but can_share is granted', async () => {
    portalFetch.mockResolvedValue({ ...document, permissions: { ...document.permissions, can_share: true } });
    listDocumentParties.mockRejectedValue(new Error('API error: 500'));
    await showPage();

    expect(await screen.findByRole('heading', { name: 'Invite a participant' })).toBeTruthy();
    expect(await screen.findByText('Unable to load document participants. Please try again.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull();
  });

  it('shows no management actions when permissions deny both capabilities', async () => {
    await showPage();

    expect(await screen.findByText('Your account does not have sharing or revocation permission for this document.')).toBeTruthy();
    expect(listDocumentParties).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Invite a participant' })).toBeNull();
  });

  it('keeps management actions hidden while document permissions are loading', async () => {
    portalFetch.mockReturnValue(new Promise(() => undefined));
    await showPage();

    expect(screen.getByRole('status', { name: 'Loading participant permissions' })).toBeTruthy();
    expect(listDocumentParties).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Revoke' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Invite a participant' })).toBeNull();
  });

  it('keeps management actions hidden when document permissions fail to load', async () => {
    portalFetch.mockRejectedValue(new Error('API error: 500'));
    await showPage();

    expect(await screen.findByText('Document permissions could not be verified, so participant access is unavailable.')).toBeTruthy();
    expect(listDocumentParties).not.toHaveBeenCalled();
  });
});
