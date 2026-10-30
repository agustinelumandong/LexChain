'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { searchDocumentsByRegisterReference, type RegisterLookupQuery } from '@/features/documents/search-api';

type RegisterReferenceForm = Record<keyof RegisterLookupQuery, string>;

const registerFields = [
  { name: 'doc_no', label: 'Doc. No.', min: 1 },
  { name: 'page_no', label: 'Page No.', min: 1 },
  { name: 'book_number', label: 'Book No.', min: 1, max: 1000 },
  { name: 'series_year', label: 'Series year', min: 2000 },
] as const;
const recordDateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

function emptyReference(): RegisterReferenceForm {
  return { doc_no: '', page_no: '', book_number: '', series_year: '' };
}

function formatReference(reference: RegisterLookupQuery) {
  return `Doc. No. ${reference.doc_no} · Page No. ${reference.page_no} · Book No. ${reference.book_number} · Series of ${reference.series_year}`;
}

export function RegisterReferenceSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const helpId = useId();
  const [reference, setReference] = useState<RegisterReferenceForm>(emptyReference);
  const lookup = useMutation({ mutationFn: searchDocumentsByRegisterReference });
  const resetLookup = lookup.reset;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      resetLookup();
      setReference(emptyReference());
      dialog.showModal();
      if (window.matchMedia('(min-width: 640px)').matches) {
        dialog.querySelector<HTMLInputElement>('input')?.focus();
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, resetLookup]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query: RegisterLookupQuery = {
      doc_no: Number(reference.doc_no),
      page_no: Number(reference.page_no),
      book_number: Number(reference.book_number),
      series_year: Number(reference.series_year),
    };
    resetLookup();
    lookup.mutate(query);
  }

  const errorMessage = lookup.error instanceof Error
    ? lookup.error.message
    : 'Register lookup failed. Please try again.';
  const results = lookup.data?.results;

  return (
    <dialog
      ref={dialogRef}
      id="register-reference-search-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-card)] p-0 text-[var(--text-primary)] shadow-2xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-h-[85dvh] sm:max-w-xl sm:rounded-[var(--radius-card)]"
    >
      <div className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-h-[85dvh]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-soft)] bg-[var(--surface-card)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-[var(--text-primary)]">Find a document by register reference</h2>
            <p id={descriptionId} className="mt-1 text-sm text-[var(--text-muted)]">
              Enter the four details from the same notarial register entry.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close register search"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2"
          >
            <CloseIcon aria-hidden="true" fontSize="small" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {lookup.isPending && (
            <p role="status" aria-live="polite" className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
              <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-blue)]/30 border-t-[var(--brand-blue)] motion-reduce:animate-none" />
              Searching the register…
            </p>
          )}

          {lookup.isError && <p role="alert" className="mb-4 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error)]">{errorMessage}</p>}

          {!lookup.isSuccess && (
            <form id={formId} onSubmit={submitSearch}>
              <fieldset disabled={lookup.isPending} className="flex flex-col gap-4">
                <legend className="sr-only">Enter the register reference</legend>
                <p id={helpId} className="text-sm text-[var(--text-muted)]">
                  All four values are required and must match the entry exactly.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {registerFields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={`register-search-${field.name}`} className="block text-sm font-semibold text-[var(--text-primary)]">
                        {field.label} <span aria-hidden="true" className="text-[var(--status-error)]">*</span>
                      </label>
                      <Input
                        id={`register-search-${field.name}`}
                        type="number"
                        name={field.name}
                        autoComplete="off"
                        required
                        min={field.min}
                        max={'max' in field ? field.max : undefined}
                        step="1"
                        inputMode="numeric"
                        aria-describedby={helpId}
                        value={reference[field.name]}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setReference((current) => ({ ...current, [field.name]: value }));
                        }}
                        className="mt-1 [font-variant-numeric:tabular-nums]"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </form>
          )}

          {lookup.isSuccess && results?.length === 0 && (
            <div role="status" aria-live="polite" className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-page)] p-5 text-center">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">No document found</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Check the four numbers against the register, then try again.
              </p>
              {lookup.variables && <p className="mt-3 break-words text-xs text-[var(--text-muted)]">Searched: {formatReference(lookup.variables)}</p>}
            </div>
          )}

          {lookup.isSuccess && results?.length === 1 && (
            <section aria-live="polite" aria-labelledby="register-search-confirmation" className="flex flex-col gap-4">
              <h3 id="register-search-confirmation" className="text-base font-semibold text-[var(--text-primary)]">
                Is this the document you’re looking for?
              </h3>
              <Card padded={false} className="p-4">
                <div className="flex items-start gap-3">
                  <InsertDriveFileIcon aria-hidden="true" sx={{ color: 'var(--brand-blue)', fontSize: 20, mt: 0.25 }} />
                  <div className="min-w-0">
                    <p className="break-words text-base font-semibold text-[var(--text-primary)]">{results[0].file_name}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Document created: <time dateTime={results[0].created_at}>{recordDateFormat.format(new Date(results[0].created_at))}</time>
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                      Register reference: <span className="font-semibold text-[var(--text-primary)]">{results[0].register_reference.label}</span>
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {lookup.isSuccess && results && results.length > 1 && (
            <section aria-live="polite" aria-labelledby="register-search-multiple" className="flex flex-col gap-3">
              <div>
                <h3 id="register-search-multiple" className="text-base font-semibold text-[var(--text-primary)]">Choose the matching document</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{results.length} documents have this register reference.</p>
              </div>
              <ul aria-label="Matching documents" className="flex flex-col gap-2">
                {results.map((result) => (
                  <li key={result.document_id}>
                    <Link
                      href={`/portal/documents/${result.document_id}`}
                      onClick={onClose}
                      className="block rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--border-focus)] hover:bg-[var(--surface-page)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block break-words text-sm font-semibold text-[var(--text-primary)]">{result.file_name}</span>
                          <span className="mt-1 block text-sm text-[var(--text-muted)]">
                            Document created: <time dateTime={result.created_at}>{recordDateFormat.format(new Date(result.created_at))}</time>
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-[var(--brand-blue)]">Open document</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--border-soft)] bg-[var(--surface-card)] p-4 sm:flex-row sm:justify-end sm:px-6">
          {lookup.isSuccess && results?.length === 1 ? (
            <>
              <Button type="button" variant="secondary" onClick={resetLookup}>No, search again</Button>
              <Link
                href={`/portal/documents/${results[0].document_id}`}
                onClick={onClose}
                className="inline-flex min-h-[var(--control-height-md)] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--brand-blue)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2"
              >
                Yes, open document
              </Link>
            </>
          ) : lookup.isSuccess && results?.length === 0 ? (
            <Button type="button" onClick={resetLookup}>Edit reference</Button>
          ) : lookup.isSuccess && results && results.length > 1 ? (
            <Button type="button" variant="secondary" onClick={resetLookup}>Search again</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" form={formId} disabled={lookup.isPending} aria-busy={lookup.isPending}>
                {lookup.isPending ? (
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white motion-reduce:animate-none" />
                ) : (
                  <SearchIcon aria-hidden="true" fontSize="small" />
                )}
                {lookup.isPending ? 'Searching…' : 'Search register'}
              </Button>
            </>
          )}
        </footer>
      </div>
    </dialog>
  );
}
