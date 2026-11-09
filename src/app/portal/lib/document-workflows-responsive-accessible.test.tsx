// @vitest-environment jsdom
import { createElement, Suspense } from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiSchema } from '@/shared/types';
import DocumentDetailPage from '@/features/documents/pages/documents-id-page';
import VerifyWorkspace from '@/features/verification/components/verify-workspace';
import { PortalApiError } from '@/shared/api/portal-error';

vi.mock('@/features/documents/components/pdf-document-viewer', () => ({ default: () => null }));
vi.mock('next/dynamic', () => ({
  default: () => function MockViewer() {
    return <div role="region" aria-label="Mock PDF preview" />;
  },
}));

class ResizeObserverStub {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const { state } = vi.hoisted(() => ({
  state: {
    documentQuery: {} as Record<string, unknown>,
    profileQuery: {} as Record<string, unknown>,
    signedCopiesQuery: { data: { document_id: 'doc-responsive-101', copies: [] }, isLoading: false, isError: false } as Record<string, unknown>,
    partiesQuery: {
      data: {
        document_id: 'doc-responsive-101',
        issuer: {
          id: 'owner-1',
          user_id: 'user-lawyer-1',
          email: 'lawyer@example.com',
          f_name: 'Jane',
          l_name: 'Lawyer',
          role: 'owner',
          status: 'accepted',
          responded_at: null,
          created_at: '2026-10-20T00:00:00Z',
        },
        parties: [],
      },
      isLoading: false,
      isError: false,
    } as Record<string, unknown>,
    commentsQuery: { data: { comments: [] }, isLoading: false, isError: false } as Record<string, unknown>,
    renameDocument: vi.fn(),
    finalizeDocument: vi.fn(),
    markDocumentReady: vi.fn(),
    reopenDocument: vi.fn(),
    retryDocumentProcessing: vi.fn(),
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
  useQueries: () => [state.documentQuery, state.profileQuery],
  useQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[0] === 'portal-document-comments') return state.commentsQuery;
    if (queryKey[0] === 'portal-document-parties') return state.partiesQuery;
    if (queryKey[0] === 'ecopy-requests') return { data: { requests: [], total: 0 }, isLoading: false, isError: false, refetch: vi.fn() };
    if (queryKey[0] === 'portal-books') return { data: [], isLoading: false, isError: false };
    return state.signedCopiesQuery;
  },
  useMutation: (options: unknown) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
    options,
  }),
  useQueryClient: () => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }),
}));

const sampleDoc: ApiSchema<'DocumentResponse'> = {
  document_id: 'doc-responsive-101',
  document_hash: 'record-hash',
  file_name: 'test-contract.pdf',
  lifecycle: 'PREPARING',
  status: 'EXTRACTED',
  on_chain: false,
  draft_url: 'https://docs.google.com/document/d/draft123/edit',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
  permissions: {
    can_view: true,
    can_rename: false,
    can_create_draft: false,
    can_mark_ready: true,
    can_reopen: true,
    can_attach_signed_copy: true,
    can_replace_signed_copy: true,
    can_correct_entry: false,
    can_cancel: true,
    can_finalize: true,
    can_retry_processing: false,
    can_share: false,
    can_restore: false,
    can_revoke: false,
    can_request_ecopy: false,
    can_review_ecopy: false,
  },
};

async function renderDocumentPage(id: string) {
  let view: ReturnType<typeof render>;
  await act(async () => {
    view = render(
      createElement(
        Suspense,
        { fallback: createElement('p', null, 'Loading route…') },
        createElement(DocumentDetailPage, { params: Promise.resolve({ id }) }),
      ),
    );
  });
  return view!;
}

