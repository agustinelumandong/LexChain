// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('requires confirmation before deleting a book', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('%2Fbooks%2F%3Flimit')) return Promise.resolve(Response.json([book]));
      if (url.includes('%2Fbooks%2Fbook-1') && init?.method === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage('lawyer');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Book 1' }));
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('book-1'), expect.objectContaining({ method: 'DELETE' }));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Book 1' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fbooks%2Fbook-1',
      expect.objectContaining({ method: 'DELETE' }),
    ));
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
