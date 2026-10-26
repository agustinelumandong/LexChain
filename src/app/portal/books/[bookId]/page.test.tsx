// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookRoutePage from './page';
import { PortalRoleProvider } from '@/features/access/components';
import type { BookEntriesResponse, RegisterBook } from '@/features/office/books-api';

const navigationMocks = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: navigationMocks.replace }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const book: RegisterBook = {
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

const closedBook: RegisterBook = { ...book, status: 'CLOSED', closed_at: '2026-08-01T08:00:00Z' };

const emptyBook: RegisterBook = {
  ...book,
  id: 'book-empty',
  book_number: 3,
  entry_count: 0,
  last_doc_no: null,
  last_page_no: null,
};

const entry: NonNullable<BookEntriesResponse['entries']>[number] = {
  id: 'document-1',
  file_name: 'Deed of Sale.pdf',
  doc_no: 11,
  page_no: 17,
  lifecycle: 'FINALIZED',
  status: 'COMPLETED',
};

const secondEntry: NonNullable<BookEntriesResponse['entries']>[number] = {
  ...entry,
  id: 'document-2',
  file_name: 'Affidavit.pdf',
  doc_no: 12,
  page_no: 18,
  status: null,
};

const earlierPageEntry: NonNullable<BookEntriesResponse['entries']>[number] = {
  ...entry,
  id: 'document-earlier-page',
  file_name: 'Earlier page.pdf',
  page_no: 16,
};

async function renderPage(bookId = 'book-1', roleHint = 'lawyer') {
  const route = await BookRoutePage({ params: Promise.resolve({ bookId }) });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><PortalRoleProvider roleHint={roleHint}>{route}</PortalRoleProvider></QueryClientProvider>);
}

function entryResponse(currentBook: RegisterBook = book, entries: NonNullable<BookEntriesResponse['entries']> = [entry, secondEntry]) {
  return Response.json({ book: currentBook, entries });
}

