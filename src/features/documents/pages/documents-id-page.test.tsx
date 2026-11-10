// @vitest-environment jsdom
import { createElement, Suspense, useReducer } from 'react';
import { Toaster } from 'sonner';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import DocumentDetailPage from '@/features/documents/pages/documents-id-page';
import { PortalApiError } from '@/shared/api/portal-error';

vi.mock('@/features/documents/components/pdf-document-viewer', () => ({ default: ({ sourceUrl, onReachedEnd }: { sourceUrl: string; onReachedEnd?: () => void }) => createElement('div', { 'data-testid': 'pdf-preview', 'data-source': sourceUrl }, createElement('button', { onClick: onReachedEnd }, 'Reach end of PDF')) }));

const { state } = vi.hoisted(() => ({
  state: {
    documentQuery: {} as Record<string, unknown>,
    profileQuery: {} as Record<string, unknown>,
    documentQueries: [] as Array<Record<string, unknown>>,
    signedCopiesQuery: {} as Record<string, unknown>,
    partiesQuery: {} as Record<string, unknown>,
    commentsQuery: {} as Record<string, unknown>,
    integrityQuery: {} as Record<string, unknown>,
    queryKeys: [] as string[][],
    mutations: [] as { options: unknown }[],
    renameDocument: vi.fn(),
    finalizeDocument: vi.fn(),
    markDocumentReady: vi.fn(),
    reopenDocument: vi.fn(),
    retryDocumentProcessing: vi.fn(),
    queryClient: { setQueryData: vi.fn(), invalidateQueries: vi.fn() },
  },
}));

vi.mock('@/features/documents/document-lifecycle-api', () => ({
  renameDocument: state.renameDocument,
  finalizeDocument: state.finalizeDocument,
  markDocumentReady: state.markDocumentReady,
  reopenDocument: state.reopenDocument,
  cancelDocument: vi.fn(),
  signedCopyFileUrl: (documentId: string, options: { copyId?: string; download?: boolean; filename?: string } = {}) => {
    const query = new URLSearchParams();
    if (options.copyId) query.set('copy_id', options.copyId);
    if (options.download) query.set('download', '1');
    if (options.filename) query.set('filename', options.filename);
    return '/api/portal/documents/' + documentId + '/file' + (query.size ? '?' + query.toString() : '');
  },
  LifecycleRequestError: class LifecycleRequestError extends Error {},
  retryDocumentProcessing: state.retryDocumentProcessing,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: { queryKey: readonly unknown[] }[] }) => {
    state.queryKeys = queries.map(({ queryKey }) => queryKey.map(String));
    state.documentQueries = queries as Array<Record<string, unknown>>;
    return [state.documentQuery, state.profileQuery];
  },
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[0] === 'portal-doc-chain') return state.integrityQuery;
    if (queryKey[0] === 'portal-document-comments') return state.commentsQuery;
    if (queryKey[0] === 'portal-document-parties') return state.partiesQuery;
    if (queryKey[0] === 'ecopy-requests') return { data: { requests: [], total: 0 }, isLoading: false, isError: false, refetch: vi.fn() };
    if (queryKey[0] === 'portal-books') return { data: [{ id: 'book-1', book_number: 1, series_year: 2026 }], isLoading: false, isError: false, refetch: vi.fn() };
    return state.signedCopiesQuery;
  },
  useQueryClient: () => state.queryClient,
  useMutation: (options: { mutationFn: (...args: unknown[]) => Promise<unknown>; onSuccess?: (result: unknown, ...args: unknown[]) => unknown; onError?: (error: unknown) => unknown }) => {
    const [error, setError] = useReducer((_previous: unknown, next: unknown) => next, null);
    const [isSuccess, setSuccess] = useReducer((_previous: boolean, next: boolean) => next, false);
    const [isPending, setPending] = useReducer((_previous: boolean, next: boolean) => next, false);
    state.mutations.push({ options });
    return {
      mutate: async (...args: unknown[]) => {
        setPending(true);
        try {
          const result = await options.mutationFn(...args);
          await options.onSuccess?.(result, ...args);
          setError(null);
          setSuccess(true);
        } catch (mutationError) {
          setError(mutationError);
          await options.onError?.(mutationError);
        } finally {
          setPending(false);
        }
      },
      reset: () => setError(null), isPending, error, isSuccess,
    };
  },
}));

