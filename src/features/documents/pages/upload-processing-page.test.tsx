// @vitest-environment jsdom
import { createElement, Suspense, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessingPage from '@/features/documents/pages/upload-processing-page';

const { portalRequest } = vi.hoisted(() => ({ portalRequest: vi.fn() }));

vi.mock('@/shared/api/client', () => ({ portalRequest }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: ReactNode }) => createElement('a', { href }, children) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('document processing cache updates', () => {
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
