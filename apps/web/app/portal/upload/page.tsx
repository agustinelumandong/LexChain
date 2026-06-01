'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      router.push('/portal/upload/processing');
    }, 1000);
  };

  return (
    <div className="bg-white rounded-[18px] border border-[var(--portal-border-soft)] shadow-[0_4px_12px_rgba(19,59,115,0.05)] p-6">
      <p className="text-xs font-bold text-[var(--portal-primary)] uppercase">UPLOAD DOCUMENT</p>
      <h1 className="text-2xl font-extrabold text-[#0f1d3d] mt-1">Upload document</h1>
      <p className="text-sm text-muted-foreground mt-1">Choose a PDF to upload.</p>

      <div className="mt-6">
        <label className="text-sm font-medium">Document Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-[var(--portal-border-soft)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--portal-primary)]"
        />
      </div>

      <div
        className="mt-4 rounded-[18px] border-2 border-dashed border-[var(--portal-border-soft)] p-8 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUploadIcon className="text-muted-foreground" style={{ fontSize: 48 }} />
        <p className="font-bold text-[#0f1d3d] mt-2">Drag and drop a PDF here</p>
        <p className="text-xs text-muted-foreground">or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {file && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <InsertDriveFileIcon fontSize="small" />
          <span>{file.name}</span>
          <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
          <button onClick={() => setFile(null)} className="ml-auto">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || !title || uploading}
        className="w-full py-3 rounded-xl bg-[var(--portal-primary)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 mt-6"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
