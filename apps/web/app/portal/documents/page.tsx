'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import { getDocumentStatusLabel } from '../lib/document-ui';
import { getPortalUiRole } from '../lib/portal-role';
import {
  getDocumentListActions,
  getDocumentStatuses,
  getVisibleDocuments,
  type DocumentListItem,
} from '../lib/document-library';
import type { ApiSchema } from '@lexchain/types';

type Document = DocumentListItem & {
  id: string;
  file_name: string;
};

type UserProfile = ApiSchema<'UserProfileResponse'>;

async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch('/api/portal/proxy?path=%2Fdocuments%2F', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function formatDate(iso?: string | null) {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusStyle(status?: string | null) {
  const value = status?.toLowerCase();
  if (value === 'anchored' || value === 'completed') return 'bg-[#EAF8F0] text-[#12A150]';
  if (value === 'processing' || value === 'pending') return 'bg-[#FFF4DD] text-[#B77900]';
  return 'bg-[#EAF4FF] text-[#1689F5]';
}

function DocumentBadges({ document }: { document: Document }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {document.status && <span className={`${statusStyle(document.status)} rounded-full px-2.5 py-0.5 text-[11px] font-bold`}>{getDocumentStatusLabel(document.status)}</span>}
      {typeof document.on_chain === 'boolean' && (
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${document.on_chain ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#F1F5F9] text-[#64748b]'}`}>
          {document.on_chain ? 'On-chain' : 'Off-chain'}
        </span>
      )}
    </div>
  );
}

function DocumentActions({ document }: { document: Document }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {getDocumentListActions(document).map((action) => {
        const href = action === 'Open'
          ? `/portal/documents/${document.id}`
          : action === 'View / Download'
            ? `/portal/documents/${document.id}/viewer`
            : `/portal/documents/${document.id}/verify`;
        return <Link key={action} href={href} className="text-xs font-black text-[#0985E7] hover:underline">{action}</Link>;
      })}
    </div>
  );
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const documentsQuery = useQuery<Document[]>({ queryKey: ['portal-documents'], queryFn: fetchDocuments });
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const response = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });
  const documents = documentsQuery.data ?? [];
  const statuses = getDocumentStatuses(documents);
  const hasDates = documents.some((document) => document.updated_at || document.created_at);
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === 'issuer';
  const visibleDocuments = getVisibleDocuments(documents, {
    query: search,
    status,
    sort: hasDates ? sort : 'title',
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-[#0C2B49]">Documents</h1>
          <p className="mt-1 text-sm text-[#64748b]">Manage and review documents in the office repository</p>
        </div>
        {isIssuer && <Link href="/portal/upload" className="rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white">Upload Document</Link>}
      </div>

      <div className="flex flex-col gap-3 rounded-[18px] border border-[#E8F0F8] bg-white p-4">
        <label className="flex items-center gap-2 rounded-full border border-[#E8F0F8] bg-[#F8FBFF] px-4 py-2.5">
          <SearchIcon sx={{ fontSize: 18, color: '#A0AAB8' }} />
          <span className="sr-only">Search documents by title or reference</span>
          <input className="flex-1 bg-transparent text-sm text-[#0C2B49] placeholder:text-[#A0AAB8] outline-none" placeholder="Search by title or reference..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {statuses.length > 0 && <label className="text-xs font-bold text-[#64748b]">Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E8F0F8] bg-white px-3 py-2 text-sm text-[#0C2B49]">
              <option value="all">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{getDocumentStatusLabel(value)}</option>)}
            </select>
          </label>}
          <label className="text-xs font-bold text-[#64748b]">Sort
            <select value={hasDates ? sort : 'title'} onChange={(event) => setSort(event.target.value as typeof sort)} className="mt-1 w-full rounded-xl border border-[#E8F0F8] bg-white px-3 py-2 text-sm text-[#0C2B49]">
              {hasDates && <><option value="newest">Recently updated</option><option value="oldest">Least recently updated</option></>}
              <option value="title">Title A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {documentsQuery.isLoading ? (
        <div className="flex flex-col gap-3" aria-label="Loading documents">{[1, 2, 3].map((index) => <div key={index} className="h-[80px] animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />)}</div>
      ) : documentsQuery.isError ? (
        <div role="alert" className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center"><p className="text-sm font-bold text-[#0C2B49]">Unable to load documents.</p><p className="mt-1 text-xs text-[#64748b]">Check your connection and try again.</p><button type="button" onClick={() => void documentsQuery.refetch()} className="mt-4 rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-black text-[#0985E7]">Retry</button></div>
      ) : visibleDocuments.length === 0 ? (
        <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#0C2B49]">{search || status !== 'all' ? 'No documents match your search or filter' : 'No documents yet'}</p>
          <p className="mt-1 text-xs text-[#64748b]">{isIssuer ? 'Upload your first document to get started.' : 'No documents are available yet.'}</p>
          {isIssuer && <Link href="/portal/upload" className="mt-4 inline-flex rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white">Upload Document</Link>}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-[18px] border border-[#E8F0F8] bg-white md:block">
            <table className="min-w-full text-left"><thead className="border-b border-[#E8F0F8] bg-[#F8FBFF] text-xs font-black text-[#64748b]"><tr><th className="px-5 py-3">Document</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Blockchain</th><th className="px-5 py-3">Updated</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{visibleDocuments.map((document) => <tr key={document.id} className="border-b border-[#E8F0F8] last:border-0"><td className="px-5 py-4"><p className="font-bold text-[#0C2B49]">{document.file_name}</p><p className="mt-1 text-xs text-[#64748b]">{document.document_number ? `Reference #${document.document_number}` : 'Reference unavailable'}</p></td><td className="px-5 py-4"><DocumentBadges document={document} /></td><td className="px-5 py-4 text-xs font-bold text-[#64748b]">{typeof document.on_chain === 'boolean' ? (document.on_chain ? 'Recorded on-chain' : 'Not recorded on-chain') : 'Not supplied'}</td><td className="px-5 py-4 text-xs text-[#64748b]">{formatDate(document.updated_at ?? document.created_at)}</td><td className="px-5 py-4"><DocumentActions document={document} /></td></tr>)}</tbody></table>
          </div>
          <div className="flex flex-col gap-3 md:hidden">{visibleDocuments.map((document) => <article key={document.id} className="rounded-[18px] border border-[#E8F0F8] bg-white p-4"><div className="flex gap-3"><DescriptionIcon sx={{ fontSize: 22, color: '#0985E7' }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#0C2B49]">{document.file_name}</p><p className="mt-1 text-xs text-[#64748b]">{document.document_number ? `Reference #${document.document_number}` : 'Reference unavailable'} · Updated {formatDate(document.updated_at ?? document.created_at)}</p><div className="mt-2"><DocumentBadges document={document} /></div></div></div><div className="mt-4 border-t border-[#E8F0F8] pt-3"><DocumentActions document={document} /></div></article>)}</div>
        </>
      )}
    </div>
  );
}
