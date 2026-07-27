'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  getRequiredUploadMetadataError,
  getUploadFileError,
  getUploadOutcome,
  type UploadOutcome,
  uploadDocument,
} from '../lib/portal-upload';
import { canAccessPortalFeature } from '../lib/portal-access';
import { getPortalUiRole } from '../lib/portal-role';
import { defaultOfficeSettings } from '../lib/office-settings-schema';
import type { ApiSchema } from '@lexchain/types';

type Book = ApiSchema<'BookResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/books/?limit=50&offset=0')}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Unable to load books');
  return res.json();
}

const stepClass = 'rounded-xl border px-3 py-2 text-xs font-black';

function formatFileSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [drag, setDrag] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/users/')}`, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Unable to load profile');
      return response.json();
    },
  });
  const isIssuer = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), 'upload');
  const booksQuery = useQuery({ queryKey: ['portal-books'], queryFn: fetchBooks, enabled: isIssuer });
  const availableBooks = (booksQuery.data ?? []).filter((book) => !book.is_full);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Choose a PDF first.');
      const metadataError = getRequiredUploadMetadataError({ title, bookId });
      if (metadataError) throw new Error(metadataError);
      return uploadDocument({ file, title: title.trim(), bookId });
    },
    onSuccess: (data) => setOutcome(getUploadOutcome(data)),
  });

  function pick(candidate: File | null) {
    if (!candidate) return;
    const fileError = getUploadFileError(candidate);
    if (fileError) {
      setValidationError(fileError);
      return;
    }
    setFile(candidate);
    setValidationError(null);
    setTitle((current) => current || candidate.name.replace(/\.pdf$/i, ''));
  }

  function submit() {
    setValidationError(null);
    mutation.reset();
    if (!file) {
      setValidationError('Choose a PDF first.');
      return;
    }
    const metadataError = getRequiredUploadMetadataError({ title, bookId });
    if (metadataError) {
      setValidationError(metadataError);
      return;
    }
    mutation.mutate();
  }

  const error = validationError ?? (mutation.error instanceof Error ? mutation.error.message : null);
  const activeStep = !file ? 1 : !title.trim() || !bookId ? 2 : 3;
  const getStepClass = (step: number) => `${stepClass} ${
    activeStep === step
      ? 'border-[#0985E7] bg-[#EEF6FF] text-[#0C6BBF]'
      : 'border-[#D7E4F2] bg-white text-[#64748b]'
  }`;

  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Loading your upload access…</p>;
  if (!isIssuer) {
    return <section className="max-w-xl rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">Upload unavailable</h1><p className="mt-2 text-sm text-[#64748b]">Only Document Issuers can upload documents.</p></section>;
  }

  if (outcome) {
    return (
      <section className="max-w-xl rounded-[18px] border border-[#D7EDE0] bg-white p-6">
        <div className="flex items-start gap-3">
          <CheckCircleIcon sx={{ fontSize: 32, color: '#12A150' }} />
          <div>
            <p className="text-lg font-black text-[#0C2B49]">Upload accepted</p>
            <p className="mt-1 text-sm text-[#64748b]">{outcome.message || 'No additional processing detail was returned.'}</p>
            <p className="mt-1 text-sm text-[#64748b]">You can leave this page. Processing continues in the background.</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 rounded-xl bg-[#F8FBFF] p-4 text-sm">
          <div><dt className="font-bold text-[#64748b]">Document ID</dt><dd className="mt-1 break-all font-black text-[#0C2B49]">{outcome.documentId}</dd></div>
          <div><dt className="font-bold text-[#64748b]">Current status</dt><dd className="mt-1 font-black text-[#0C2B49]">{outcome.status}</dd></div>
        </dl>
        <button type="button" onClick={() => router.push(`/portal/upload/processing?id=${outcome.documentId}`)} className="mt-5 rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">
          View processing status
        </button>
      </section>
    );
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Upload Document</h1>
        <p className="mt-1 text-sm text-[#64748b]">A guided upload using the fields LexChain currently accepts.</p>
      </div>

      <ol aria-label="Upload steps" className="grid grid-cols-3 gap-2">
        <li aria-current={activeStep === 1 ? 'step' : undefined} className={getStepClass(1)}>1. Select PDF</li>
        <li aria-current={activeStep === 2 ? 'step' : undefined} className={getStepClass(2)}>2. Document information</li>
        <li aria-current={activeStep === 3 ? 'step' : undefined} className={getStepClass(3)}>3. Confirm and process</li>
      </ol>

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="select-pdf-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <h2 id="select-pdf-heading" className="font-black text-[#0C2B49]">Select PDF</h2>
          <p className="mt-1 text-sm text-[#64748b]">PDF only · maximum {defaultOfficeSettings.uploadLimitMegabytes} MB</p>
          <div
            onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => { event.preventDefault(); setDrag(false); pick(event.dataTransfer.files[0] ?? null); }}
            className={`mt-4 rounded-[18px] border-2 border-dashed p-6 text-center transition sm:p-8 ${drag ? 'border-[#0985E7] bg-[#EEF6FF]' : 'border-[#E8F0F8] bg-[#F8FBFF] hover:border-[#0985E7]'}`}
          >
            <UploadFileIcon sx={{ fontSize: 44, color: '#0985E7' }} />
            <p className="mt-2 text-sm font-bold text-[#0C2B49]">Drop your PDF here</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-3 rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7] focus:outline-none focus:ring-2 focus:ring-[#0985E7] focus:ring-offset-2">Choose a PDF</button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => pick(event.target.files?.[0] ?? null)} />
          </div>
          {file && <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[#E8F0F8] p-4"><InsertDriveFileIcon sx={{ color: '#0985E7' }} /><span className="flex-1 truncate text-sm font-bold text-[#0C2B49]">{file.name} · {formatFileSize(file.size)}</span><button aria-label="Remove uploaded file" onClick={() => { setFile(null); setValidationError(null); }} type="button"><CloseIcon sx={{ fontSize: 18, color: '#64748b' }} /></button></div>}
        </section>

        <section aria-labelledby="document-information-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <h2 id="document-information-heading" className="font-black text-[#0C2B49]">Document information</h2>
          <p className="mt-1 text-sm text-[#64748b]">Provide the title and active book required by the upload service.</p>
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Document title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Deed of Sale" className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Register book<select value={bookId} onChange={(event) => setBookId(event.target.value)} disabled={booksQuery.isLoading || availableBooks.length === 0} className="rounded-xl border border-[#D7E4F2] bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7] disabled:bg-[#F8FBFF]"><option value="">{booksQuery.isLoading ? 'Loading register books...' : availableBooks.length === 0 ? 'No active register books available' : 'Choose a register book'}</option>{availableBooks.map((book) => <option key={book.id} value={book.id}>Register book {book.book_number} — Series {book.series_year}</option>)}</select></label>
            {booksQuery.isError && <p role="alert" className="text-sm font-bold text-red-600">Unable to load books. Please try again.</p>}
            {!booksQuery.isLoading && availableBooks.length === 0 && <p className="text-sm text-[#64748b]">Register an active book before uploading a document.</p>}
          </div>
        </section>

      </div>

      <section aria-labelledby="confirm-process-heading" className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
        <h2 id="confirm-process-heading" className="font-black text-[#0C2B49]">Confirm and process</h2>
        <p className="mt-1 text-sm text-[#64748b]">Review the selected PDF, title, and book, then send them for processing.</p>
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={!file || !title.trim() || !bookId || mutation.isPending} onClick={submit} className="mt-4 rounded-full bg-[#0985E7] px-8 py-3 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-40">{mutation.isPending ? 'Sending upload...' : 'Confirm and process'}</button>
      </section>
    </div>
  );
}
