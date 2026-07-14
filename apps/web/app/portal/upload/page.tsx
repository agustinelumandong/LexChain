'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { uploadDocument } from '../lib/portal-upload';
import type { ApiSchema } from '@lexchain/types';

type Book = ApiSchema<'BookResponse'>;

async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`/api/portal/proxy?path=${encodeURIComponent('/books/?limit=50&offset=0')}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Unable to load books');
  return res.json();
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [drag, setDrag] = useState(false);
  const booksQuery = useQuery({ queryKey: ['portal-books'], queryFn: fetchBooks });
  const books = booksQuery.data ?? [];
  const availableBooks = books.filter((book) => !book.is_full);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Choose a PDF first');
      if (!title.trim()) throw new Error('Enter a document title');
      if (!bookId) throw new Error('Choose a book');
      return uploadDocument({ file, title: title.trim(), bookId });
    },
    onSuccess: (data) => router.push(`/portal/upload/processing?id=${data.document_id}`),
  });

  function pick(candidate: File | null) {
    if (!candidate) return;
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      setFile(null);
      return;
    }
    setFile(candidate);
    setTitle((current) => current || candidate.name.replace(/\.pdf$/i, ''));
  }

  const error = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Upload Document</h1>
        <p className="mt-1 text-sm text-[#64748b]">PDF files only. Max 50 MB.</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">
        Document title
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Deed of Sale" className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">
        Book
        <select value={bookId} onChange={(event) => setBookId(event.target.value)} disabled={booksQuery.isLoading || availableBooks.length === 0} className="rounded-xl border border-[#D7E4F2] bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7] disabled:bg-[#F8FBFF]">
          <option value="">{booksQuery.isLoading ? 'Loading books...' : availableBooks.length === 0 ? 'No active books available' : 'Choose a book'}</option>
          {availableBooks.map((book) => <option key={book.id} value={book.id}>Book {book.book_number} — Series {book.series_year}</option>)}
        </select>
        {booksQuery.isError && <span className="text-xs font-medium text-red-600">Unable to load books. Please try again.</span>}
        {!booksQuery.isLoading && availableBooks.length === 0 && <span className="text-xs font-medium text-[#64748b]">Register an active book before uploading a document.</span>}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-[18px] border-2 border-dashed p-10 text-center transition ${
          drag ? 'border-[#0985E7] bg-[#EEF6FF]' : 'border-[#E8F0F8] bg-white hover:border-[#0985E7]'
        }`}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: '#0985E7' }} />
        <p className="mt-3 text-sm font-bold text-[#0C2B49]">Drop your PDF here or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-[14px] border border-[#E8F0F8] bg-white p-4">
          <InsertDriveFileIcon sx={{ color: '#0985E7' }} />
          <span className="flex-1 truncate text-sm font-bold text-[#0C2B49]">{file.name}</span>
          <span className="text-xs text-[#64748b]">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <button onClick={() => setFile(null)} type="button">
            <CloseIcon sx={{ fontSize: 18, color: '#64748b' }} />
          </button>
        </div>
      )}

      {error && <p className="text-sm font-bold text-red-500">{error}</p>}

      <button
        disabled={!file || !title.trim() || !bookId || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="rounded-full bg-[#0985E7] px-8 py-3 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-40"
      >
        {mutation.isPending ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
