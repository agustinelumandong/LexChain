'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { uploadDocument } from '../lib/portal-upload';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Choose a PDF first');
      return uploadDocument(file);
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
  }

  const error = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Upload Document</h1>
        <p className="mt-1 text-sm text-[#64748b]">PDF files only. Max 50 MB.</p>
      </div>

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
        disabled={!file || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="rounded-full bg-[#0985E7] px-8 py-3 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-40"
      >
        {mutation.isPending ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
