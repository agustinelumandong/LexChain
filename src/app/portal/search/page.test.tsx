// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchPage from '@/features/documents/pages/search-page';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a>,
}));

const fetchMock = vi.fn();
const resolvedSearchParams = (q: string) => Object.assign(Promise.resolve({ q }), { status: 'fulfilled', value: { q } });

async function renderSearch(query: string) {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const makeTree = (q: string) => <QueryClientProvider client={queryClient}><Suspense fallback={<p>Loading search</p>}><SearchPage searchParams={resolvedSearchParams(q)} /></Suspense></QueryClientProvider>;
  const result = render(makeTree(query));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  return { ...result, rerenderSearch: async (q: string) => {
    await act(async () => {
      result.rerender(makeTree(q));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  } };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('SearchPage', () => {
  it('renders documented identifiers and score, opens the matching document, and omits absent snippets', async () => {
    fetchMock.mockResolvedValue(Response.json({
      query: 'lease',
      results: [{ chunk_id: 'chunk-1', document_id: 'document-12345678', chunk_index: 3, score: 0.87 }],
    }));
    await renderSearch('lease');

    const result = await screen.findByRole('link', { name: /Document ID: document-12345678/ });
    expect(result.getAttribute('href')).toBe('/portal/documents/document-12345678');
    expect(result.textContent).toContain('Chunk index: 3');
    expect(result.textContent).toContain('Score: 0.87');
    expect(result.textContent).not.toContain('undefined');
    expect(result.querySelector('p')).toBeNull();
  });

  it('shows no matches separately from a service failure', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ query: 'missing', results: [] }))
      .mockResolvedValueOnce(Response.json({ message: 'offline' }, { status: 503 }));
    const { rerenderSearch } = await renderSearch('missing');
    expect(await screen.findByText('No results found')).toBeTruthy();

    await rerenderSearch('offline');
    expect((await screen.findByRole('alert')).textContent).toContain('Search failed');
    expect(screen.queryByText('No results found')).toBeNull();
  });
});
