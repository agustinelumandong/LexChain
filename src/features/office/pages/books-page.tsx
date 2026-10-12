'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'sonner';
import { canAccessPortalFeature } from "@/features/access";
import { usePortalRole } from "@/features/access/components";
import { Modal } from '@/features/admin/components/modal';
import { PortalDropdown } from '@/features/portal/components';
import { listRegisterBooks } from '@/features/office/books-api';

type Book = {
  id: string;
  book_number: number;
  series_year: number;
  status: string;
  closed_at?: string | null;
  entry_count?: number;
  last_doc_no?: number | null;
  last_page_no?: number | null;
  created_at: string;
  updated_at?: string | null;
};

type BookCreateRequest = {
  book_number: number;
  series_year: number;
  status?: 'OPEN' | 'CLOSED';
};

const cardClass = 'rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]';

function getBookErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== 'object' || payload === null) return fallback;

  const detail = 'detail' in payload ? payload.detail : undefined;
  const message = 'message' in payload ? payload.message : undefined;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (typeof item !== 'object' || item === null || !('msg' in item) || typeof item.msg !== 'string') return [];
      return [item.msg];
    });
    if (messages.length) return messages.join(' ');
  }
  if (typeof message === 'string') return message;
  return fallback;
}

async function portalGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Unable to load books');
  return response.json();
}

async function createBook(payload: BookCreateRequest): Promise<Book> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent('/books/')}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(getBookErrorMessage(error, 'Unable to register book'));
  }
  return response.json();
}

