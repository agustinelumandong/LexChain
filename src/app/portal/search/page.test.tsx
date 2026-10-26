// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchPage from '@/features/documents/pages/search-page';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a>,
}));

const fetchMock = vi.fn();
const resolvedSearchParams = (q: string, mode = 'text') => Object.assign(Promise.resolve({ q, mode }), { status: 'fulfilled', value: { q, mode } });

async function renderSearch(query: string, mode = 'text') {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const makeTree = (q: string, searchMode: string) => <QueryClientProvider client={queryClient}><Suspense fallback={<p>Loading search</p>}><SearchPage searchParams={resolvedSearchParams(q, searchMode)} /></Suspense></QueryClientProvider>;
  const result = render(makeTree(query, mode));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  return { ...result, rerenderSearch: async (q: string) => {
    await act(async () => {
      result.rerender(makeTree(q, mode));
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
  it('shows human-readable record details alongside match data and opens the document', async () => {
    fetchMock.mockResolvedValue(Response.json({
      query: 'lease',
      results: [{
        chunk_id: 'chunk-1',
        document_id: 'document-12345678',
        chunk_index: 3,
        score: 0.87,
        file_name: 'Lease Agreement.pdf',
        created_at: '2026-10-20T00:00:00Z',
        register_reference: {
          doc_no: 12,
          page_no: 7,
          book_number: 3,
          series_year: 2026,
          label: 'Doc. No. 12, Page No. 7, Book No. 3, Series of 2026',
        },
      }],
    }));
    await renderSearch('lease');

    const result = await screen.findByRole('link', { name: /Lease Agreement\.pdf/ });
    expect(result.getAttribute('href')).toBe('/portal/documents/document-12345678');
    expect(result.textContent).toContain('Document created: Oct 20, 2026');
    expect(result.textContent).toContain('Doc. No. 12, Page No. 7, Book No. 3, Series of 2026');
    expect(result.textContent).toContain('Document ID: document-12345678');
    expect(result.textContent).toContain('Chunk index: 3');
    expect(result.textContent).toContain('Score: 0.87');
    expect(result.textContent).not.toContain('undefined');
  });

  it('omits the register line for an unregistered global-search result', async () => {
    fetchMock.mockResolvedValue(Response.json({
      query: 'draft',
      results: [{
        chunk_id: 'chunk-2',
        document_id: 'document-87654321',
        chunk_index: 0,
        score: 0.81,
        file_name: 'Unfiled draft.pdf',
        created_at: '2026-10-21T00:00:00Z',
        register_reference: null,
      }],
    }));
    await renderSearch('draft');

    expect(await screen.findByRole('heading', { name: 'Unfiled draft.pdf' })).toBeTruthy();
    expect(screen.getByText(/Document created:/).textContent).toContain('Oct 21, 2026');
    expect(screen.queryByText(/Register reference:/)).toBeNull();
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

  it('requires a complete register reference and shows the matching record details', async () => {
    fetchMock.mockResolvedValue(Response.json({ results: [{
      document_id: 'document-12345678',
      file_name: 'Deed of Sale.pdf',
      created_at: '2026-10-20T00:00:00Z',
      register_reference: {
        doc_no: 25,
        page_no: 10,
        book_number: 3,
        series_year: 2026,
        label: 'Doc. No. 25, Page No. 10, Book No. 3, Series of 2026',
      },
    }] }));
    await renderSearch('', 'register');

    expect(screen.getByRole('link', { name: 'Document text' }).getAttribute('href')).toBe('/portal/search');
    expect(screen.getByRole('link', { name: 'Register reference' }).getAttribute('href'))
      .toBe('/portal/search?mode=register');
    const docNo = screen.getByRole('spinbutton', { name: 'Doc. No.' }) as HTMLInputElement;
    const pageNo = screen.getByRole('spinbutton', { name: 'Page No.' }) as HTMLInputElement;
    const bookNo = screen.getByRole('spinbutton', { name: 'Book No.' }) as HTMLInputElement;
    const seriesYear = screen.getByRole('spinbutton', { name: 'Series year' }) as HTMLInputElement;
    expect([docNo, pageNo, bookNo, seriesYear].every((field) => field.required)).toBe(true);

    fireEvent.change(docNo, { target: { value: '25' } });
    fireEvent.change(pageNo, { target: { value: '10' } });
    fireEvent.change(bookNo, { target: { value: '3' } });
    fireEvent.change(seriesYear, { target: { value: '2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search register' }));

    expect(await screen.findByRole('heading', { name: 'Deed of Sale.pdf' })).toBeTruthy();
    expect(screen.getByText('Oct 20, 2026')).toBeTruthy();
    expect(screen.getByText('Doc. No. 25, Page No. 10, Book No. 3, Series of 2026')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open record' }).getAttribute('href'))
      .toBe('/portal/documents/document-12345678');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy?path=%2Fdocuments%2Fregister-lookup%3Fdoc_no%3D25%26page_no%3D10%26book_number%3D3%26series_year%3D2026',
      { credentials: 'same-origin', cache: 'no-store' },
    );
  });

  it('shows an empty state when the complete reference has no matching record', async () => {
    fetchMock.mockResolvedValue(Response.json({ results: [] }));
    await renderSearch('', 'register');

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Doc. No.' }), { target: { value: '25' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Page No.' }), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Book No.' }), { target: { value: '3' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Series year' }), { target: { value: '2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search register' }));

    expect(await screen.findByText('No record found for this reference')).toBeTruthy();
  });
});
