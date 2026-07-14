'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getDocumentStatusLabel } from '../lib/document-ui';

interface Document {
  id: string;
  file_name: string;
  status: string;
  on_chain: boolean;
  created_at: string;
  document_number?: number;
  book_number?: number | null;
  page_number?: number | null;
}

async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch('/api/portal/proxy?path=%2Fdocuments%2F', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === 'anchored' || s === 'completed') return 'bg-[#EAF8F0] text-[#12A150]';
  if (s === 'processing' || s === 'pending') return 'bg-[#FFF4DD] text-[#B77900]';
  return 'bg-[#EAF4FF] text-[#1689F5]';
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState('newest');
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['portal-documents'],
    queryFn: fetchDocuments,
  });

  const filtered = documents
    .filter((document) => document.file_name.toLowerCase().includes(search.toLowerCase()))
    .filter((document) => status === 'all' || document.status.toLowerCase() === status)
    .filter((document) => !date || document.created_at.slice(0, 10) === date)
    .sort((left, right) => {
      if (sort === 'oldest') return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
      if (sort === 'title') return left.file_name.localeCompare(right.file_name);
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[28px] font-black text-[#0C2B49]">Documents</h1>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-full border border-[#E8F0F8] bg-[#F8FBFF] px-4 py-2.5">
        <SearchIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
        <input
          className="flex-1 bg-transparent text-sm text-[#0C2B49] placeholder:text-[#A0AAB8] outline-none"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold text-[#64748b]">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E8F0F8] bg-white px-3 py-2 text-sm text-[#0C2B49]">
            <option value="all">All statuses</option><option value="queued">Queued</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="failed">Failed</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#64748b]">Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E8F0F8] bg-white px-3 py-2 text-sm text-[#0C2B49]" />
        </label>
        <label className="text-xs font-bold text-[#64748b]">Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E8F0F8] bg-white px-3 py-2 text-sm text-[#0C2B49]">
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option>
          </select>
        </label>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-[18px] border border-[#E8F0F8] h-[80px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[18px] border border-[#E8F0F8] p-8 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">{search ? 'No documents match your search' : 'No documents yet'}</p>
          <p className="text-xs text-[#64748b] mt-1">Upload your first document to get started.</p>
          <Link href="/portal/upload" className="inline-flex items-center gap-2 mt-4 rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white">
            Upload Document
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/portal/documents/${doc.id}`}
              className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] px-5 py-4 flex items-center gap-4 transition hover:bg-[#F8FBFF]"
            >
              <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0 ${doc.on_chain ? 'bg-[#EEF6FF]' : 'bg-[#FFF4DD]'}`}>
                {doc.on_chain
                  ? <ShieldIcon sx={{ fontSize: 20, color: '#0985E7' }} />
                  : <DescriptionIcon sx={{ fontSize: 20, color: '#B77900' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#0C2B49] block truncate">{doc.file_name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`${statusStyle(doc.status)} rounded-full py-0.5 px-2.5 text-[11px] font-bold`}>{getDocumentStatusLabel(doc.status)}</span>
                  <span className="text-[11px] text-[#A0AAB8]">{formatDate(doc.created_at)}</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-[#64748b]">
                  {doc.document_number ? `Document #${doc.document_number}` : 'Document number unavailable'}
                  {doc.book_number ? ` · Book ${doc.book_number}` : ''}{doc.page_number ? ` · Page ${doc.page_number}` : ''}
                  {doc.on_chain ? ' · On-chain' : ' · Off-chain'}
                </p>
              </div>
              <ChevronRightIcon sx={{ fontSize: 20, color: '#A0AAB8' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
