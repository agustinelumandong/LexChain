// @vitest-environment jsdom
import { createElement, Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import DocumentDetailPage from '@/features/documents/pages/documents-id-page';

const { state } = vi.hoisted(() => ({
  state: {
    documentQuery: {} as Record<string, unknown>,
    profileQuery: {} as Record<string, unknown>,
    versionsQuery: {} as Record<string, unknown>,
    queryKeys: [] as string[][],
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: { queryKey: readonly unknown[] }[] }) => {
    state.queryKeys = queries.map(({ queryKey }) => queryKey.map(String));
    return [state.documentQuery, state.profileQuery];
  },
  useQuery: () => state.versionsQuery,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null }),
}));

vi.mock('@/features/portal/components', () => ({ PortalChatbot: () => null }));

type DocumentResponse = ApiSchema<'DocumentResponse'>;
const baseDocument: DocumentResponse = {
  document_id: 'doc-1',
  document_hash: 'record-hash',
  file_name: 'Signed agreement.pdf',
  lifecycle: 'SIGNED',
  status: null,
  on_chain: false,
  draft_url: 'https://docs.google.com/document/d/draft-1',
  signed_copy: {
    id: 'copy-1',
    storage_url: 'https://files.example.test/signed.pdf',
    sha256: 'abc123',
    content_type: 'application/pdf',
    size_bytes: 1024,
    is_current: true,
    created_at: '2026-10-08T10:00:00Z',
  },
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
  created_at: '2026-10-08T09:00:00Z',
};

function renderPage() {
  return render(createElement(
    Suspense,
    { fallback: createElement('p', null, 'Loading route') },
    createElement(DocumentDetailPage, { params: Promise.resolve({ id: 'doc-1' }) }),
  ));
}

async function showPage() {
  await act(async () => {
    renderPage();
  });
}

beforeEach(() => {
  state.documentQuery = { data: baseDocument, isLoading: false, isError: false, refetch: vi.fn() };
  state.profileQuery = { data: { role: 'document_issuer' }, isLoading: false, isError: false };
  state.versionsQuery = { data: { versions: [] }, isLoading: false, isError: false };
});

afterEach(cleanup);

describe('document detail screen', () => {
  it('shows an accessible loading state while the document is being read', async () => {
    state.documentQuery = { isLoading: true, isError: false, refetch: vi.fn() };
    await showPage();

    expect(screen.getByRole('status', { name: 'Loading document' })).toBeTruthy();
  });

  it('shows live lifecycle, separate draft and signed PDF, and hides actions the backend disallows', async () => {
    await showPage();

    expect(await screen.findByRole('heading', { name: 'Signed agreement.pdf' })).toBeTruthy();
    expect(screen.getAllByText('Signed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No processing status yet').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Rename document' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(screen.getByText('record-hash')).toBeTruthy();
    expect(state.queryKeys.some(([key]) => key === 'portal-doc-chain')).toBe(false);

    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(screen.getByRole('link', { name: 'Open current signed PDF' }).getAttribute('href'))
      .toBe('https://files.example.test/signed.pdf');
    expect(screen.getByRole('link', { name: 'Open Google draft' }).getAttribute('href'))
      .toBe('https://docs.google.com/document/d/draft-1');
  });

  it('shows rename and finalize controls only when permitted by the backend', async () => {
    state.profileQuery = { data: { role: 'document_issuer' }, isLoading: false, isError: false };
    state.documentQuery = {
      data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_rename: true, can_finalize: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();

    expect(await screen.findByRole('button', { name: 'Rename document' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Finalize' })).toBeTruthy();
  });

  it('links a lawyer to extracted text review when OCR is awaiting review', async () => {
    state.documentQuery = {
      data: { ...baseDocument, status: 'AWAITING_REVIEW' },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();

    expect(screen.getByRole('link', { name: 'Review extracted text' }).getAttribute('href'))
      .toBe('/portal/documents/doc-1/review');
  });

  it('distinguishes not found, forbidden, and service failures', async () => {
    const cases = [
      { status: 404, message: 'Document not found.' },
      { status: 403, message: 'You do not have access to this document.' },
      { status: 503, message: 'Unable to load this document.' },
    ];

    for (const { status, message } of cases) {
      state.documentQuery = {
        isLoading: false,
        isError: true,
        error: Object.assign(new Error('request failed'), { status }),
        refetch: vi.fn(),
      };
      const view = await act(async () => renderPage());
      expect(await screen.findByText(message)).toBeTruthy();
      if (status === 503) expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
      view.unmount();
    }
  });

  it('shows a clear unavailable message when the current signed copy is missing', async () => {
    state.documentQuery = {
      data: { ...baseDocument, signed_copy: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));

    await waitFor(() => expect(screen.getByText('No signed PDF is attached to this document yet.')).toBeTruthy());
  });
});
