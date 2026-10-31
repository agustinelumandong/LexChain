// @vitest-environment jsdom
import { createElement, Suspense, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessingPage from '@/features/documents/pages/upload-processing-page';
import { mockPortalGet, mockPortalMutate } from '@/lib/mocks/portal';

const { portalRequest } = vi.hoisted(() => ({ portalRequest: vi.fn() }));

vi.mock('@/shared/api/client', () => ({ portalRequest }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: ReactNode }) => createElement('a', { href }, children) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('document processing cache updates', () => {
  it('shows a live status screen while a prepared document waits for finalization', async () => {
    portalRequest.mockResolvedValue({
      json: async () => ({ document_id: 'doc-1', file_name: 'Signed agreement.pdf', lifecycle: 'PREPARING', status: null, on_chain: false }),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await act(async () => render(createElement(QueryClientProvider, { client: queryClient },
      createElement(Suspense, { fallback: null },
        createElement(ProcessingPage, { searchParams: Promise.resolve({ id: 'doc-1' }) }),
      ),
    )));

    expect(await screen.findByRole('heading', { name: 'Waiting for finalization' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Waiting for finalization' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Current status: Preparing');
    expect(screen.getByRole('status').textContent).toContain('OCR processing starts after the document is finalized.');
    queryClient.clear();
  });

  it('recognizes the finalized review-ready state returned by the portal mock', async () => {
    await mockPortalMutate('POST', '/documents/mock-document-2/finalize', new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }), 'mock-token:mock-document-issuer');
    portalRequest.mockResolvedValue(mockPortalGet('/documents/mock-document-2', 'mock-token:mock-document-issuer'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => render(createElement(QueryClientProvider, { client: queryClient },
      createElement(Suspense, { fallback: null },
        createElement(ProcessingPage, { searchParams: Promise.resolve({ id: 'mock-document-2' }) }),
      ),
    )));

    await waitFor(() => expect(screen.getByText('Extracted text ready for review')).toBeTruthy());
    await waitFor(() => expect(invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey)).toEqual(expect.arrayContaining([
      ['portal-doc', 'mock-document-2'],
      ['portal-documents'],
      ['portal-search'],
    ])));
    queryClient.clear();
  });

  it.each(['COMPLETED', 'AWAITING_REVIEW', 'FAILED'])('refreshes document, list, and search data when processing reaches %s', async (status) => {
    portalRequest.mockResolvedValue({
      json: async () => ({ document_id: 'doc-1', file_name: 'Signed agreement.pdf', lifecycle: 'FINALIZED', status, on_chain: true }),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => render(createElement(QueryClientProvider, { client: queryClient },
      createElement(Suspense, { fallback: null },
        createElement(ProcessingPage, { searchParams: Promise.resolve({ id: 'doc-1' }) }),
      ),
    )));

    await waitFor(() => expect(screen.getByText(/Document ready|Extracted text ready for review|Processing failed/)).toBeTruthy());
    await waitFor(() => expect(invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey)).toEqual(expect.arrayContaining([
      ['portal-doc', 'doc-1'],
      ['portal-documents'],
      ['portal-search'],
    ])));
    queryClient.clear();
  });

  it('does not refresh terminal views while backend processing is still active', async () => {
    portalRequest.mockResolvedValue({
      json: async () => ({ document_id: 'doc-1', file_name: 'Signed agreement.pdf', lifecycle: 'FINALIZED', status: 'PROCESSING', on_chain: true }),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => render(createElement(QueryClientProvider, { client: queryClient },
      createElement(Suspense, { fallback: null },
        createElement(ProcessingPage, { searchParams: Promise.resolve({ id: 'doc-1' }) }),
      ),
    )));

    await waitFor(() => expect(screen.getByText(/Processing your document/)).toBeTruthy());
    expect(invalidateQueries).not.toHaveBeenCalled();
    queryClient.clear();
  });
});