vi.mock('@/features/portal/components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    PortalChatbot: () => createElement('button', { type: 'button' }, 'Ask document'),
  };
});

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
    can_retry_processing: false,
    can_share: false,
    can_restore: false,
    can_revoke: false,
    can_request_ecopy: false,
    can_review_ecopy: false,
  },
  created_at: '2026-10-08T09:00:00Z',
};

class ResizeObserverStub {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback([{ target, contentRect: { width: 500 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  disconnect() {}
  unobserve() {}
}

function renderPage() {
  return render(createElement(
    Suspense,
    { fallback: createElement('p', null, 'Loading route') },
    createElement(DocumentDetailPage, { params: Promise.resolve({ id: 'doc-1' }) }),
    createElement(Toaster),
  ));
}

async function showPage() {
  await act(async () => {
    renderPage();
  });
}

async function advanceFinalization() {
  fireEvent.click(await screen.findByRole('button', { name: 'Reach end of PDF' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
}

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) { this.removeAttribute('open'); } });
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  sessionStorage.clear();
  state.documentQuery = { data: baseDocument, isLoading: false, isError: false, refetch: vi.fn() };
  state.profileQuery = { data: { role: 'document_issuer' }, isLoading: false, isError: false };
  state.signedCopiesQuery = { data: { document_id: 'doc-1', copies: [] }, isLoading: false, isError: false };
  state.partiesQuery = { data: { document_id: 'doc-1', issuer: { id: 'owner-1', user_id: 'owner-1', email: 'lawyer@example.com', f_name: 'Jordan', l_name: 'Lawyer', role: 'owner', status: 'accepted', responded_at: null, created_at: '2026-10-20T00:00:00Z' }, parties: [] }, isLoading: false, isError: false };
  state.commentsQuery = { data: { document_id: 'doc-1', unresolved: 0, synced_at: null, comments: [] }, isLoading: false, isError: false };
  state.integrityQuery = { data: { status: 'AUTHENTIC', is_authentic: true, metadata_status: 'MATCH', analysis_status: 'MATCH', needs_restore: false }, isFetching: false, isError: false, refetch: vi.fn() };
  state.queryClient.setQueryData.mockReset();
  state.queryClient.setQueryData.mockImplementation((queryKey, document) => {
    if (queryKey[0] === 'portal-doc') state.documentQuery = { ...state.documentQuery, data: document };
  });
  state.queryClient.invalidateQueries.mockReset();
  state.finalizeDocument.mockReset();
  state.markDocumentReady.mockReset();
  state.reopenDocument.mockReset();
  state.retryDocumentProcessing.mockReset();
  state.mutations = [];
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('document detail screen', () => {
  it('shows integrity status on the document page for a finalized document', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'FINALIZED', on_chain: true } };
    await showPage();
    expect(screen.getByText('PDF and document details unchanged')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View verification details' }).getAttribute('href')).toBe('/portal/documents/doc-1/verify');
    expect(screen.queryByRole('link', { name: 'Verify integrity' })).toBeNull();
  });

  it('keeps verification available for an on-chain document that is not finalized', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, on_chain: true } };
    await showPage();
    expect(screen.getByRole('link', { name: 'Verify integrity' }).getAttribute('href')).toBe('/portal/documents/doc-1/verify');
  });

  it('labels a finalized document on-chain only when confirmed', async () => {
    state.documentQuery = { data: { ...baseDocument, lifecycle: 'FINALIZED', on_chain: true }, isLoading: false, isError: false, refetch: vi.fn() };
    await showPage();
    expect(screen.getByText('On-Chain')).toBeTruthy();
  });

