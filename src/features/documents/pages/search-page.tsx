'use client';

import { use, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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
  const router = useRouter();
  const params = use(searchParams);
  const query = params.q ?? '';
  const mode = params.mode === 'register' ? 'register' : 'text';
  const [input, setInput] = useState(query);
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

  function submitTextSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = input.trim();
    if (nextQuery) router.push(`/portal/search?q=${encodeURIComponent(nextQuery)}`);
  }

  function submitRegisterSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerLookup.mutate({
      doc_no: Number(registerReference.doc_no),
      page_no: Number(registerReference.page_no),
      book_number: Number(registerReference.book_number),
      series_year: Number(registerReference.series_year),
    });
  }

  const textSearchHref = input.trim()
    ? `/portal/search?q=${encodeURIComponent(input.trim())}`
    : '/portal/search';

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Search</h1>
        <p className="mt-1 text-sm text-[#5B6F8A]">Find a document by its text or exact notarial register reference.</p>
      </div>

      <nav aria-label="Search mode" className="flex w-fit gap-1 rounded-xl bg-[#F2F7FC] p-1">
        <Link
          href={textSearchHref}
          aria-current={mode === 'text' ? 'page' : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] ${mode === 'text' ? 'bg-white text-[#0C2B49] shadow-sm' : 'text-[#5B6F8A] hover:text-[#0C2B49]'}`}
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
      </nav>

      {mode === 'text' ? (
        <>
          <form onSubmit={submitTextSearch} className="flex gap-2 rounded-[18px] border border-[#E8F0F8] bg-white p-2">
            <SearchIcon sx={{ color: '#5B6F8A', ml: 1, alignSelf: 'center' }} aria-hidden="true" />
            <input
              type="search"
              name="q"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder="Search document text…"
              aria-label="Search document text"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[#0C2B49] outline-none placeholder:text-[#5B6F8A]"
            />
            <button type="submit" className="rounded-[12px] bg-[#0067B3] px-4 py-2 text-xs font-black text-white hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
              Search
            </button>
          </form>

          {!query && (
            <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
              <p className="text-sm font-bold text-[#0C2B49]">Search your documents</p>
              <p className="mt-1 text-xs text-[#5B6F8A]">Enter keywords or a question to find matching document text.</p>
            </div>
          )}

          {(isLoading || isFetching) && (
            <div role="status" className="flex flex-col gap-2" aria-label="Searching document text">
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
                <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
                  <p className="text-sm font-bold text-[#0C2B49]">No results found</p>
                  <p className="mt-1 text-xs text-[#5B6F8A]">Try different keywords.</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {data.results.map((result) => (
                  <Link
                    key={result.chunk_id}
                    href={`/portal/documents/${result.document_id}`}
                    className="block rounded-[18px] border border-[#E8F0F8] bg-white p-4 transition hover:border-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <InsertDriveFileIcon sx={{ fontSize: 16, color: '#0067B3' }} aria-hidden="true" />
                      <h2 className="min-w-0 break-words text-sm font-black text-[#0C2B49]">{result.file_name}</h2>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#5B6F8A]">
                      Document created: <time dateTime={result.created_at}>{recordDateFormat.format(new Date(result.created_at))}</time>
                    </p>
                    {result.register_reference && (
                      <p className="mt-1 break-words text-xs font-semibold text-[#5B6F8A]">
                        Register reference: <span className="font-bold text-[#0C2B49]">{result.register_reference.label}</span>
                      </p>
                    )}
                    {result.text?.trim() && <p className="line-clamp-3 text-sm text-[#0C2B49]">{result.text}</p>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <form onSubmit={submitRegisterSearch} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:p-6">
            <fieldset disabled={registerLookup.isPending} className="flex flex-col gap-4">
              <legend className="text-base font-black text-[#0C2B49]">Notarial register reference</legend>
              <p className="text-sm text-[#5B6F8A]">Enter all four values from the register. Every field is required for an exact match.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {registerFields.map((field) => (
                  <label key={field.name} className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">
                    <span>{field.label} <span aria-hidden="true" className="text-[#B42318]">*</span></span>
                    <input
                      type="number"
                      name={field.name}
                      autoComplete="off"
                      required
                      min={field.min}
                      max={'max' in field ? field.max : undefined}
                      step="1"
                      inputMode="numeric"
                      value={registerReference[field.name]}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setRegisterReference((current) => ({ ...current, [field.name]: value }));
                      }}
                      className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] focus:ring-2 focus:ring-[#0067B3]/20 disabled:bg-[#F8FBFF]"
                    />
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={registerLookup.isPending}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#005F9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:cursor-wait disabled:opacity-60"
              >
                {registerLookup.isPending ? (
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white motion-reduce:animate-none" />
                ) : (
                  <SearchIcon fontSize="small" aria-hidden="true" />
                )}
                {registerLookup.isPending ? 'Searching…' : 'Search register'}
              </button>
            </fieldset>
          </form>

          {registerLookup.isPending && <p role="status" className="text-sm font-semibold text-[#5B6F8A]">Searching the register…</p>}
          {registerLookup.isError && <p role="alert" className="text-sm font-bold text-red-700">{registerLookup.error.message}</p>}

          {registerLookup.data && (
            <section aria-live="polite" className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[#5B6F8A]">
                {registerLookup.data.results.length} record{registerLookup.data.results.length !== 1 ? 's' : ''} found
              </p>
              {registerLookup.data.results.length === 0 ? (
                <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
                  <p className="text-sm font-bold text-[#0C2B49]">No record found for this reference</p>
                  <p className="mt-1 text-xs text-[#5B6F8A]">Check all four numbers and search again.</p>
                </div>
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