async function deleteBook(bookId: string) {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/books/${bookId}`)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(getBookErrorMessage(error, 'Unable to delete book'));
  }
}

async function closeBook(bookId: string): Promise<Book> {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/books/${bookId}/close`)}`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(getBookErrorMessage(error, 'Unable to close book'));
  }
  return response.json();
}

export default function BooksPage() {
  const queryClient = useQueryClient();
  const role = usePortalRole();
  const [bookNumber, setBookNumber] = useState('');
  const [seriesYear, setSeriesYear] = useState(String(new Date().getFullYear()));
  const [bookStatus, setBookStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>();

  const isIssuer = canAccessPortalFeature(role, 'books');
  const booksQuery = useQuery<Book[]>({
    queryKey: ['portal-books'],
    queryFn: listRegisterBooks,
    enabled: isIssuer,
  });
  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-books'] });
      setBookNumber('');
      setBookStatus('OPEN');
      setIsRegistering(false);
      toast.success('Register book created');
    },
  });
  const bookDetailQuery = useQuery<Book>({
    queryKey: ['portal-book', selectedBookId],
    queryFn: () => portalGet(`/books/${selectedBookId}`),
    enabled: Boolean(selectedBookId),
  });
  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: async () => {
      setSelectedBookId(undefined);
      await queryClient.invalidateQueries({ queryKey: ['portal-books'] });
      toast.success('Book deleted');
    },
  });
  const closeBookMutation = useMutation({
    mutationFn: closeBook,
    onSuccess: async (closedBook) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-book', closedBook.id] }),
      ]);
      queryClient.setQueryData<Book[]>(['portal-books'], (current) => current?.map((book) => book.id === closedBook.id ? closedBook : book));
      queryClient.setQueryData(['portal-book', closedBook.id], closedBook);
      toast.success('Register book closed');
    },
    onError: async (_error, bookId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-book', bookId] }),
      ]);
    },
  });

  const parsedBookNumber = Number(bookNumber);
  const parsedSeriesYear = Number(seriesYear);
  const canSubmit = Number.isInteger(parsedBookNumber)
    && parsedBookNumber >= 1
    && parsedBookNumber <= 1000
    && Number.isInteger(parsedSeriesYear)
    && parsedSeriesYear >= 2000;

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isIssuer || !canSubmit) return;
    createBookMutation.mutate({ book_number: parsedBookNumber, series_year: parsedSeriesYear, status: bookStatus });
  }

  function handleDelete(book: Book) {
    if (book.entry_count !== 0 || deleteBookMutation.isPending) return;
    if (window.confirm(`Delete Book ${book.book_number}? Only an empty book can be deleted. Deleting it does not delete any documents.`)) {
      deleteBookMutation.mutate(book.id);
    }
  }

  function handleClose(book: Book) {
    if (book.status !== 'OPEN' || closeBookMutation.isPending) return;
    if (window.confirm(`Close Book ${book.book_number}? It cannot be reopened. You can still file documents with the paper register numbers.`)) {
      closeBookMutation.mutate(book.id);
    }
  }

  if (!isIssuer) {
    return (
      <section className={`${cardClass} max-w-xl p-6`}>
        <h1 className="text-xl font-black text-[#0C2B49]">Books unavailable</h1>
        <p className="mt-2 text-sm text-[#64748b]">Register books are available to Lawyers only.</p>
      </section>
    );
  }

  const books = booksQuery.data ?? [];
  const error = createBookMutation.error instanceof Error ? createBookMutation.error.message : null;
  const deleteError = deleteBookMutation.error instanceof Error ? deleteBookMutation.error.message : null;
  const closeError = closeBookMutation.error instanceof Error ? closeBookMutation.error.message : null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[#0985E7]">REGISTER BOOKS</p>
          <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Books</h1>
          <p className="mt-1 text-sm font-medium text-[#64748b]">Manage legal register volumes and their documents.</p>
        </div>
        <button type="button" onClick={() => setIsRegistering(true)} className="flex items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]">
          <AddIcon sx={{ fontSize: 18 }} />
          Register book
        </button>
      </div>

      <Modal open={isRegistering} onClose={() => setIsRegistering(false)} title="Register a book">
        <form onSubmit={handleRegister}>
          <p className="text-sm text-[#64748b]">Add a physical register volume before uploading documents.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Book number
              <input required min="1" max="1000" inputMode="numeric" type="number" value={bookNumber} onChange={(event) => setBookNumber(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]" placeholder="1" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Series year
              <input required min="2000" inputMode="numeric" type="number" value={seriesYear} onChange={(event) => setSeriesYear(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]" />
            </label>
            <div className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49] sm:col-span-2">
              <span>Book status</span>
              <PortalDropdown
                ariaLabel="Book status"
                options={[{ label: 'Open — current register', value: 'OPEN' }, { label: 'Closed — migrate a finished physical register', value: 'CLOSED' }]}
                value={bookStatus}
                onChange={(value) => setBookStatus(value === 'CLOSED' ? 'CLOSED' : 'OPEN')}
              />
            </div>
          </div>
          {bookStatus === 'CLOSED' && <p className="mt-3 text-sm text-[#64748b]">When filing into a migrated book, use the document and page numbers from its paper register.</p>}
          {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setIsRegistering(false)} className="rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49]">Cancel</button>
            <button disabled={!canSubmit || createBookMutation.isPending} className="rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-40">
              {createBookMutation.isPending ? 'Registering…' : 'Register book'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(selectedBookId)} onClose={() => setSelectedBookId(undefined)} title="Book details">
          {bookDetailQuery.isLoading ? <p className="text-sm text-[#64748b]">Loading book details…</p> : bookDetailQuery.isError ? <p role="alert" className="text-sm font-bold text-red-600">Unable to load book details.</p> : bookDetailQuery.data && <>
            <p className="mt-1 text-sm text-[#64748b]">Status: {bookDetailQuery.data.status === 'OPEN' ? 'Open' : bookDetailQuery.data.status === 'CLOSED' ? 'Closed' : bookDetailQuery.data.status}</p>
            <p className="mt-1 text-sm text-[#64748b]">Entries: {bookDetailQuery.data.entry_count ?? '—'}</p>
            <p className="mt-1 text-sm text-[#64748b]">Last filing: Doc. {bookDetailQuery.data.last_doc_no ?? '—'} · Page {bookDetailQuery.data.last_page_no ?? '—'}</p>
            <p className="mt-1 text-sm text-[#64748b]">Created {new Date(bookDetailQuery.data.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
            {bookDetailQuery.data.updated_at && <p className="mt-1 text-sm text-[#64748b]">Last updated {new Date(bookDetailQuery.data.updated_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>}
            {bookDetailQuery.data.closed_at && <p className="mt-1 text-sm text-[#64748b]">Closed {new Date(bookDetailQuery.data.closed_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>}
          </>}
      </Modal>

      {booksQuery.isLoading ? (
        <div className={`${cardClass} p-8 text-center text-sm font-semibold text-[#64748b]`}>Loading books…</div>
      ) : booksQuery.isError ? (
        <div className={`${cardClass} p-8 text-center`}>
          <p className="text-sm font-bold text-[#0C2B49]">Unable to load books</p>
          <p className="mt-1 text-sm text-[#64748b]">Please try again.</p>
          <button type="button" onClick={() => void booksQuery.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7] hover:bg-[#EEF6FF]"><RefreshIcon sx={{ fontSize: 17 }} />Retry</button>
        </div>
      ) : books.length === 0 ? (
        <div className={`${cardClass} p-10 text-center`}>
          <MenuBookIcon sx={{ fontSize: 42, color: '#0985E7' }} />
          <h2 className="mt-3 text-lg font-black text-[#0C2B49]">No register books yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">Register a book before uploading a document, so it can be recorded in the correct physical volume.</p>
          <button type="button" onClick={() => setIsRegistering(true)} className="mt-5 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]">Register book</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const statusLabel = book.status === 'OPEN' ? 'Open' : book.status === 'CLOSED' ? 'Closed' : book.status;
            return <article key={book.id} className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-lg font-black text-[#0C2B49]">Book {book.book_number}</h2><p className="mt-1 text-sm text-[#64748b]">Series {book.series_year}</p></div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${book.status === 'CLOSED' ? 'bg-[#EEF4FB] text-[#4B6382]' : book.status === 'OPEN' ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#F1F5F9] text-[#64748b]'}`}>{statusLabel}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#E8F0F8] pt-4">
                <div><p className="text-xl font-black text-[#0C2B49]">{book.entry_count ?? '—'}</p><p className="text-xs font-medium text-[#64748b]">Entries</p></div>
                <div><p className="text-sm font-black text-[#0C2B49]">Doc. {book.last_doc_no ?? '—'} · Page {book.last_page_no ?? '—'}</p><p className="text-xs font-medium text-[#64748b]">Last filing</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSelectedBookId(book.id)} className="rounded-full border border-[#D7E4F2] px-3 py-1.5 text-sm font-bold text-[#0C2B49]" aria-label={`View details for Book ${book.book_number}`}>Details</button>
                {book.status === 'OPEN' && <button type="button" onClick={() => handleClose(book)} disabled={closeBookMutation.isPending} className="rounded-full border border-[#D7E4F2] px-3 py-1.5 text-sm font-bold text-[#0C2B49] disabled:opacity-40" aria-label={`${closeBookMutation.isPending && closeBookMutation.variables === book.id ? 'Closing' : 'Close'} Book ${book.book_number}`}>{closeBookMutation.isPending && closeBookMutation.variables === book.id ? 'Closing…' : 'Close'}</button>}
                {book.entry_count === 0 && <button type="button" onClick={() => handleDelete(book)} disabled={deleteBookMutation.isPending} className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 disabled:opacity-40" aria-label={`Delete Book ${book.book_number}`}>{deleteBookMutation.isPending ? 'Deleting…' : 'Delete'}</button>}
              </div>
              <p className="mt-4 truncate text-[11px] font-semibold text-[#A0AAB8]" title={book.id}>ID: {book.id}</p>
            </article>;
          })}
        </div>
      )}
      {deleteError && <p role="alert" className="text-sm font-bold text-red-600">{deleteError}</p>}
      {closeError && <p role="alert" className="text-sm font-bold text-red-600">{closeError}</p>}
    </div>
  );
}