  it.each([['PREPARING', false], ['READY_FOR_SIGNATURE', false], ['SIGNED', false], ['FINALIZED', true]])('shows document chat only after finalization (%s)', async (lifecycle, visible) => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle } };
    await showPage();
    expect(Boolean(screen.queryByRole('button', { name: 'Ask document' }))).toBe(visible);
  });

  it('refreshes document status while the detail page stays open', async () => {
    await showPage();

    expect(state.documentQueries[0]).toMatchObject({
      queryKey: ['portal-doc', 'doc-1'],
      refetchInterval: 10_000,
    });
  });

  it.each([
    ['PREPARING', 'Preparing', 'FAILED'],
    ['READY_FOR_SIGNATURE', 'Ready for signature', 'PROCESSING'],
    ['SIGNED', 'Signed', 'queued_for_embeddings'],
  ])('keeps drafting status separate from post-finalization processing (%s)', async (lifecycle, label, status) => {
    state.documentQuery = { data: { ...baseDocument, lifecycle, status }, isLoading: false, isError: false, refetch: vi.fn() };
    await showPage();
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    expect(screen.queryByText('Processing status')).toBeNull();
    expect(screen.queryByText('Finalized', { selector: 'dt' })).toBeNull();
    if (lifecycle === 'SIGNED') {
      expect(screen.queryByText('Processing', { selector: 'dt' })).toBeNull();
    } else {
      expect(screen.getByText(lifecycle === 'PREPARING' ? 'Drafting workspace' : 'Ready for signature', { selector: 'p' })).toBeTruthy();
      expect(screen.queryByRole('tablist')).toBeNull();
    }
  });

  it('shows finalized processing failure without offering finalization', async () => {
    state.documentQuery = { data: { ...baseDocument, lifecycle: 'FINALIZED', status: 'FAILED' }, isLoading: false, isError: false, refetch: vi.fn() };
    await showPage();
    expect(screen.getAllByText('On-Chain').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Processing failed').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it('shows processing on a signed document before finalization', async () => {
    state.documentQuery = { data: { ...baseDocument, lifecycle: 'SIGNED', status: 'QUEUED' }, isLoading: false, isError: false, refetch: vi.fn() };
    await showPage();
    expect(screen.getAllByText('Queued').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
  });

  it.each([
    ['QUEUED', 'Waiting to start'],
    ['PROCESSING', 'Reading your PDF'],
    ['ENRICHING', 'Analyzing document'],
  ])('shows indeterminate %s progress in the bottom action card', async (status, heading) => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'SIGNED', status } };
    await showPage();
    const card = screen.getByRole('region', { name: 'Next action' });
    expect(within(card).getByRole('heading', { name: heading })).toBeTruthy();
    expect(within(card).getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    expect(screen.queryByRole('region', { name: 'Document processing status' })).toBeNull();
  });

  it('shows processing failure and retry together without an active progress bar', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'SIGNED', status: 'FAILED', permissions: { ...baseDocument.permissions, can_retry_processing: true } } };
    await showPage();
    const card = screen.getByRole('region', { name: 'Next action' });
    expect(within(card).getByRole('heading', { name: 'Processing failed' })).toBeTruthy();
    expect(within(card).getByRole('button', { name: 'Retry processing' })).toBeTruthy();
    expect(within(card).queryByRole('progressbar')).toBeNull();
  });

  it.each(['AWAITING_REVIEW', 'READY_FOR_REVIEW'])('shows review guidance without an active progress bar for %s', async (status) => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'SIGNED', status } };
    await showPage();
    const card = screen.getByRole('region', { name: 'Next action' });
    expect(within(card).getByRole('heading', { name: 'Review extracted text' })).toBeTruthy();
    expect(within(card).getByRole('link', { name: 'Review extracted text' })).toBeTruthy();
    expect(within(card).queryByRole('progressbar')).toBeNull();
  });

  it('explains failure without offering retry when permission is denied', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'SIGNED', status: 'FAILED', permissions: { ...baseDocument.permissions, can_retry_processing: false } } };
    await showPage();
    const card = screen.getByRole('region', { name: 'Next action' });
    expect(within(card).getByText('The document owner can retry processing.')).toBeTruthy();
    expect(within(card).queryByRole('button', { name: 'Retry processing' })).toBeNull();
    expect(within(card).queryByRole('progressbar')).toBeNull();
  });

  it('shows an accessible loading state while the document is being read', async () => {
    state.documentQuery = { isLoading: true, isError: false, refetch: vi.fn() };
    await showPage();

    expect(screen.getByRole('status', { name: 'Loading document' })).toBeTruthy();
  });

  it('shows the signed PDF without the draft card or disallowed actions', async () => {
    await showPage();

    expect(await screen.findByRole('heading', { name: 'Signed agreement.pdf' })).toBeTruthy();
    expect(screen.getAllByText('Signed').length).toBeGreaterThan(0);
    expect(screen.queryByText('No processing status yet')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Rename document' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel document' })).toBeNull();
    expect(state.queryKeys.some(([key]) => key === 'portal-doc-chain')).toBe(false);

    expect(screen.queryByRole('link', { name: /Open (approved Google Doc|Google draft)/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Download options' })).toBeTruthy();
  });

  it('shows a newly opened PREPARING record in the drafting workspace', async () => {
    state.documentQuery = {
      data: { ...baseDocument, lifecycle: 'PREPARING', draft_url: null, signed_copy: null, permissions: { ...baseDocument.permissions, can_create_draft: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();

    expect(screen.getAllByText('Preparing').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Create blank Google draft' })).toBeTruthy();
    expect(screen.getByText('Drafting workspace')).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('publishes a created draft into the document query and refreshes list and history', async () => {
    const preparingDocument = {
      ...baseDocument,
      lifecycle: 'PREPARING',
      draft_url: null,
      signed_copy: null,
      permissions: { ...baseDocument.permissions, can_create_draft: true, can_mark_ready: true },
    };
    const createdDocument = {
      ...preparingDocument,
      draft_url: 'https://docs.google.com/document/d/created-draft',
      permissions: { ...preparingDocument.permissions, can_create_draft: false, can_mark_ready: true },
    };
    state.documentQuery = { data: preparingDocument, isLoading: false, isError: false, refetch: vi.fn() };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(createdDocument, { status: 201 })));

    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Create blank Google draft' }));
    await waitFor(() => expect(state.queryClient.setQueryData).toHaveBeenCalled());

    expect(state.queryClient.setQueryData).toHaveBeenCalledWith(['portal-doc', 'doc-1'], createdDocument);
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-documents'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-history', 'doc-1'] });
  });

  it('shows signature readiness controls only when granted by the backend', async () => {
    state.documentQuery = {
      data: { ...baseDocument, lifecycle: 'PREPARING', permissions: { ...baseDocument.permissions, can_mark_ready: true } },
      isLoading: false, isError: false, refetch: vi.fn(),
    };
    await showPage();

    expect(screen.getByRole('button', { name: 'Mark ready for signature' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('publishes returned ready lifecycle and permission flags before refreshing dependent queries', async () => {
    const preparing = { ...baseDocument, lifecycle: 'PREPARING', permissions: { ...baseDocument.permissions, can_mark_ready: true } };
    const ready = { ...preparing, lifecycle: 'READY_FOR_SIGNATURE', permissions: { ...preparing.permissions, can_mark_ready: false, can_reopen: true } };
    state.documentQuery = { data: preparing, isLoading: false, isError: false, refetch: vi.fn() };
    state.markDocumentReady.mockResolvedValue(ready);
    await showPage();
    fireEvent.click(screen.getByRole('checkbox', { name: /I checked Google Docs/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark ready for signature' }));

    await waitFor(() => expect(state.queryClient.setQueryData).toHaveBeenCalledWith(['portal-doc', 'doc-1'], ready));
    expect(screen.getAllByText('Document marked ready for signature.')).toHaveLength(1);
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-documents'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-comments', 'doc-1'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-history', 'doc-1'] });
  });

  it('publishes returned reopened lifecycle and permission flags immediately', async () => {
    const ready = { ...baseDocument, lifecycle: 'READY_FOR_SIGNATURE', permissions: { ...baseDocument.permissions, can_reopen: true } };
    const reopened = { ...ready, lifecycle: 'PREPARING', permissions: { ...ready.permissions, can_reopen: false, can_mark_ready: true } };
    state.documentQuery = { data: ready, isLoading: false, isError: false, refetch: vi.fn() };
    state.reopenDocument.mockResolvedValue(reopened);
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() => expect(state.queryClient.setQueryData).toHaveBeenCalledWith(['portal-doc', 'doc-1'], reopened));
    expect(screen.getAllByText('Document reopened for editing.')).toHaveLength(1);
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-documents'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-comments', 'doc-1'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-history', 'doc-1'] });
  });

  it('keeps the backend readiness failure message visible', async () => {
    const preparing = { ...baseDocument, lifecycle: 'PREPARING', permissions: { ...baseDocument.permissions, can_mark_ready: true } };
    state.documentQuery = { data: preparing, isLoading: false, isError: false, refetch: vi.fn() };
    state.markDocumentReady.mockRejectedValue(Object.assign(new Error('Resolve two comments before marking ready.'), { status: 409 }));
    await showPage();
    fireEvent.click(screen.getByRole('checkbox', { name: /I checked Google Docs/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark ready for signature' }));

    expect(await screen.findByText('Resolve two comments before marking ready.')).toBeTruthy();
    expect(state.queryClient.setQueryData).not.toHaveBeenCalled();
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

    fireEvent.click(await screen.findByRole('button', { name: 'More document actions' }));
    expect(await screen.findByRole('button', { name: 'Rename' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Finalize' })).toBeTruthy();
  });

  it.each([
    ['SIGNED', 'AWAITING_REVIEW', 'can_finalize', false, 'link', 'Review extracted text'],
    ['SIGNED', 'COMPLETED', 'can_finalize', true, 'button', 'Finalize'],
    ['FINALIZED', 'FAILED', 'can_retry_processing', true, 'button', 'Retry processing'],
  ] as const)('places the %s %s workflow action in the bottom action card', async (lifecycle, status, permission, allowed, role, name) => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle, status, permissions: { ...baseDocument.permissions, [permission]: allowed } } };
    await showPage();
    const card = screen.getByRole('region', { name: 'Next action' });
    expect(within(card).getByRole(role, { name })).toBeTruthy();
    expect(screen.getByRole('banner').contains(card)).toBe(false);
  });

  it('requires PDF review and document details before final confirmation', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm finalization' });
    expect(within(dialog).getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true);
    expect(within(dialog).queryByRole('button', { name: 'Confirm finalization' })).toBeNull();
    fireEvent.click(await within(dialog).findByRole('button', { name: 'Reach end of PDF' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('Signed agreement.pdf')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(state.finalizeDocument).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('button', { name: 'Confirm finalization' })).toBeTruthy();
  });

  it('prevents finalization when participant details cannot be loaded', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    state.partiesQuery = { isLoading: false, isError: true, refetch: vi.fn() };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reach end of PDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.partiesQuery.refetch).toHaveBeenCalledOnce();
    expect(state.finalizeDocument).not.toHaveBeenCalled();
  });

  it('requires the current signed PDF to be reviewed if it changes during confirmation', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, signed_copy: { ...baseDocument.signed_copy!, id: 'new-copy' }, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText(/signed PDF changed/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true);
    expect(state.finalizeDocument).not.toHaveBeenCalled();
  });

  it('keeps finalization confirmation accessible before tabs appear', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    expect(screen.queryByRole('tablist')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm finalization' });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(document.activeElement).toBe(within(dialog).getByRole('heading', { name: 'Review the signed PDF' }));
    expect(within(dialog).queryByText(/This freezes the signed copy/)).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(state.finalizeDocument).not.toHaveBeenCalled();
  });

  it('identifies the document and signed filing copy and explains consequences in finalization confirmation (#159)', async () => {
    state.documentQuery = {
      ...state.documentQuery,
      data: {
        ...baseDocument,
        file_name: 'Property Purchase Agreement.pdf',
        doc_no: 12,
        page_no: 34,
        signed_copy: {
          id: 'copy-123',
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          content_type: 'application/pdf',
          size_bytes: 2097152,
          is_current: true,
          created_at: '2026-10-10T14:30:00Z',
          original_filename: 'Executed_Agreement_Signed.pdf',
        },
        permissions: { ...baseDocument.permissions, can_finalize: true },
      },
    };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm finalization' });
    const preview = await screen.findByTestId('pdf-preview');
    expect(preview.getAttribute('data-source')).toBe('/api/portal/documents/doc-1/file?copy_id=copy-123');
    expect(preview.parentElement?.classList.contains('flex')).toBe(true);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reach end of PDF' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('Property Purchase Agreement.pdf')).toBeTruthy();
    expect(within(dialog).getByText(/Executed_Agreement_Signed\.pdf · 2\.0 MB/)).toBeTruthy();
    expect(within(dialog).getByText('Document 12 · Page 34')).toBeTruthy();
    expect(within(dialog).getByText(/^Oct (9|10|11), 2026$/)).toBeTruthy();
    expect(within(dialog).getByText(/SHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByRole('button', { name: 'Confirm finalization' })).toBeTruthy();
    expect(state.finalizeDocument).not.toHaveBeenCalled();
    expect(within(dialog).getByText(/The frozen filing copy cannot be replaced or removed after finalization/)).toBeTruthy();
  });

  it('disables duplicate finalization and cancellation while waiting for the chain', async () => {
    let finish: ((record: ApiSchema<'RecordResponse'>) => void) | undefined;
    state.finalizeDocument.mockImplementation(() => new Promise<ApiSchema<'RecordResponse'>>((resolve) => { finish = resolve; }));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    const confirm = screen.getByRole('button', { name: 'Finalizing…' });
    expect(confirm.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Waiting for blockchain confirmation…')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Finalization in progress' })).toBeTruthy();
    fireEvent(screen.getByRole('dialog', { name: 'Confirm finalization' }), new Event('cancel', { bubbles: false, cancelable: true }));
    expect(screen.getByRole('dialog', { name: 'Confirm finalization' })).toBeTruthy();
    fireEvent.click(confirm);
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    await act(async () => finish?.({ document_id: 'doc-1', onchain_document_id: 'onchain-doc-101', data_hash: 'datahash101', tx_hash: '0xtxhash101' }));
  });

  it('navigates to blockchain record via toast action and keeps processing separate from finalization', async () => {
    state.finalizeDocument.mockImplementation(async () => {
      state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, lifecycle: 'FINALIZED', status: 'QUEUED' } };
      return { document_id: 'doc-1', onchain_document_id: 'onchain-doc-101', data_hash: 'datahash101', tx_hash: '0xtxhash101' };
    });
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    expect(await screen.findByText('Document finalized and anchored on-chain.')).toBeTruthy();
    expect(screen.getAllByText('Finalized').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Queued').length).toBeGreaterThan(0);

    const viewBlockchainBtn = screen.getByRole('button', { name: 'View blockchain record →' });
    expect(viewBlockchainBtn).toBeTruthy();
    fireEvent.click(viewBlockchainBtn);

    expect(screen.getByText('Document ID').parentElement?.querySelector('code')?.textContent).toBe('doc-1');
    expect(screen.getByText('onchain-doc-101')).toBeTruthy();
    expect(screen.getByText('datahash101')).toBeTruthy();
    expect(screen.getByText('0xtxhash101')).toBeTruthy();

    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-doc', 'doc-1'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-documents'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-history', 'doc-1'] });
  });

  it('keeps an explicit finalization rejection retryable and never claims success', async () => {
    state.finalizeDocument.mockRejectedValue(new PortalApiError('Document cannot be finalized', 409, undefined));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Document cannot be finalized');
    expect(screen.getByRole('button', { name: 'Confirm finalization' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('datahash101')).toBeNull();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBeNull();
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-doc', 'doc-1'] });
  });

  it('reconciles a lost finalization response with GET FINALIZED without inventing a chain record', async () => {
    const finalized = { ...baseDocument, lifecycle: 'FINALIZED', status: 'QUEUED' };
    const fetchStatus = vi.fn().mockResolvedValue(Response.json(finalized));
    vi.stubGlobal('fetch', fetchStatus);
    state.finalizeDocument.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    const checkStatus = await screen.findByRole('button', { name: 'Check status' });
    expect(screen.getByText(/Finalization outcome unknown/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Confirm finalization' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    fireEvent.click(checkStatus);

    expect(await screen.findByText('Document finalization confirmed.')).toBeTruthy();
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('Document finalized and recorded on-chain.')).toBeNull();
    expect(screen.getAllByText('Finalized').length).toBeGreaterThan(0);
    expect(screen.queryByText('Transaction hash')).toBeNull();
    expect(screen.queryByText('On-chain document ID')).toBeNull();
    expect(screen.queryByText('Data hash')).toBeNull();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBeNull();
    expect(fetchStatus).toHaveBeenCalledExactlyOnceWith('/api/portal/proxy?path=%2Fdocuments%2Fdoc-1', expect.objectContaining({ credentials: 'same-origin' }));
    expect(fetchStatus.mock.calls[0][1].method ?? 'GET').toBe('GET');
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-doc', 'doc-1'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-documents'] });
    expect(state.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['portal-document-history', 'doc-1'] });
  });

  it('reconciles a lost finalization response with confirmed on-chain status when on_chain is true', async () => {
    const finalized = { ...baseDocument, lifecycle: 'FINALIZED', status: 'QUEUED', on_chain: true };
    const fetchStatus = vi.fn().mockResolvedValue(Response.json(finalized));
    vi.stubGlobal('fetch', fetchStatus);
    state.finalizeDocument.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    const checkStatus = await screen.findByRole('button', { name: 'Check status' });
    fireEvent.click(checkStatus);

    expect(await screen.findByText('Document finalized and recorded on-chain.')).toBeTruthy();
    expect(screen.getByText('On-Chain')).toBeTruthy();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBeNull();
  });

  it('keeps finalization locked when a lost response is followed by GET SIGNED', async () => {
    const fetchStatus = vi.fn().mockImplementation(async () => Response.json(baseDocument));
    vi.stubGlobal('fetch', fetchStatus);
    state.finalizeDocument.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Check status' }));

    expect(await screen.findByText(/Status is inconclusive/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Confirm finalization' })).toBeNull();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect(fetchStatus).toHaveBeenCalledTimes(2));
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
  });

  it('keeps finalization locked when GET status is unavailable after a lost response', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(Response.json({ detail: 'Service unavailable' }, { status: 503 }));
    vi.stubGlobal('fetch', fetchStatus);
    state.finalizeDocument.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Check status' }));

    expect(await screen.findByText(/Unable to check finalization status/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check status' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it('restores the document lock after refreshing the same tab without resubmitting', async () => {
    state.finalizeDocument.mockRejectedValue(new DOMException('Request timed out', 'TimeoutError'));
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    const fetchStatus = vi.fn().mockResolvedValue(Response.json(baseDocument));
    vi.stubGlobal('fetch', fetchStatus);
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));
    await screen.findByRole('button', { name: 'Check status' });
    cleanup();
    await showPage();

    expect(screen.getByText(/Finalization outcome unknown/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Finalize' })).toBeNull();
    expect(fetchStatus).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    expect(await screen.findByText(/Status is inconclusive/)).toBeTruthy();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
  });

  it.each([
    new TypeError('Connection lost'),
    new SyntaxError('Unexpected end of JSON input'),
    new PortalApiError('Request timed out', 408, undefined),
    new PortalApiError('Gateway failed', 502, undefined),
    new PortalApiError('Server failed', 500, undefined),
  ])('locks an ambiguous finalization failure (%s)', async (error) => {
    state.finalizeDocument.mockRejectedValue(error);
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    expect(await screen.findByRole('button', { name: 'Check status' })).toBeTruthy();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    expect(screen.queryByRole('button', { name: 'Confirm finalization' })).toBeNull();
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
  });

  it.each([
    null,
    {},
    { document_id: 'doc-1', data_hash: 'hash', onchain_document_id: 'chain-id' },
    { document_id: 'doc-2', data_hash: 'hash', onchain_document_id: 'chain-id', tx_hash: 'tx' },
  ])('locks an unusable finalization response (%j)', async (response) => {
    state.finalizeDocument.mockResolvedValue(response);
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    expect(await screen.findByRole('button', { name: 'Check status' })).toBeTruthy();
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(screen.queryByText('Transaction hash')).toBeNull();
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
  });

  it('keeps the document lock when status belongs to another document', async () => {
    sessionStorage.setItem('portal-finalize-unknown:doc-1', '1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ...baseDocument, document_id: 'doc-2', lifecycle: 'FINALIZED' })));
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));

    expect(await screen.findByText(/Status is inconclusive/)).toBeTruthy();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
    expect(state.finalizeDocument).not.toHaveBeenCalled();
  });

  it('keeps finalization locked when GET returns an incomplete finalized document', async () => {
    sessionStorage.setItem('portal-finalize-unknown:doc-1', '1');
    state.queryClient.setQueryData.mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ document_id: 'doc-1', lifecycle: 'FINALIZED' })));
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));

    expect(await screen.findByText(/Unable to check finalization status/)).toBeTruthy();
    expect(sessionStorage.getItem('portal-finalize-unknown:doc-1')).toBe('1');
    expect(state.queryClient.setQueryData).not.toHaveBeenCalled();
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
  });

  it('keeps the returned chain record visible when the detail refresh fails', async () => {
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    state.finalizeDocument.mockResolvedValue({ document_id: 'doc-1', onchain_document_id: 'onchain-doc-101', data_hash: 'datahash101', tx_hash: '0xtxhash101' });
    state.queryClient.invalidateQueries.mockImplementation(async ({ queryKey }) => {
      if (queryKey[0] === 'portal-doc') state.documentQuery = { ...state.documentQuery, isError: true, error: new Error('Refresh unavailable') };
    });
    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm finalization' }));

    expect(await screen.findByText('0xtxhash101')).toBeTruthy();
    expect(screen.getByText('datahash101')).toBeTruthy();
    expect(screen.getByText('onchain-doc-101')).toBeTruthy();
    expect(screen.getByText('Document finalized and anchored on-chain.')).toBeTruthy();
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
  });

  it('identifies demo finalization and its returned fields as synthetic before submission', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    state.documentQuery = { ...state.documentQuery, data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_finalize: true } } };
    state.finalizeDocument.mockResolvedValue({ document_id: 'doc-1', onchain_document_id: 'demo-chain-id', data_hash: 'demo-data-hash', tx_hash: 'demo-tx-hash' });
    state.queryClient.invalidateQueries.mockImplementation(async ({ queryKey }) => {
      if (queryKey[0] === 'portal-doc') state.documentQuery = { ...state.documentQuery, isError: true, error: new Error('Refresh unavailable') };
    });
    await showPage();

    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    await advanceFinalization();
    const confirmation = screen.getByRole('dialog', { name: 'Confirm finalization' });
    expect(within(confirmation).getByText(/demo mode/i)).toBeTruthy();
    expect(within(confirmation).getByText(/synthetic/i)).toBeTruthy();
    expect(within(confirmation).getByText(/no real PDF digest or blockchain transaction will be produced/i)).toBeTruthy();
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Confirm finalization' }));

    expect(await screen.findByText(/demo finalization completed/i)).toBeTruthy();
    expect(screen.getAllByText(/synthetic/i).length).toBeGreaterThan(0);
    expect(screen.getByText('demo-data-hash')).toBeTruthy();
    expect(screen.getByText('demo-tx-hash')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/demo finalization completed/i);
    expect(screen.queryByText(/finalization succeeded/i)).toBeNull();
    expect(state.finalizeDocument).toHaveBeenCalledExactlyOnceWith('doc-1');
    expect(screen.queryByText('Document finalized and anchored on-chain.')).toBeNull();
  });

  it('offers document cancellation only when permitted and requires confirmation', async () => {
    state.documentQuery = {
      data: { ...baseDocument, lifecycle: 'PREPARING', permissions: { ...baseDocument.permissions, can_cancel: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();

    fireEvent.click(screen.getByRole('button', { name: 'More document actions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel document' }));

    expect(screen.getByRole('dialog', { name: 'Cancel document?' })).toBeTruthy();
    expect(screen.getByText('This will mark the document as cancelled. The document record will be kept.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm cancellation' })).toBeTruthy();
  });

  it('renames a document through the modal form', async () => {
    state.renameDocument.mockResolvedValue(undefined);
    state.documentQuery = {
      data: { ...baseDocument, permissions: { ...baseDocument.permissions, can_rename: true } },
      isLoading: false, isError: false, refetch: vi.fn(),
    };
    await showPage();

    fireEvent.click(screen.getByRole('button', { name: 'More document actions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    expect(screen.getByRole('dialog', { name: 'Rename document' })).toBeTruthy();
    const input = screen.getByRole('textbox', { name: 'Document name' }) as HTMLInputElement;
    expect(input.value).toBe('Signed agreement.pdf');
    fireEvent.change(input, { target: { value: 'Updated agreement.pdf' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(state.renameDocument).toHaveBeenCalledWith('doc-1', 'Updated agreement.pdf'));
  });

  it('links a lawyer to extracted text review when OCR is awaiting review', async () => {
    state.documentQuery = {
      data: { ...baseDocument, lifecycle: 'FINALIZED', status: 'AWAITING_REVIEW' },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();

    expect(screen.getByRole('link', { name: 'Review extracted text' }).getAttribute('href'))
      .toBe('/portal/documents/doc-1/review');
  });

  it('distinguishes not found, forbidden, and service failures with accessible recovery (#162)', async () => {
    const cases = [
      { status: 404, heading: 'Document unavailable', message: 'This document could not be found or your account does not have permission to view it.' },
      { status: 403, heading: 'Access denied', message: 'You do not have access to this document.' },
      { status: 503, heading: 'Unable to load document', message: 'Unable to load this document.' },
    ];

    for (const { status, heading, message } of cases) {
      state.documentQuery = {
        isLoading: false,
        isError: true,
        error: Object.assign(new Error('request failed'), { status }),
        refetch: vi.fn(),
      };
      const view = await act(async () => renderPage());
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeTruthy();
      expect(screen.getByText(message)).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Back to Documents' }).getAttribute('href')).toBe('/portal/documents');
      if (status === 503) expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
      view.unmount();
    }
  });

  it('retries failed processing only when backend permission is granted', async () => {
    state.retryDocumentProcessing.mockResolvedValue({
      document_id: 'doc-1',
      status: 'QUEUED',
      job: 'extract',
      message: 'Text extraction has been queued again.',
    });
    state.documentQuery = {
      data: { ...baseDocument, lifecycle: 'FINALIZED', status: 'FAILED', permissions: { ...baseDocument.permissions, can_retry_processing: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();
    fireEvent.click(screen.getByRole('button', { name: 'Retry processing' }));

    await waitFor(() => expect(state.retryDocumentProcessing).toHaveBeenCalledExactlyOnceWith('doc-1'));
    expect(await screen.findByText('Text extraction has been queued again.')).toBeTruthy();
  });
  it('shows a clear unavailable message when the current signed copy is missing', async () => {
    state.documentQuery = {
      data: { ...baseDocument, signed_copy: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    await showPage();
    await waitFor(() => expect(screen.getAllByText('No signed PDF is attached to this document yet.').length).toBeGreaterThan(0));
  });
});