describe('Responsive and Accessible Document Workflows (#175)', () => {
  beforeEach(() => {
    window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
    state.profileQuery = {
      data: { user_id: 'user-lawyer-1', role: 'lawyer', f_name: 'Jane', l_name: 'Lawyer' },
      isLoading: false,
      isError: false,
    };
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  describe('Journey 1: Document unavailable and error recovery states', () => {
    it('provides accessible 404 recovery state with focus-visible and min-h-11 link', async () => {
      state.documentQuery = {
        data: null,
        isLoading: false,
        isError: true,
        error: new PortalApiError('Document not found', 404, null),
      };

      await renderDocumentPage('missing-doc');

      const heading = await screen.findByRole('heading', { level: 1, name: 'Document unavailable' });
      expect(heading).toBeTruthy();
      expect(screen.getByText(/This document could not be found or your account does not have permission to view it/i)).toBeTruthy();

      const backLink = screen.getByRole('link', { name: 'Back to Documents' });
      expect(backLink.getAttribute('href')).toBe('/portal/documents');
      expect(backLink.className).toContain('min-h-11');
      expect(backLink.className).toContain('focus-visible:outline-2');
    });

    it('provides accessible 403 access denied alert with recovery navigation', async () => {
      state.documentQuery = {
        data: null,
        isLoading: false,
        isError: true,
        error: new PortalApiError('Forbidden', 403, null),
      };

      await renderDocumentPage('forbidden-doc');

      const alert = await screen.findByRole('alert');
      expect(within(alert).getByRole('heading', { level: 1, name: 'Access denied' })).toBeTruthy();
      expect(within(alert).getByText('You do not have access to this document.')).toBeTruthy();

      const backLink = within(alert).getByRole('link', { name: 'Back to Documents' });
      expect(backLink.className).toContain('min-h-11');
      expect(backLink.className).toContain('focus-visible:outline-2');
    });

    it('provides accessible 500 error alert with retry button and focus rings', async () => {
      const refetch = vi.fn();
      state.documentQuery = {
        data: null,
        isLoading: false,
        isError: true,
        error: new PortalApiError('Server error', 500, null),
        refetch,
      };

      await renderDocumentPage('error-doc');

      const alert = await screen.findByRole('alert');
      expect(within(alert).getByRole('heading', { level: 1, name: 'Unable to load document' })).toBeTruthy();

      const retryBtn = within(alert).getByRole('button', { name: 'Retry' });
      expect(retryBtn.className).toContain('min-h-11');
      expect(retryBtn.className).toContain('focus-visible:outline-2');
    });
  });

  describe('Journey 2: Responsive drafting progress and action guidance', () => {
    it('uses responsive grid and accessible step semantics in draft progress indicator', async () => {
      state.documentQuery = { data: sampleDoc, isLoading: false, isError: false };

      await renderDocumentPage(sampleDoc.document_id);

      const nav = await screen.findByRole('navigation', { name: 'Draft and filing progress' });
      expect(nav).toBeTruthy();

      const list = within(nav).getByRole('list');
      expect(list.className).toContain('grid-cols-1');
      expect(list.className).toContain('sm:grid-cols-2');
      expect(list.className).toContain('lg:grid-cols-5');

      const currentStep = within(nav).getByRole('listitem', { current: 'step' });
      expect(currentStep.textContent).toContain('Current step:');
      expect(currentStep.textContent).toContain('Working draft');

      const upcomingLabels = within(nav).getAllByText('Upcoming:');
      expect(upcomingLabels.length).toBe(3);
    });

    it('provides accessible touch targets and focus rings on drafting action buttons', async () => {
      state.documentQuery = {
        data: {
          ...sampleDoc,
          status: 'FAILED',
          permissions: {
            ...sampleDoc.permissions,
            can_retry_processing: true,
          },
        },
        isLoading: false,
        isError: false,
      };

      await renderDocumentPage(sampleDoc.document_id);

      const finalizeBtn = await screen.findByRole('button', { name: 'Finalize' });
      expect(finalizeBtn.className).toContain('min-h-11');
      expect(finalizeBtn.className).toContain('focus-visible:outline-2');

      const retryBtn = screen.getByRole('button', { name: 'Retry processing' });
      expect(retryBtn.className).toContain('min-h-11');
      expect(retryBtn.className).toContain('focus-visible:outline-2');
    });
  });

  describe('Journey 3: Document finalization and status feedback', () => {
    it('presents persistent status banner with keyboard-operable check status button when outcome is unknown', async () => {
      sessionStorage.setItem(`portal-finalize-unknown:${sampleDoc.document_id}`, '1');
      state.documentQuery = { data: sampleDoc, isLoading: false, isError: false };

      await renderDocumentPage(sampleDoc.document_id);

      const statusBanner = await screen.findByRole('status');
      expect(within(statusBanner).getByText(/Finalization outcome unknown/i)).toBeTruthy();

      const checkStatusBtn = within(statusBanner).getByRole('button', { name: 'Check status' });
      expect(checkStatusBtn.className).toContain('min-h-11');
      expect(checkStatusBtn.className).toContain('focus-visible:outline-2');
    });
  });

  describe('Journey 4: Plain-language verification and responsive layout', () => {
    const baseVerification: ApiSchema<'DocumentVerificationResponse'> = {
      document_id: 'doc-verify-1',
      file_name: 'contract.pdf',
      status: 'AUTHENTIC',
      is_authentic: true,
      baseline_trusted: true,
      metadata_status: 'NOT_ANCHORED',
      analysis_status: 'NOT_ANCHORED',
      needs_restore: false,
      onchain_hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      snapshot_hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      current_hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
      tx_hash: '0x9999888877776666555544443333222211110000aaaabbbbccccddddeeeeffff',
      verified_at: '2026-11-02T10:00:00Z',
      finalized_at: '2026-11-01T10:00:00Z',
      tamper_report: null,
      tamper_report_status: 'NOT_APPLICABLE',
      message: '',
    };

    it('renders authentic outcome with high-contrast text and plain-language explanation', () => {
      render(createElement(VerifyWorkspace, { result: baseVerification, onRetry: vi.fn(), role: 'lawyer' }));

      expect(screen.getByRole('heading', { level: 2, name: 'PDF unchanged' })).toBeTruthy();
      expect(screen.getByText('Its fingerprint matches the blockchain record.')).toBeTruthy();

      const copyBtn = screen.getByRole('button', { name: 'Copy On-chain hash' });
      expect(copyBtn.className).toContain('focus-visible:outline-2');
    });

    it('renders tampered outcome with clear warning and contact guidance for participants', () => {
      const tamperedResult: ApiSchema<'DocumentVerificationResponse'> = {
        ...baseVerification,
        status: 'TAMPERED',
        is_authentic: false,
      };

      render(createElement(VerifyWorkspace, { result: tamperedResult, onRetry: vi.fn(), role: 'user' }));

      expect(screen.getByRole('heading', { level: 2, name: 'This PDF differs from the saved version' })).toBeTruthy();
      expect(screen.getByText(/differs from the cryptographic fingerprint recorded on the blockchain/i)).toBeTruthy();
      expect(screen.getByText(/Contact your lawyer or the document owner if you have questions/i)).toBeTruthy();
    });

    it('provides accessible retry action with min-h-11 touch target on verification failure', () => {
      const failedResult: ApiSchema<'DocumentVerificationResponse'> = {
        ...baseVerification,
        status: 'VERIFICATION_UNAVAILABLE',
        is_authentic: false,
      };

      const onRetry = vi.fn();
      render(createElement(VerifyWorkspace, { result: failedResult, onRetry, role: 'lawyer' }));

      expect(screen.getByRole('heading', { level: 2, name: 'We could not check this document' })).toBeTruthy();
      const retryBtn = screen.getByRole('button', { name: 'Try again' });
      expect(retryBtn.className).toContain('min-h-11');
      expect(retryBtn.className).toContain('focus-visible:outline-2');
    });
  });
});
