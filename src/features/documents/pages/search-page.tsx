'use client';

import { use, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import {
  searchDocumentsByRegisterReference,
  searchPortalDocuments,
} from '@/features/documents/search-api';

const registerFields = [
  { name: 'doc_no', label: 'Doc. No.', min: 1 },
  { name: 'page_no', label: 'Page No.', min: 1 },
  { name: 'book_number', label: 'Book No.', min: 1, max: 1000 },
  { name: 'series_year', label: 'Series year', min: 2000 },
] as const;
const recordDateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  const params = use(searchParams);
  const query = params.q ?? '';
  const mode = params.mode === 'register' ? 'register' : 'text';
  const [registerReference, setRegisterReference] = useState({
    doc_no: '',
    page_no: '',
    book_number: '',
    series_year: '',
  });

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['portal-search', query],
    queryFn: () => searchPortalDocuments(query),
    enabled: mode === 'text' && query.trim().length > 0,
  });
  const registerLookup = useMutation({ mutationFn: searchDocumentsByRegisterReference });

  function submitRegisterSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerLookup.mutate({
      doc_no: Number(registerReference.doc_no),
      page_no: Number(registerReference.page_no),
      book_number: Number(registerReference.book_number),
      series_year: Number(registerReference.series_year),
    });
  }

  return (
    <div className={`flex flex-col gap-5 ${mode === 'register' ? 'max-w-5xl' : 'w-full'}`}>
      <div>
        <h1 className="text-2xl font-black text-[#0C2B49]">
          {mode === 'register' ? 'Find a document by register reference' : 'Search'}
        </h1>
        <p className="mt-1 text-sm text-[#5B6F8A]">
          {mode === 'register'
            ? 'Use the exact details from a notarial register entry.'
            : 'Find a document by its text using the search bar above.'}
        </p>
      </div>

      {mode === 'register' && <nav aria-label="Search mode" className="flex w-fit gap-1 rounded-xl bg-[#F2F7FC] p-1">
        <Link
          href="/portal/search"
          className="rounded-lg px-3 py-2 text-sm font-bold text-[#5B6F8A] transition hover:text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
        >
          Document text
        </Link>
        <Link
          href="/portal/search?mode=register"
          aria-current={mode === 'register' ? 'page' : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] ${mode === 'register' ? 'bg-white text-[#0C2B49] shadow-sm' : 'text-[#5B6F8A] hover:text-[#0C2B49]'}`}
        >
          Register reference
        </Link>
      </nav>}

      {mode === 'text' ? (
        <>
          {!query && (
            <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
              <p className="text-sm font-bold text-[#0C2B49]">Search your documents</p>
              <p className="mt-1 text-xs text-[#5B6F8A]">Enter keywords or a question to find matching document text.</p>
            </div>
          )}

          {(isLoading || isFetching) && (
            <div role="status" className="flex flex-col gap-3" aria-label="Searching document text">
              {[0, 1, 2].map((index) => <div key={index} className="h-20 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />)}
              <span className="sr-only">Searching document text…</span>
            </div>
          )}

          {isError && <p role="alert" className="text-sm font-bold text-red-700">Search failed. Please try again.</p>}

          {data && !isFetching && (
            <>
              <p className="text-xs font-bold text-[#5B6F8A]">
                {data.results.length} result{data.results.length !== 1 ? 's' : ''} for &ldquo;{data.query}&rdquo;
              </p>
              {data.results.length === 0 && (
                <EmptyState
                  icon={<SearchOffOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
                  title="No results found"
                  description="Try different keywords."
                />
              )}
              <div className="flex flex-col gap-3">
                {data.results.map((result) => (
                  <Link
                    key={result.chunk_id}
                    href={`/portal/documents/${result.document_id}`}
                    className="block min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-4 transition hover:border-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FF]">
                          <DescriptionIcon sx={{ fontSize: 20, color: '#0067B3' }} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="min-w-0 break-words text-sm font-black text-[#0C2B49]">{result.file_name}</h2>
                          {result.register_reference && (
                            <p className="mt-1 break-words text-xs font-semibold text-[#5B6F8A]">
                              Register reference: <span className="font-bold text-[#0C2B49]">{result.register_reference.label}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-[#5B6F8A]">
                        Document created: <time dateTime={result.created_at}>{recordDateFormat.format(new Date(result.created_at))}</time>
                      </p>
                    </div>
                    {result.text?.trim() && <p className="mt-3 line-clamp-3 break-words text-sm text-[#0C2B49]">{result.text}</p>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
            <form onSubmit={submitRegisterSearch} className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
              <fieldset disabled={registerLookup.isPending} className="flex flex-col gap-4">
                <legend className="text-lg font-bold text-[var(--text-primary)]">Enter the register reference</legend>
                <p id="register-reference-help" className="text-sm text-[var(--text-muted)]">
                  Copy all 4 values from the same register entry. Every field is required, and all 4 must match exactly.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {registerFields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="text-sm font-semibold text-[var(--text-primary)]">
                        {field.label} <span aria-hidden="true" className="text-[#B42318]">*</span>
                      </label>
                      <Input
                        id={field.name}
                        type="number"
                        name={field.name}
                        autoComplete="off"
                        required
                        min={field.min}
                        max={'max' in field ? field.max : undefined}
                        step="1"
                        inputMode="numeric"
                        aria-describedby="register-reference-help"
                        value={registerReference[field.name]}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setRegisterReference((current) => ({ ...current, [field.name]: value }));
                        }}
                        className="[font-variant-numeric:tabular-nums]"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={registerLookup.isPending}
                  aria-busy={registerLookup.isPending}
                  className="w-fit"
                >
                  {registerLookup.isPending ? (
                    <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white motion-reduce:animate-none" />
                  ) : (
                    <SearchIcon fontSize="small" aria-hidden="true" />
                  )}
                  {registerLookup.isPending ? 'Searching…' : 'Search register'}
                </Button>
              </fieldset>
            </form>

            <aside aria-labelledby="register-reference-guide">
              <Card className="h-full">
                <h2 id="register-reference-guide" className="text-lg font-bold text-[var(--text-primary)]">How to read the reference</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Match each number to the same entry in the register.</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Example entry</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">Doc. No.</dt>
                    <dd className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text-primary)]">25</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">Page No.</dt>
                    <dd className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text-primary)]">10</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">Book No.</dt>
                    <dd className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text-primary)]">3</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-muted)]">Series year</dt>
                    <dd className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text-primary)]">2026</dd>
                  </div>
                </dl>
                <p className="mt-4 border-t border-[var(--border-soft)] pt-4 text-sm text-[var(--text-muted)]">
                  Book numbers are specific to each lawyer, so one reference may match more than one document.
                </p>
              </Card>
            </aside>
          </div>

          {registerLookup.isPending && <p role="status" className="text-sm font-semibold text-[#5B6F8A]">Searching the register…</p>}
          {registerLookup.isError && <p role="alert" className="text-sm font-bold text-red-700">{registerLookup.error.message}</p>}

          {registerLookup.data && registerLookup.variables && (
            <section aria-labelledby="register-results-heading" aria-live="polite" className="flex flex-col gap-3">
              <div>
                <h2 id="register-results-heading" className="text-lg font-bold text-[var(--text-primary)]">Search results</h2>
                <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
                  {registerLookup.data.results.length} matching record{registerLookup.data.results.length === 1 ? '' : 's'}
                </p>
                <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                  Searched reference: <span className="font-semibold text-[var(--text-primary)]">
                    Doc. No. {registerLookup.variables.doc_no} · Page No. {registerLookup.variables.page_no} · Book No. {registerLookup.variables.book_number} · Series of {registerLookup.variables.series_year}
                  </span>
                </p>
              </div>
              {registerLookup.data.results.length === 0 ? (
                <EmptyState
                  icon={<MenuBookOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
                  title="No record found for this reference"
                  description="Check Doc. No., Page No., Book No., and Series year against the register. All 4 values must match exactly."
                />
              ) : (
                <ul className="flex flex-col gap-3" aria-label="Register lookup results">
                  {registerLookup.data.results.map((result) => (
                    <li key={result.document_id} className="flex flex-col gap-4 rounded-[18px] border border-[#E8F0F8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="min-w-0">
                        <h2 className="break-words text-sm font-black text-[#0C2B49]">{result.file_name}</h2>
                        <p className="mt-1 text-xs font-semibold text-[#5B6F8A]">
                          Document created: <time dateTime={result.created_at}>{recordDateFormat.format(new Date(result.created_at))}</time>
                        </p>
                        <p className="mt-1 break-words text-xs font-semibold text-[#5B6F8A]">
                          Register reference: <span className="font-bold text-[#0C2B49]">{result.register_reference.label}</span>
                        </p>
                      </div>
                      <Link
                        href={`/portal/documents/${result.document_id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] transition hover:border-[#0067B3] hover:bg-[#F2F8FE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
                      >
                        <InsertDriveFileIcon sx={{ fontSize: 16, color: '#0067B3' }} aria-hidden="true" />
                        Open record
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
