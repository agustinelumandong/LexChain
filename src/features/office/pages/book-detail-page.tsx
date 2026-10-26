'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'sonner';
import { canAccessPortalFeature } from '@/features/access';
import { usePortalRole } from '@/features/access/components';
import { getDocumentLifecycleLabel, getDocumentStatusLabel } from '@/features/documents/document-ui';
import { BOOK_ENTRIES_PAGE_SIZE, closeRegisterBook, deleteRegisterBook, listRegisterBookEntries } from '@/features/office/books-api';
import type { BookEntriesResponse, RegisterBook } from '@/features/office/books-api';

const cardClass = 'rounded-[18px] border border-[#E8F0F8] bg-white';

export default function BookDetailPage({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const role = usePortalRole();
  const [entryOffset, setEntryOffset] = useState(0);
  const isIssuer = canAccessPortalFeature(role, 'books');

  const bookEntriesQuery = useQuery<BookEntriesResponse>({
    queryKey: ['portal-book-entries', bookId, entryOffset],
    queryFn: () => listRegisterBookEntries(bookId, entryOffset),
    enabled: isIssuer && Boolean(bookId),
    refetchInterval: 15_000,
  });
  const closeBookMutation = useMutation({
    mutationFn: closeRegisterBook,
    onSuccess: async (closedBook) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-book-entries', closedBook.id] }),
      ]);
      queryClient.setQueryData<RegisterBook[]>(['portal-books'], (current) => current?.map((book) => book.id === closedBook.id ? closedBook : book));
      queryClient.setQueriesData<BookEntriesResponse>({ queryKey: ['portal-book-entries', closedBook.id] }, (current) => current ? { ...current, book: closedBook } : current);
      toast.success('Register book closed');
    },
    onError: async (_error, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-book-entries', id] }),
      ]);
    },
  });
  const deleteBookMutation = useMutation({
    mutationFn: deleteRegisterBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-books'] });
      toast.success('Book deleted');
      router.replace('/portal/books');
    },
  });

  if (!isIssuer) {
    return (
      <section className={`${cardClass} max-w-xl p-6`}>
        <h1 className="text-xl font-black text-[#0C2B49]">Books unavailable</h1>
        <p className="mt-2 text-sm text-[#64748b]">Register books are available to Lawyers only.</p>
      </section>
    );
  }

  const book = bookEntriesQuery.data?.book;
  const entries = [...(bookEntriesQuery.data?.entries ?? [])].sort((left, right) => left.doc_no - right.doc_no || left.page_no - right.page_no);
  const totalEntries = book?.entry_count ?? 0;
  const entryRangeEnd = Math.min(entryOffset + entries.length, totalEntries);
  const hasNextEntryPage = entryOffset + BOOK_ENTRIES_PAGE_SIZE < totalEntries;
  const closeError = closeBookMutation.error instanceof Error ? closeBookMutation.error.message : null;
  const deleteError = deleteBookMutation.error instanceof Error ? deleteBookMutation.error.message : null;

  function handleClose() {
    if (!book || book.status !== 'OPEN' || closeBookMutation.isPending) return;
    if (window.confirm(`Close Book ${book.book_number}? It cannot be reopened. You can still file documents with the paper register numbers.`)) {
      closeBookMutation.mutate(book.id);
    }
  }

  function handleDelete() {
    if (!book || book.entry_count !== 0 || entries.length !== 0 || deleteBookMutation.isPending) return;
    if (window.confirm(`Delete Book ${book.book_number}? Only an empty book can be deleted. Deleting it does not delete any documents.`)) {
      deleteBookMutation.mutate(book.id);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Link href="/portal/books" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-sm font-bold text-[#0876CC] hover:text-[#0C2B49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        Back to books
      </Link>

      {bookEntriesQuery.isLoading ? (
        <section role="status" className={`${cardClass} p-8 text-center text-sm font-semibold text-[#64748b]`}>Opening register book…</section>
      ) : bookEntriesQuery.isError ? (
        <section className={`${cardClass} p-6`}>
          <h1 className="text-xl font-black text-[#0C2B49]">Unable to open this book</h1>
          <p role="alert" className="mt-2 text-sm text-[#64748b]">The register entries could not be loaded. Please try again.</p>
          <button type="button" onClick={() => void bookEntriesQuery.refetch()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7] hover:bg-[#EEF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
            <RefreshIcon sx={{ fontSize: 17 }} />Retry
          </button>
        </section>
      ) : book ? (
        <>
          <section className={`${cardClass} overflow-hidden`}>
            <div className="relative overflow-hidden bg-[#EAF4FE] px-6 py-6 text-[#0C2B49] sm:px-8">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-3 border-r border-[#0876CC]/20 bg-[#0985E7]" />
              <div className="ml-2 flex flex-wrap items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#D7E4F2] bg-white text-[#0985E7]">
                    <MenuBookIcon sx={{ fontSize: 26 }} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#0876CC]">Office register · Series {book.series_year}</p>
                    <h1 className="mt-1 text-[26px] font-black leading-tight">Book {book.book_number}</h1>
                    <p className="mt-1 text-sm font-medium text-[#4B6382]">{totalEntries} {totalEntries === 1 ? 'recorded entry' : 'recorded entries'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-black ${book.status === 'CLOSED' ? 'bg-[#EEF4FB] text-[#4B6382]' : book.status === 'OPEN' ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#F1F5F9] text-[#64748b]'}`}>
                    {book.status === 'OPEN' ? 'Open' : book.status === 'CLOSED' ? 'Closed' : book.status}
                  </span>
                </div>
              </div>
            </div>
            <dl className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
              <div><dt className="text-xs font-semibold text-[#64748b]">Recorded entries</dt><dd className="mt-1 text-sm font-black text-[#0C2B49]">{totalEntries}</dd></div>
              <div><dt className="text-xs font-semibold text-[#64748b]">Last filing</dt><dd className="mt-1 text-sm font-black text-[#0C2B49]">Doc. {book.last_doc_no ?? '—'} · Page {book.last_page_no ?? '—'}</dd></div>
              <div><dt className="text-xs font-semibold text-[#64748b]">Created</dt><dd className="mt-1 text-sm font-black text-[#0C2B49]">{new Date(book.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div>
              <div><dt className="text-xs font-semibold text-[#64748b]">{book.closed_at ? 'Closed' : 'Last updated'}</dt><dd className="mt-1 text-sm font-black text-[#0C2B49]">{new Date(book.closed_at ?? book.updated_at ?? book.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div>
            </dl>
          </section>

          {(closeError || deleteError) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{closeError ?? deleteError}</p>}

          <section aria-labelledby="book-entries-heading" className={`${cardClass} overflow-hidden`}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E8F0F8] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0985E7]">Register ledger</p>
                <h2 id="book-entries-heading" className="mt-1 text-lg font-black text-[#0C2B49]">Entries</h2>
              </div>
              <p className="text-xs font-medium text-[#64748b]">Ordered by document number, then page number</p>
            </div>
            <p className="border-b border-[#E8F0F8] bg-[#F8FBFF] px-5 py-3 text-xs leading-5 text-[#64748b] sm:px-6">Only documents recorded in LexChain appear here. Paper-only register lines are outside this list.</p>

            {entries.length > 0 ? (
              <ol start={entryOffset + 1} aria-label={`Entries in Book ${book.book_number}`} className="list-decimal marker:font-black marker:text-[#98AFC8]">
                {entries.map((entry) => (
                  <li key={entry.id} className="border-b border-[#E8F0F8] text-sm last:border-b-0">
                    <Link href={`/portal/documents/${entry.id}`} title={entry.file_name} aria-label={`Open ${entry.file_name}, document ${entry.doc_no}, register page ${entry.page_no}`} className="grid gap-x-4 gap-y-1 px-5 py-4 pl-2 transition-colors hover:bg-[#F8FBFF] focus-visible:bg-[#F8FBFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0985E7] sm:grid-cols-[minmax(10rem,0.75fr)_minmax(0,1.5fr)] sm:px-6 sm:py-4">
                      <div className="min-w-0 sm:pl-2">
                        <p className="font-black text-[#0C2B49]">Doc. {entry.doc_no}</p>
                        <p className="mt-1 text-xs font-semibold text-[#4B6382]">Register page {entry.page_no}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="block break-words font-bold text-[#0876CC]">{entry.file_name}</span>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-5 text-[#64748b]">
                          <span>Lifecycle: {getDocumentLifecycleLabel(entry.lifecycle)}</span>
                          <span>Processing: {getDocumentStatusLabel(entry.status)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : totalEntries === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <MenuBookIcon sx={{ fontSize: 36, color: '#8EBCE5' }} />
                <h3 className="mt-2 text-sm font-black text-[#0C2B49]">This book is ready for its first entry</h3>
                <p className="mt-1 text-sm text-[#64748b]">Documents filed in this register will appear here in order.</p>
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-[#64748b]">No entries on this page.</p>
            )}

            {totalEntries > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8F0F8] bg-[#FBFDFF] px-5 py-3 sm:px-6">
                <p role="status" className="text-xs font-semibold text-[#64748b]">
                  {entries.length > 0 ? `Showing ${entryOffset + 1}–${entryRangeEnd} of ${totalEntries} entries` : `${totalEntries} entries recorded`}
                </p>
                <nav aria-label="Book entries pagination" className="flex gap-2">
                  <button type="button" onClick={() => setEntryOffset((current) => Math.max(0, current - BOOK_ENTRIES_PAGE_SIZE))} disabled={entryOffset === 0} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#EEF6FF] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
                    <ArrowBackIcon sx={{ fontSize: 17 }} />Previous
                  </button>
                  <button type="button" onClick={() => setEntryOffset((current) => current + BOOK_ENTRIES_PAGE_SIZE)} disabled={!hasNextEntryPage} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#EEF6FF] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
                    Next<ArrowForwardIcon sx={{ fontSize: 17 }} />
                  </button>
                </nav>
              </div>
            )}
          </section>

          {bookEntriesQuery.isSuccess && (book.status === 'OPEN' || (book.entry_count === 0 && entries.length === 0)) && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {book.status === 'OPEN' && (
                <button type="button" onClick={handleClose} disabled={closeBookMutation.isPending} className="min-h-11 rounded-full border border-[#D7E4F2] bg-white px-4 py-2 text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF6FF] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
                  {closeBookMutation.isPending ? `Closing Book ${book.book_number}…` : `Close Book ${book.book_number}`}
                </button>
              )}
              {book.entry_count === 0 && entries.length === 0 && (
                <button type="button" onClick={handleDelete} disabled={deleteBookMutation.isPending} className="min-h-11 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">
                  {deleteBookMutation.isPending ? `Deleting Book ${book.book_number}…` : `Delete Book ${book.book_number}`}
                </button>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
