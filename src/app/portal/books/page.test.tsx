// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BooksPage from '@/features/office/pages/books-page';
import { PortalRoleProvider } from '@/features/access/components';

const book = {
  id: 'book-1',
  book_number: 1,
  series_year: 2026,
  status: 'OPEN',
  closed_at: null,
  entry_count: 2,
  last_doc_no: 12,
  last_page_no: 18,
  created_at: '2026-07-01T08:00:00Z',
  updated_at: '2026-07-02T08:00:00Z',
};

const closedBook = {
  ...book,
  id: 'book-2',
  book_number: 2,
  status: 'CLOSED',
  closed_at: '2026-08-01T08:00:00Z',
  entry_count: 12,
  last_page_no: 24,
};

const emptyBook = {
  ...book,
  id: 'book-empty',
  book_number: 3,
  entry_count: 0,
  last_doc_no: null,
  last_page_no: null,
};

const olderBook = { ...book, id: 'book-7', book_number: 7, series_year: 2019 };

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

function renderPage(roleHint?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><PortalRoleProvider roleHint={roleHint}><BooksPage /></PortalRoleProvider></QueryClientProvider>);
}

function selectBookStatus(status: 'OPEN' | 'CLOSED') {
  fireEvent.click(screen.getByRole('button', { name: 'Book status' }));
  fireEvent.click(screen.getByRole('option', { name: status === 'CLOSED' ? /Closed/ : /Open/ }));
}

describe('BooksPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('makes each register cover an open-book link and keeps destructive actions off the shelf', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book, emptyBook]));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');

    const openBookLinks = await screen.findAllByRole('link', { name: /Open book/ });
    const openBookLink = openBookLinks.find((link) => link.getAttribute('href') === '/portal/books/book-1');
    expect(openBookLink).toBeTruthy();
    expect(openBookLink?.getAttribute('href')).toBe('/portal/books/book-1');
    expect(openBookLinks).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Close Book/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete Book/ })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('%2Fentries'), expect.anything());
  });

  it('shows open and closed volumes with backend-provided entry counts and last filing', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book, closedBook]));
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    renderPage('lawyer');

    const openLink = await screen.findByRole('link', { name: /Book 1/ });
    const closedLink = screen.getByRole('link', { name: /Book 2/ });
    expect(openLink.textContent).toContain('Open');
    expect(openLink.textContent).toContain('2');
    expect(openLink.textContent).toContain('Doc. 12 · Page 18');
    expect(closedLink.textContent).toContain('Closed');
    expect(closedLink.textContent).toContain('12');
    expect(closedLink.textContent).toContain('Doc. 12 · Page 24');
  });

  it('orders newer series first and books by ascending number within each series', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([closedBook, olderBook, book]));
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    renderPage('lawyer');

    const links = await screen.findAllByRole('link', { name: /Open book/ });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/portal/books/book-1',
      '/portal/books/book-2',
      '/portal/books/book-7',
    ]);
  });

  it('creates an OPEN book by default and displays the returned book after refresh', async () => {
    let listCalls = 0;
    const createdBook = { ...emptyBook, id: 'book-created', book_number: 7 };
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) {
        listCalls += 1;
        return Promise.resolve(Response.json(listCalls === 1 ? [] : [createdBook]));
      }
      if (url.includes('%2Fbooks%2F') && init?.method === 'POST') return Promise.resolve(Response.json(createdBook, { status: 201 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    expect(screen.getByRole('dialog', { name: 'Register a book' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Book status' }).textContent).toContain('Open');
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect(await screen.findByRole('heading', { name: 'Book 7' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2F', expect.objectContaining({ method: 'POST', body: JSON.stringify({ book_number: 7, series_year: 2026, status: 'OPEN' }) }));
  });

  it('creates a CLOSED book for physical-register migration', async () => {
    let listCalls = 0;
    const createdBook = { ...emptyBook, id: 'book-closed', status: 'CLOSED', closed_at: '2026-09-01T00:00:00Z' };
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) {
        listCalls += 1;
        return Promise.resolve(Response.json(listCalls === 1 ? [] : [createdBook]));
      }
      if (url.includes('%2Fbooks%2F') && init?.method === 'POST') return Promise.resolve(Response.json(createdBook, { status: 201 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    selectBookStatus('CLOSED');
    expect(screen.getByText('When filing into a migrated book, use the document and page numbers from its paper register.')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect(await screen.findByRole('heading', { name: 'Book 3' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2F', expect.objectContaining({ body: JSON.stringify({ book_number: 3, series_year: 2026, status: 'CLOSED' }) }));
  });

  it('keeps entered values and explains book creation failures', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([]));
      if (init?.method === 'POST') return Promise.resolve(Response.json({ detail: [{ msg: 'Series year must be 2000 or later' }] }, { status: 422 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    selectBookStatus('CLOSED');
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect((await screen.findByRole('alert')).textContent).toContain('Series year must be 2000 or later');
    expect(screen.getByLabelText('Book number')).toHaveProperty('value', '7');
    expect(screen.getByLabelText('Series year')).toHaveProperty('value', '2026');
    expect(screen.getByRole('button', { name: 'Book status' }).textContent).toContain('Closed');
  });

  it('blocks book numbers and years outside the API constraints', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json([]))));

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    const submit = screen.getAllByRole('button', { name: 'Register book' })[1];
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '1001' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '1999' } });
    expect(submit).toHaveProperty('disabled', true);

    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2000' } });
    expect(submit).toHaveProperty('disabled', false);
  });

  it.each(['document_participant', 'document_issuer', 'admin', 'super_admin', 'staff', undefined])('does not expose books to role hint %j', async (roleHint) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderPage(roleHint);

    expect(screen.getByRole('heading', { name: 'Books unavailable' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Register book' })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
