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
  last_doc_no: 12,
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

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

function renderPage(roleHint?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><PortalRoleProvider roleHint={roleHint}><BooksPage /></PortalRoleProvider></QueryClientProvider>);
}

describe('BooksPage', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows API-backed book details when requested', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book]));
      if (url.includes('%2Fbooks%2Fbook-1')) return Promise.resolve(Response.json(book));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'View details for Book 1' }));

    expect(await screen.findByRole('dialog', { name: 'Book details' })).toBeTruthy();
    expect(await screen.findByText('Book details')).toBeTruthy();
    expect(screen.getByText('Status: Open')).toBeTruthy();
    expect(screen.getByText('Entries: 2')).toBeTruthy();
    expect(screen.getByText('Last filing: Doc. 12 · Page 18')).toBeTruthy();
    expect(screen.getByText('Created Jul 1, 2026')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('%2Fusers%2F'), expect.anything());
  });

  it('shows open and closed states with only backend-provided filing counts', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book, closedBook]));
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    renderPage('lawyer');

    expect(await screen.findByText('Open')).toBeTruthy();
    expect(screen.getByText('Closed')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('Doc. 12 · Page 18')).toBeTruthy();
    expect(screen.getByText('Doc. 12 · Page 24')).toBeTruthy();
    expect(screen.queryByText('Full')).toBeNull();
    expect(screen.queryByText('Pages')).toBeNull();
  });

  it('offers closing only for open books', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book, closedBook]));
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    renderPage('lawyer');

    expect(await screen.findByRole('button', { name: 'Close Book 1' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 2' })).toBeNull();
  });

  it('asks before closing and leaves the book open when canceled', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book]));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'Close Book 1' }));

    expect(confirm).toHaveBeenCalledWith('Close Book 1? It cannot be reopened. You can still file documents with the paper register numbers.');
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('book-1%2Fclose'), expect.objectContaining({ method: 'POST' }));
  });

  it('shows pending feedback, then the closed status and timestamp returned by the API', async () => {
    let visibleBook: typeof book | typeof closedBook = book;
    let resolveClose!: (response: Response) => void;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([visibleBook]));
      if (url.includes('%2Fbooks%2Fbook-1%2Fclose') && init?.method === 'POST') {
        return new Promise<Response>((resolve) => { resolveClose = resolve; });
      }
      if (url.includes('%2Fbooks%2Fbook-1')) return Promise.resolve(Response.json(visibleBook));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'View details for Book 1' }));
    expect(await screen.findByText('Status: Open')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close Book 1' }));

    const closeButton = await screen.findByRole('button', { name: 'Closing Book 1' }) as HTMLButtonElement;
    expect(closeButton.disabled).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2Fbook-1%2Fclose', expect.objectContaining({ method: 'POST' }));

    visibleBook = { ...book, status: 'CLOSED', closed_at: '2026-08-01T08:00:00Z' };
    resolveClose(Response.json(visibleBook));

    expect(await screen.findByText('Status: Closed')).toBeTruthy();
    expect(screen.getByText('Closed Aug 1, 2026')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 1' })).toBeNull();
  });

  it('refreshes a book after a 409 close conflict and keeps the backend closed state visible', async () => {
    let visibleBook: typeof book | typeof closedBook = book;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([visibleBook]));
      if (url.includes('%2Fbooks%2Fbook-1%2Fclose') && init?.method === 'POST') {
        visibleBook = { ...book, status: 'CLOSED', closed_at: '2026-08-01T08:00:00Z' };
        return Promise.resolve(Response.json({ detail: 'Book is already closed' }, { status: 409 }));
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'Close Book 1' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Book is already closed');
    expect(await screen.findByText('Closed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 1' })).toBeNull();
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
      if (url.includes('%2Fbooks%2F') && init?.method === 'POST') {
        return Promise.resolve(Response.json(createdBook, { status: 201 }));
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    expect(screen.getByRole('dialog', { name: 'Register a book' })).toBeTruthy();
    expect(screen.getByLabelText('Book status')).toHaveProperty('value', 'OPEN');
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect(await screen.findByRole('heading', { name: 'Book 7' })).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fbooks%2F',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ book_number: 7, series_year: 2026, status: 'OPEN' }) }),
    );
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
    fireEvent.change(screen.getByLabelText('Book status'), { target: { value: 'CLOSED' } });
    expect(screen.getByText('When filing into a migrated book, use the document and page numbers from its paper register.')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect(await screen.findByRole('heading', { name: 'Book 3' })).toBeTruthy();
    expect(screen.getByText('Closed')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fbooks%2F',
      expect.objectContaining({ body: JSON.stringify({ book_number: 3, series_year: 2026, status: 'CLOSED' }) }),
    );
  });

  it.each([
    { status: 400, payload: { detail: 'Another book for this year is still open' }, message: 'Another book for this year is still open' },
    { status: 422, payload: { detail: [{ msg: 'Series year must be 2000 or later' }] }, message: 'Series year must be 2000 or later' },
  ])('keeps entered values and explains book creation failures ($status)', async ({ status, payload, message }) => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([]));
      if (init?.method === 'POST') return Promise.resolve(Response.json(payload, { status }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    if (status === 422) fireEvent.change(screen.getByLabelText('Book status'), { target: { value: 'CLOSED' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect((await screen.findByRole('alert')).textContent).toContain(message);
    expect(screen.getByLabelText('Book number')).toHaveProperty('value', '7');
    expect(screen.getByLabelText('Series year')).toHaveProperty('value', '2026');
    expect(screen.getByLabelText('Book status')).toHaveProperty('value', status === 422 ? 'CLOSED' : 'OPEN');
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

  it('keeps book fields and reports a network failure during creation', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([]));
      if (init?.method === 'POST') return Promise.reject(new TypeError('Failed to fetch'));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage('lawyer');
    fireEvent.click(screen.getByRole('button', { name: 'Register book' }));
    fireEvent.change(screen.getByLabelText('Book number'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Series year'), { target: { value: '2026' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Register book' })[1]);

    expect((await screen.findByRole('alert')).textContent).toContain('Failed to fetch');
    expect(screen.getByLabelText('Book number')).toHaveProperty('value', '7');
    expect(screen.getByLabelText('Series year')).toHaveProperty('value', '2026');
  });

  it('offers deletion only for empty books', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json([book, emptyBook]))));

    renderPage('lawyer');

    expect(await screen.findByRole('button', { name: 'Delete Book 3' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete Book 1' })).toBeNull();
  });

  it('confirms empty-book deletion and refreshes after a bodyless 204 response', async () => {
    let listCalls = 0;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) {
        listCalls += 1;
        return Promise.resolve(Response.json(listCalls === 1 ? [emptyBook] : []));
      }
      if (url.includes('%2Fbooks%2Fbook-empty') && init?.method === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Book 3' }));
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('book-empty'), expect.objectContaining({ method: 'DELETE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Book 3' }));

    expect(await screen.findByRole('heading', { name: 'No register books yet' })).toBeTruthy();
    expect(confirm).toHaveBeenCalledWith('Delete Book 3? Only an empty book can be deleted. Deleting it does not delete any documents.');
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2Fbook-empty', expect.objectContaining({ method: 'DELETE' }));
  });

  it('keeps a book visible and explains a delete conflict', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([emptyBook]));
      if (init?.method === 'DELETE') return Promise.resolve(Response.json({ detail: 'The book has filed entries.' }, { status: 409 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Book 3' }));

    expect((await screen.findByRole('alert')).textContent).toContain('The book has filed entries.');
    expect(screen.getByRole('heading', { name: 'Book 3' })).toBeTruthy();
  });

  it.each(['document_participant', 'document_issuer', 'admin', 'super_admin', 'staff', undefined])('does not show lawyer controls for role hint %j', async (roleHint) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderPage(roleHint);

    expect(screen.getByRole('heading', { name: 'Books unavailable' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Register book' })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