describe('BookRoutePage', () => {
  beforeEach(() => navigationMocks.replace.mockClear());

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('opens a register page and shows its documents in ascending document and page order', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2Fbook-1%2Fentries')) return Promise.resolve(entryResponse({ ...book, entry_count: 3 }, [secondEntry, entry, earlierPageEntry]));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await renderPage();

    expect(await screen.findByRole('heading', { name: 'Book 1' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to books' }).getAttribute('href')).toBe('/portal/books');
    const ledger = screen.getByRole('list', { name: 'Entries in Book 1' });
    const rows = within(ledger).getAllByRole('listitem');
    expect(rows[0].textContent).toContain('Register 11 · page 16');
    expect(rows[0].textContent).toContain('Earlier page.pdf');
    expect(rows[1].textContent).toContain('Register 11 · page 17');
    expect(rows[1].textContent).toContain('Deed of Sale.pdf');
    expect(rows[2].textContent).toContain('Register 12 · page 18');
    expect(rows[2].textContent).toContain('Affidavit.pdf');
    const deedEntryLink = within(rows[1]).getByRole('link', { name: 'Open Deed of Sale.pdf, document 11, register page 17' });
    expect(deedEntryLink.getAttribute('href')).toBe('/portal/documents/document-1');
    expect(within(deedEntryLink).getByText('Register 11 · page 17')).toBeTruthy();
    expect(within(rows[1]).getByText('Finalized')).toBeTruthy();
    expect(within(rows[1]).getByText('Completed')).toBeTruthy();
    expect(within(rows[2]).getByText('No processing status yet')).toBeTruthy();
    expect(screen.getByText('Lifecycle / processing')).toBeTruthy();
    expect(screen.getByText('Ordered by document number, then page number')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fbooks%2Fbook-1%2Fentries%3Flimit%3D5%26offset%3D0', expect.objectContaining({ credentials: 'same-origin', cache: 'no-store' }));
  });

  it('does not show close or delete controls until the book entries are loaded', async () => {
    let resolveEntries!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2Fbook-1%2Fentries')) return new Promise<Response>((resolve) => { resolveEntries = resolve; });
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    await renderPage();

    expect(await screen.findByText('Opening register book…')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Close Book/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete Book/ })).toBeNull();
    resolveEntries(entryResponse());
    expect(await screen.findByRole('button', { name: 'Close Book 1' })).toBeTruthy();
  });

  it('shows a real empty ledger for books with no recorded documents', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2Fbook-empty%2Fentries')) return Promise.resolve(entryResponse(emptyBook, []));
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    await renderPage('book-empty');

    expect(await screen.findByText('This book is ready for its first entry')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete Book 3' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 3' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Book entries pagination' })).toBeNull();
  });

  it('paginates entries while preserving the API ordering on each page', async () => {
    const firstPage = Array.from({ length: 5 }, (_, index) => ({
      ...entry,
      id: `document-${index + 1}`,
      file_name: `Document ${index + 1}.pdf`,
      doc_no: index + 1,
      page_no: index + 1,
    }));
    const lastEntry = { ...entry, id: 'document-6', file_name: 'Document 6.pdf', doc_no: 6, page_no: 1 };
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('offset%3D5')) return Promise.resolve(entryResponse({ ...book, entry_count: 6 }, [lastEntry]));
      if (url.includes('%2Fbooks%2Fbook-1%2Fentries')) return Promise.resolve(entryResponse({ ...book, entry_count: 6 }, firstPage));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await renderPage();
    expect(await screen.findByRole('link', { name: /^Open Document 1\.pdf/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Open Document 5\.pdf/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /^Open Document 6\.pdf/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(await screen.findByRole('link', { name: /^Open Document 6\.pdf/ })).toBeTruthy();
    expect(screen.getByText('Showing 6–6 of 6 entries')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fbooks%2Fbook-1%2Fentries%3Flimit%3D5%26offset%3D5', expect.objectContaining({ credentials: 'same-origin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(await screen.findByRole('link', { name: /^Open Document 1\.pdf/ })).toBeTruthy();
  });

  it('matches the documents page-size selector and refetches the selected count', async () => {
    const allEntries = Array.from({ length: 6 }, (_, index) => ({
      ...entry,
      id: `document-${index + 1}`,
      file_name: `Document ${index + 1}.pdf`,
      doc_no: index + 1,
      page_no: index + 1,
    }));
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('limit%3D10')) return Promise.resolve(entryResponse({ ...book, entry_count: 6 }, allEntries));
      if (url.includes('%2Fbooks%2Fbook-1%2Fentries')) return Promise.resolve(entryResponse({ ...book, entry_count: 6 }, allEntries.slice(0, 5)));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await renderPage();
    expect(await screen.findByRole('link', { name: /^Open Document 5\.pdf/ })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Open Document/ })).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: '5 / page' }));
    fireEvent.click(screen.getByRole('button', { name: '10 / page' }));

    expect(await screen.findByRole('link', { name: /^Open Document 6\.pdf/ })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Open Document/ })).toHaveLength(6);
    expect(screen.getByText('Showing 1–6 of 6 entries')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy?path=%2Fbooks%2Fbook-1%2Fentries%3Flimit%3D10%26offset%3D0', expect.objectContaining({ credentials: 'same-origin' }));
  });

  it('allows retrying when book entries fail to load', async () => {
    let requests = 0;
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('%2Fbooks%2Fbook-1%2Fentries')) {
        requests += 1;
        return Promise.resolve(requests === 1
          ? Response.json({ detail: 'Service unavailable' }, { status: 503 })
          : entryResponse());
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    }));

    await renderPage();
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: /^Open Deed of Sale\.pdf/ })).toBeTruthy();
    expect(requests).toBe(2);
  });

  it('asks before closing and replaces the open status with the server result', async () => {
    let currentBook: RegisterBook = book;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2Fbook-1%2Fclose') && init?.method === 'POST') {
        currentBook = closedBook;
        return Promise.resolve(Response.json(closedBook));
      }
      if (url.includes('%2Fbooks%2Fbook-1%2Fentries')) return Promise.resolve(entryResponse(currentBook));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    await renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Close Book 1' }));
    expect(confirm).toHaveBeenCalledWith('Close Book 1? It cannot be reopened. You can still file documents with the paper register numbers.');
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('book-1%2Fclose'), expect.objectContaining({ method: 'POST' }));

    fireEvent.click(screen.getByRole('button', { name: 'Close Book 1' }));
    expect(await screen.findByText('Closed', { selector: 'span' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 1' })).toBeNull();
    expect(screen.getByText('Closed', { selector: 'dt' }).nextElementSibling?.textContent).toBe('Aug 1, 2026');
    expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2Fbook-1%2Fclose', expect.objectContaining({ method: 'POST' }));
  });

  it('refreshes the book after a close conflict and shows the server state', async () => {
    let currentBook: RegisterBook = book;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2Fbook-1%2Fclose') && init?.method === 'POST') {
        currentBook = closedBook;
        return Promise.resolve(Response.json({ detail: 'Book is already closed' }, { status: 409 }));
      }
      if (url.includes('%2Fbooks%2Fbook-1%2Fentries')) return Promise.resolve(entryResponse(currentBook));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Close Book 1' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Book is already closed');
    expect(await screen.findByText('Closed', { selector: 'span' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close Book 1' })).toBeNull();
  });

  it('confirms empty-book deletion and returns to the shelf after the API succeeds', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2Fbook-empty') && init?.method === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes('%2Fbooks%2Fbook-empty%2Fentries')) return Promise.resolve(entryResponse(emptyBook, []));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    await renderPage('book-empty');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Book 3' }));
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('book-empty'), expect.objectContaining({ method: 'DELETE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Book 3' }));

    expect(confirm).toHaveBeenCalledWith('Delete Book 3? Only an empty book can be deleted. Deleting it does not delete any documents.');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/portal/proxy-post?path=%2Fbooks%2Fbook-empty', expect.objectContaining({ method: 'DELETE' })));
    await waitFor(() => expect(navigationMocks.replace).toHaveBeenCalledWith('/portal/books'));
  });

  it('keeps the book open and explains a failed delete', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'DELETE') return Promise.resolve(Response.json({ detail: 'The book has filed entries.' }, { status: 409 }));
      if (String(input).includes('%2Fbooks%2Fbook-empty%2Fentries')) return Promise.resolve(entryResponse(emptyBook, []));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderPage('book-empty');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Book 3' }));

    expect((await screen.findByRole('alert')).textContent).toContain('The book has filed entries.');
    expect(screen.getByRole('heading', { name: 'Book 3' })).toBeTruthy();
  });

  it.each(['document_participant', 'document_issuer', 'admin', 'super_admin', 'staff', 'unsupported'])('does not expose a book to role hint %j', async (roleHint) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await renderPage('book-1', roleHint);

    expect(screen.getByRole('heading', { name: 'Books unavailable' })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
