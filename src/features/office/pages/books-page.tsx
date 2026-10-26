'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'sonner';
import { canAccessPortalFeature } from '@/features/access';
import { usePortalRole } from '@/features/access/components';
import { Modal } from '@/features/admin/components/modal';
import { PortalDropdown } from '@/features/portal/components';
import { createRegisterBook, listRegisterBooks } from '@/features/office/books-api';
import type { BookCreateRequest, RegisterBook } from '@/features/office/books-api';

const cardClass = 'rounded-[18px] border border-[#E8F0F8] bg-white';

export default function BooksPage() {
  const queryClient = useQueryClient();
  const role = usePortalRole();
  const [bookNumber, setBookNumber] = useState('');
  const [seriesYear, setSeriesYear] = useState(String(new Date().getFullYear()));
  const [bookStatus, setBookStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isRegistering, setIsRegistering] = useState(false);

  const isIssuer = canAccessPortalFeature(role, 'books');
  const booksQuery = useQuery<RegisterBook[]>({
    queryKey: ['portal-books'],
    queryFn: listRegisterBooks,
    enabled: isIssuer,
    refetchInterval: 15_000,
  });
  const createBookMutation = useMutation({
    mutationFn: createRegisterBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-books'] });
      setBookNumber('');
      setBookStatus('OPEN');
      setIsRegistering(false);
      toast.success('Register book created');
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
    const payload: BookCreateRequest = { book_number: parsedBookNumber, series_year: parsedSeriesYear, status: bookStatus };
    createBookMutation.mutate(payload);
  }

  if (!isIssuer) {
    return (
      <section className={`${cardClass} max-w-xl p-6`}>
        <h1 className="text-xl font-black text-[#0C2B49]">Books unavailable</h1>
        <p className="mt-2 text-sm text-[#64748b]">Register books are available to Lawyers only.</p>
      </section>
    );
  }

  const books = [...(booksQuery.data ?? [])].sort((left, right) => right.series_year - left.series_year || left.book_number - right.book_number);
  const error = createBookMutation.error instanceof Error ? createBookMutation.error.message : null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[#0985E7]">OFFICE REGISTERS</p>
          <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Register books</h1>
          <p className="mt-1 text-sm font-medium text-[#64748b]">Browse physical volumes and the documents recorded in each one.</p>
        </div>
        <button type="button" onClick={() => setIsRegistering(true)} className="flex min-h-11 items-center gap-2 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
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
            <button type="button" onClick={() => setIsRegistering(false)} className="min-h-11 rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49]">Cancel</button>
            <button disabled={!canSubmit || createBookMutation.isPending} className="min-h-11 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-40">
              {createBookMutation.isPending ? 'Registering…' : 'Register book'}
            </button>
          </div>
        </form>
      </Modal>

      {booksQuery.isLoading ? (
        <div role="status" className={`${cardClass} p-8 text-center text-sm font-semibold text-[#64748b]`}>Loading books…</div>
      ) : booksQuery.isError ? (
        <div className={`${cardClass} p-8 text-center`}>
          <p className="text-sm font-bold text-[#0C2B49]">Unable to load books</p>
          <p className="mt-1 text-sm text-[#64748b]">Please try again.</p>
          <button type="button" onClick={() => void booksQuery.refetch()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7] hover:bg-[#EEF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]"><RefreshIcon sx={{ fontSize: 17 }} />Retry</button>
        </div>
      ) : books.length === 0 ? (
        <div className={`${cardClass} p-10 text-center`}>
          <MenuBookIcon sx={{ fontSize: 42, color: '#0985E7' }} />
          <h2 className="mt-3 text-lg font-black text-[#0C2B49]">No register books yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">Register a book before uploading a document, so it can be recorded in the correct physical volume.</p>
          <button type="button" onClick={() => setIsRegistering(true)} className="mt-5 min-h-11 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0770c4]">Register book</button>
        </div>
      ) : (
        <section aria-label="Register book shelf">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#4B6382]">Volumes</h2>
            <p className="text-xs font-semibold text-[#64748b]">{books.length} {books.length === 1 ? 'book' : 'books'}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => {
              const statusLabel = book.status === 'OPEN' ? 'Open' : book.status === 'CLOSED' ? 'Closed' : book.status;
              return (
                <Link
                  key={book.id}
                  href={`/portal/books/${book.id}`}
                  className="group block h-full rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0985E7]"
                >
                  <article className="relative h-full overflow-hidden rounded-[18px] border border-[#D7E4F2] bg-white p-5 transition duration-150 group-hover:-translate-y-0.5 group-hover:border-[#A9CCE9] group-hover:bg-[#FBFDFF] group-hover:shadow-[0_10px_24px_rgba(19,59,115,0.08)]">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2.5 border-r border-[#0876CC]/20 bg-[#0985E7]" />
                    <div className="ml-1.5 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748b]">Office register</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${book.status === 'CLOSED' ? 'bg-[#EEF4FB] text-[#4B6382]' : book.status === 'OPEN' ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#F1F5F9] text-[#64748b]'}`}>{statusLabel}</span>
                      </div>
                      <div className="mt-5 flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#D7E4F2] bg-white text-[#0985E7] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
                          <MenuBookIcon sx={{ fontSize: 23 }} />
                        </span>
                        <div>
                          <h3 className="text-xl font-black leading-tight text-[#0C2B49]">Book {book.book_number}</h3>
                          <p className="mt-1 text-xs font-medium text-[#64748b]">Series {book.series_year}</p>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#D7E4F2] pt-4">
                        <div><p className="text-lg font-black text-[#0C2B49]">{book.entry_count ?? '—'}</p><p className="text-xs font-medium text-[#64748b]">Recorded entries</p></div>
                        <div><p className="text-sm font-black text-[#0C2B49]">Doc. {book.last_doc_no ?? '—'} · Page {book.last_page_no ?? '—'}</p><p className="text-xs font-medium text-[#64748b]">Last filing</p></div>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#B9D9F4] bg-white px-4 py-2 text-sm font-black text-[#0876CC] transition group-hover:bg-[#EAF4FE]">
                          Open book
                          <ArrowForwardIcon className="transition-transform group-hover:translate-x-1" sx={{ fontSize: 18 }} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
