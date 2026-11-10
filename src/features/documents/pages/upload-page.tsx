'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import {
  getRequiredUploadMetadataError,
  getUploadFileError,
  MAX_SIGNED_PDF_BYTES,
  UploadRequestError,
  uploadDocument,
} from '@/features/documents/portal-upload';
import { attachSignedCopy } from '@/features/documents/document-lifecycle-api';
import { canAccessPortalFeature, getPortalUiRole } from "@/features/access";
import { PortalAccessError } from "@/features/access/components/portal-access-error";
import { PortalDropdown } from "@/features/portal/components";
import { DocumentProcessingStatus } from '@/features/documents/components/document-processing-status';
import { DocumentProgress } from '@/features/documents/components/document-progress';
import { UploadPolicyNotice } from '@/features/documents/components/upload-policy-notice';
import { Modal } from '@/features/admin/components/modal';
import { Checkbox } from '@/shared/components/ui';
import { UploadSkeleton } from '@/features/documents/components/document-loading-skeletons';
import type { ApiSchema } from '@/shared/types/index';
import { listRegisterBooks } from '@/features/office/books-api';
import { latestRegisterBook } from '@/features/office/latest-register-book';
import { portalRequest } from '@/shared/api/client';
type UserProfile = ApiSchema<'UserProfileResponse'>;
type UploadedDocument = ApiSchema<'DocumentResponse'>;

function uploadFieldForError(field?: string) {
  const name = field?.split(/[.[\]]/).filter(Boolean).at(-1)?.toLowerCase();
  if (name === 'file_name' || name === 'title') return 'title';
  if (name === 'book_id') return 'book';
  if (name === 'doc_no') return 'doc_no';
  if (name === 'page_no') return 'page_no';
  return undefined;
}

function formatFileSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1)} MiB`;
}

export default function UploadPage({ embedded = false, onFiledDocument, onPendingChange }: { embedded?: boolean; onFiledDocument?: (documentId: string) => void; onPendingChange?: (pending: boolean) => void } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [chosenBookId, setBookId] = useState('');
  const [enterPaperNumbers, setEnterPaperNumbers] = useState(false);
  const [docNo, setDocNo] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [drag, setDrag] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const isOnPage = useRef(true);
  useEffect(() => {
    isOnPage.current = true;
    return () => { isOnPage.current = false; };
  }, []);
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const response = await portalRequest(`/api/portal/proxy?path=${encodeURIComponent('/users/')}`);
      return response.json();
    },
  });
  const isIssuer = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), 'upload');
  const booksQuery = useQuery({ queryKey: ['portal-books'], queryFn: listRegisterBooks, enabled: isIssuer });
  const availableBooks = booksQuery.data ?? [];
  const bookId = chosenBookId || latestRegisterBook(availableBooks)?.id || '';
  const selectedBook = availableBooks.find((book) => book.id === bookId);
  const isClosedBook = selectedBook?.status === 'CLOSED';
  const manualNumbers = Boolean(isClosedBook || enterPaperNumbers);
  const uploadMetadata = { title, bookId: selectedBook?.id ?? '', bookStatus: selectedBook?.status, manualNumbers, docNo, pageNo };
  const bookFiling = manualNumbers ? { docNo: Number(docNo), pageNo: Number(pageNo) } : undefined;

  async function onFiled(data: UploadedDocument) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      queryClient.invalidateQueries({ queryKey: ['portal-books'] }),
      queryClient.invalidateQueries({ queryKey: ['portal-doc', data.document_id] }),
    ]);
    const documentPath = `/portal/documents/${data.document_id}`;
    if (!isOnPage.current) {
      toast.success('Signed document filed.', { action: { label: 'Open', onClick: () => router.push(documentPath) } });
      return;
    }
    toast.success('Signed document filed.');
    if (embedded && onFiledDocument) onFiledDocument(data.document_id);
    else router.push(documentPath);
  }

  function reportFailureAfterLeaving(failedUpload: Error) {
    if (isOnPage.current) return;
    toast.error('The upload did not finish.', {
      description: failedUpload.message,
      duration: Infinity,
      action: { label: 'Upload again', onClick: () => router.push('/portal/upload') },
    });
  }

  const mutation = useMutation({
    onMutate: () => onPendingChange?.(true),
    onSettled: () => onPendingChange?.(false),
    mutationFn: (confirmNewRecord: boolean) => {
      if (!file) throw new Error('Choose a PDF first.');
      const metadataError = getRequiredUploadMetadataError(uploadMetadata);
      if (metadataError) throw new Error(metadataError);
      return uploadDocument({
        file,
        title: title.trim(),
        bookId,
        ...(bookFiling ? { paperRegister: bookFiling } : {}),
        confirmNewRecord,
      });
    },
    onSuccess: onFiled,
    onError: reportFailureAfterLeaving,
  });
  const attachMutation = useMutation({
    onMutate: () => onPendingChange?.(true),
    onSettled: () => onPendingChange?.(false),
    mutationFn: (documentId: string) => {
      if (!file) throw new Error('Choose a PDF first.');
      const filingError = getRequiredUploadMetadataError(uploadMetadata);
      if (filingError) throw new Error(filingError);
      return attachSignedCopy(documentId, file, {
        bookId,
        docNo: bookFiling?.docNo ?? null,
        pageNo: bookFiling?.pageNo ?? null,
      });
    },
    onSuccess: onFiled,
    onError: reportFailureAfterLeaving,
  });
  const uploadError = mutation.error instanceof UploadRequestError ? mutation.error : null;
  const requiresConfirmation = uploadError?.requiresConfirmation === true;
  const isSubmissionPending = mutation.isPending || attachMutation.isPending;
  const failure = attachMutation.isError ? attachMutation.error : mutation.isError && !requiresConfirmation ? mutation.error : null;
  const activeUploadError = failure instanceof UploadRequestError ? failure : null;
  const uploadFieldErrors = (field: string) => activeUploadError?.validationErrors.filter((item) => uploadFieldForError(item.field) === field) ?? [];
  const uploadSummaryErrors = activeUploadError?.validationErrors.filter((item) => {
    const field = uploadFieldForError(item.field);
    return !field || (!manualNumbers && (field === 'doc_no' || field === 'page_no'));
  }) ?? [];

  function pick(candidate: File | null) {
    if (!candidate || isSubmissionPending || requiresConfirmation) return;
    const fileError = getUploadFileError(candidate);
    if (fileError) {
      setValidationError(fileError);
      return;
    }
    setFile(candidate);
    setValidationError(null);
    setTitle((current) => current || candidate.name.replace(/\.pdf$/i, '').replaceAll('_', ' '));
  }

  function submit() {
    if (isSubmissionPending) return;
    setDuplicateDismissed(false);
    const retryAsNewRecord = mutation.isError && mutation.variables === true;
    setValidationError(null);
    mutation.reset();
    if (!file) {
      setValidationError('Choose a PDF first.');
      return;
    }
    const metadataError = getRequiredUploadMetadataError(uploadMetadata);
    if (metadataError) {
      setValidationError(metadataError);
      return;
    }
    mutation.mutate(retryAsNewRecord);
  }

  const error = validationError ?? (failure instanceof Error
    ? `${failure.message} Your selected PDF and information have been kept. Review the error and retry when ready.`
    : null);
  if (profileQuery.isPending) return <UploadSkeleton label="Loading your upload access…" embedded={embedded} />;
  if (profileQuery.isError && !profileQuery.data) return <PortalAccessError error={profileQuery.error} isRetrying={profileQuery.isFetching} onRetry={() => void profileQuery.refetch()} />;
  if (!isIssuer) {
    return <section className="max-w-xl rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">Upload unavailable</h1><p className="mt-2 text-sm text-[#5B6F8A]">Only lawyers can upload documents.</p></section>;
  }

  if (isSubmissionPending) {
    const isAttachingSignedCopy = attachMutation.isPending;
    const attachingDocumentId = attachMutation.isPending ? attachMutation.variables : undefined;
    return (
      <div className="flex min-h-[calc(100dvh-8rem)] items-center">
        <DocumentProcessingStatus
          heading={isAttachingSignedCopy ? 'Attaching your signed PDF…' : 'Uploading your document…'}
          currentStatus={isAttachingSignedCopy ? 'Attaching signed PDF' : 'Uploading PDF'}
          description={attachingDocumentId
            ? 'The document will open automatically when the upload finishes. If you leave this screen, keep this tab open until you see a confirmation.'
            : 'Please keep this page open. The document will open automatically when the upload finishes.'}
        >
          {attachingDocumentId && <Link href={`/portal/documents/${encodeURIComponent(attachingDocumentId)}`} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Back to document</Link>}
        </DocumentProcessingStatus>
      </div>
    );
  }

  const missingForFiling = [!file && 'a PDF', !title.trim() && 'a document title', !bookId && 'a register book'].filter(Boolean);

  return (
    <div className="flex w-full max-w-none flex-1 flex-col gap-5">
      {!embedded && <div>
        <Link href="/portal/documents" className="text-sm font-bold text-[#0067B3]">← Back to documents</Link>
        <h1 className="mt-3 text-[28px] font-black text-[#0C2B49]">Upload Document</h1>
        <p className="mt-1 text-sm text-[#5B6F8A]">A guided upload using the fields LexChain currently accepts.</p>
      </div>}

      {!embedded && <><nav aria-label="Document starting point" className="flex w-full rounded-full bg-[#F2F4F7] p-1">
        <Link href="/portal/documents/new" className="flex min-h-11 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-sm font-bold text-[#4B6382] hover:text-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] sm:px-5">Prepare with Google Docs</Link>
        <Link href="/portal/upload" aria-current="page" className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-3 py-2 text-center text-sm font-bold text-[#0067B3] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] sm:px-5">Upload a signed PDF</Link>
      </nav>
      <DocumentProgress path="pdf" currentStep={1} /></>}

      <div className="flex flex-1 flex-col gap-5">
        <section aria-labelledby="document-information-heading" className="flex flex-col rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <h2 id="document-information-heading" className="font-black text-[#0C2B49]">Document information</h2>
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Document title<input id="upload-title" aria-invalid={uploadFieldErrors('title').length > 0} aria-describedby={uploadFieldErrors('title').length ? 'upload-title-error' : undefined} disabled={requiresConfirmation || isSubmissionPending} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Deed of Sale" className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" />{uploadFieldErrors('title').length > 0 && <div id="upload-title-error">{uploadFieldErrors('title').map((item, index) => <p key={`${index}-${item.message}`} className="text-sm font-medium text-red-700">{item.message}</p>)}</div>}</label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Register book
              <PortalDropdown
                ariaLabel="Register book"
                ariaDescribedBy={uploadFieldErrors('book').length ? 'upload-book-error' : undefined}
                placeholder="Choose a register book"
                emptyLabel={booksQuery.isLoading ? 'Loading register books...' : 'No register books available'}
                options={availableBooks.map((book) => ({ label: `Register book ${book.book_number} — Series ${book.series_year} · ${book.status === 'CLOSED' ? 'Closed' : 'Open'}`, value: book.id }))}
                value={bookId}
                onChange={(value) => { setBookId(value); setDocNo(''); setPageNo(''); setEnterPaperNumbers(false); setValidationError(null); }}
                disabled={booksQuery.isLoading || availableBooks.length === 0 || requiresConfirmation || isSubmissionPending}
              />
              {uploadFieldErrors('book').length > 0 && <div id="upload-book-error">{uploadFieldErrors('book').map((item, index) => <p key={`${index}-${item.message}`} className="text-sm font-medium text-red-700">{item.message}</p>)}</div>}
            </label>
            {booksQuery.isError && <p role="alert" className="text-sm font-bold text-red-700">Unable to load books. Please try again.</p>}
            {!booksQuery.isLoading && availableBooks.length === 0 && <p className="text-sm text-[#5B6F8A]"><Link href="/portal/books" className="font-bold text-[#0067B3] underline">Register a book</Link> before uploading a document.</p>}
            {selectedBook?.status === 'OPEN' && <label className="mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0C2B49]"><Checkbox checked={enterPaperNumbers} disabled={isSubmissionPending || requiresConfirmation} onChange={(event) => { setEnterPaperNumbers(event.target.checked); setValidationError(null); }} />Enter paper register numbers</label>}
            {isClosedBook && <p className="mt-4 text-sm text-[#5B6F8A]">Closed books remain available for filing. Enter the numbers shown in the paper register.</p>}
            {manualNumbers && <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Paper document number
                  <input id="upload-doc-no" aria-invalid={uploadFieldErrors('doc_no').length > 0} aria-describedby={uploadFieldErrors('doc_no').length ? 'upload-doc-no-error' : undefined} required min="1" step="1" inputMode="numeric" type="number" disabled={requiresConfirmation || isSubmissionPending} value={docNo} onChange={(event) => setDocNo(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" />
                  {uploadFieldErrors('doc_no').length > 0 && <div id="upload-doc-no-error">{uploadFieldErrors('doc_no').map((item, index) => <p key={`${index}-${item.message}`} className="text-sm font-medium text-red-700">{item.message}</p>)}</div>}
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Paper page number
                  <input id="upload-page-no" aria-invalid={uploadFieldErrors('page_no').length > 0} aria-describedby={uploadFieldErrors('page_no').length ? 'upload-page-no-error' : undefined} required min="1" step="1" inputMode="numeric" type="number" disabled={requiresConfirmation || isSubmissionPending} value={pageNo} onChange={(event) => setPageNo(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3] disabled:bg-[#F8FBFF]" />
                  {uploadFieldErrors('page_no').length > 0 && <div id="upload-page-no-error">{uploadFieldErrors('page_no').map((item, index) => <p key={`${index}-${item.message}`} className="text-sm font-medium text-red-700">{item.message}</p>)}</div>}
                </label>
              </div>
            </>}
          </div>
        </section>

        <section aria-labelledby="select-pdf-heading" className="flex flex-col rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <h2 id="select-pdf-heading" className="font-black text-[#0C2B49]">Upload File</h2>
          <p className="mt-1 text-sm text-[#5B6F8A]">PDF only · maximum {MAX_SIGNED_PDF_BYTES / (1024 * 1024)} MiB</p>
          <div
            onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => { event.preventDefault(); setDrag(false); pick(event.dataTransfer.files[0] ?? null); }}
            className={`mt-4 flex flex-1 flex-col items-center justify-center rounded-[18px] border-2 border-dashed p-6 text-center transition sm:p-8 ${drag ? 'border-[#0067B3] bg-[#EEF6FF]' : 'border-[#E8F0F8] bg-[#F8FBFF] hover:border-[#0067B3]'}`}
          >
            <UploadFileIcon sx={{ fontSize: 44, color: '#0067B3' }} />
            {file ? <div className="mt-2 flex max-w-full items-center gap-3"><InsertDriveFileIcon sx={{ color: '#0067B3' }} /><span className="min-w-0 truncate text-sm font-bold text-[#0C2B49]">{file.name} · {formatFileSize(file.size)}</span><button className="grid min-h-11 min-w-11 place-items-center" aria-label="Remove uploaded file" disabled={requiresConfirmation || isSubmissionPending} onClick={() => { setFile(null); setValidationError(null); if (inputRef.current) inputRef.current.value = ''; }} type="button"><CloseIcon sx={{ fontSize: 18, color: '#5B6F8A' }} /></button></div> : <p className="mt-2 text-sm font-bold text-[#0C2B49]">Drop your PDF here</p>}
            <button type="button" disabled={requiresConfirmation || isSubmissionPending} onClick={() => inputRef.current?.click()} className="mt-3 rounded-full border border-[#0067B3] px-4 py-2 text-sm font-bold text-[#0067B3] focus:outline-none focus:ring-2 focus:ring-[#0067B3] focus:ring-offset-2 disabled:opacity-40">{file ? 'Replace File' : 'Choose a File'}</button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" disabled={requiresConfirmation || isSubmissionPending} className="hidden" onChange={(event) => pick(event.target.files?.[0] ?? null)} />
          </div>
        </section>
      </div>

      <section aria-labelledby="confirm-process-heading" className="mt-auto rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div>
          <h2 id="confirm-process-heading" className="font-black text-[#0C2B49]">Confirm and file signed document</h2>
          <p className="mt-1 text-sm text-[#5B6F8A]">Review the selected signed PDF, title, and book before filing it.</p>
          <UploadPolicyNotice />
          {!requiresConfirmation && missingForFiling.length > 0 && <p id="upload-missing-requirements" className="mt-2 text-sm font-semibold text-[#4B6382]">Still needed: {missingForFiling.join(', ')}.</p>}
          {error && activeUploadError?.reason !== 'DUPLICATE_FILE' && <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700"><p>{error}</p>{uploadSummaryErrors.map((validationError, index) => <p key={`${index}-${validationError.field ?? 'upload'}-${validationError.message}`} className="mt-1">{validationError.message}</p>)}</div>}
        </div>
        {!requiresConfirmation && <button aria-describedby={missingForFiling.length > 0 ? 'upload-missing-requirements' : undefined} disabled={!file || !title.trim() || !bookId} onClick={submit} className="mt-4 shrink-0 rounded-full bg-[#0067B3] px-8 py-3 text-sm font-black text-white transition hover:bg-[#005F9E] disabled:opacity-40 sm:mt-0">Confirm and file</button>}
      </section>
      <Modal open={requiresConfirmation} onClose={() => { mutation.reset(); attachMutation.reset(); }} title="Documents awaiting a signed copy">
        {requiresConfirmation && uploadError && <div role="group" aria-label="Upload recovery" className="max-h-[60vh] overflow-y-auto text-sm text-[#0C2B49]"><p role="alert">{uploadError.message}</p>{uploadError.relatedDocuments.length > 0 ? <ul className="mt-3 space-y-3">{uploadError.relatedDocuments.map((waitingDocument) => <li key={waitingDocument.documentId} className="rounded-lg border border-[#F3D59B] bg-white p-3"><p className="font-bold">{waitingDocument.fileName}</p>{waitingDocument.parties.length > 0 && <ul className="mt-1 space-y-1">{waitingDocument.parties.map((party) => <li key={`${party.email ?? party.name}-${party.role ?? ''}`}>{party.name}{party.email ? ` · ${party.email}` : ''}{party.role ? ` · ${party.role}` : ''}</li>)}</ul>}<Link className="mt-2 inline-block font-bold text-[#0067B3] underline" href={`/portal/documents/${encodeURIComponent(waitingDocument.documentId)}`}>View document details</Link><button type="button" disabled={isSubmissionPending} onClick={() => attachMutation.mutate(waitingDocument.documentId)} className="mt-2 block rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Attach signed PDF to {waitingDocument.fileName}</button></li>)}</ul> : <p className="mt-2">No waiting documents were included in this response.</p>}{uploadError.validationErrors.map((validationError, index) => <p key={`${index}-${validationError.field ?? 'upload'}-${validationError.message}`} className="mt-2">{validationError.message}</p>)}{attachMutation.isError && <p role="alert" className="mt-3">{attachMutation.error instanceof Error ? attachMutation.error.message : 'Attachment failed.'} Your selected PDF and filing details have been kept. Review the error and retry.</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={isSubmissionPending} onClick={() => mutation.mutate(true)} className="rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white">No, this is a new document</button><button type="button" disabled={isSubmissionPending} onClick={() => { mutation.reset(); attachMutation.reset(); }} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49]">Return without submitting</button></div></div>}
      </Modal>
      <Modal open={!requiresConfirmation && activeUploadError?.reason === 'DUPLICATE_FILE' && !duplicateDismissed} onClose={() => setDuplicateDismissed(true)} title="Document already filed">
        <div role="alert" className="text-sm text-[#0C2B49]">
          <p>{error}</p>
          {uploadSummaryErrors.map((validationError, index) => <p key={`${index}-${validationError.field ?? 'upload'}-${validationError.message}`} className="mt-1">{validationError.message}</p>)}
          {activeUploadError?.documentId && <Link className="mt-4 inline-block font-bold text-[#0067B3] underline" href={`/portal/documents/${encodeURIComponent(activeUploadError.documentId)}`}>View existing document</Link>}
        </div>
      </Modal>
    </div>
  );
}
