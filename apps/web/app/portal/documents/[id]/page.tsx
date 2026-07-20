'use client';

import { use } from 'react';
import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ApiSchema } from '@lexchain/types';
import PortalChatbot from '../../components/portal-chatbot';
import { DocumentWorkspace } from './document-workspace';
import { getDocumentActions, getDocumentStatusLabel } from '../../lib/document-ui';
import { verifyRepositoryDocument } from '../../lib/integrity-api';
import { getIntegrityUiState } from '../../lib/integrity-ui';
import { getPortalUiRole } from '../../lib/portal-role';

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

function statusStyle(status: string) {
  const value = status.toLowerCase();
  if (value === 'anchored' || value === 'completed' || value === 'processed') return 'bg-[#EAF8F0] text-[#12A150]';
  if (value === 'processing' || value === 'pending' || value === 'accepted') return 'bg-[#FFF4DD] text-[#B77900]';
  return 'bg-[#EAF4FF] text-[#1689F5]';
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [docQ, chainQ, profileQ] = useQueries({
    queries: [
      { queryKey: ['portal-doc', id], queryFn: () => getJson<DocumentResponse>(`/documents/${id}`) },
      { queryKey: ['portal-doc-chain', id], queryFn: () => verifyRepositoryDocument(id), retry: false },
      { queryKey: ['portal-profile'], queryFn: () => getJson<UserProfile | null>('/users/') },
    ],
  });

  if (docQ.isLoading) return <div className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;
  if (docQ.isError || !docQ.data) return <p className="text-sm text-[#64748b]">Document not found.</p>;

  const document = docQ.data;
  const actions = getDocumentActions(getPortalUiRole(profileQ.data?.role), document);
  const integrityState = getIntegrityUiState({ record: chainQ.data, requestFailed: chainQ.isError });

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <header className="flex flex-col gap-3">
        <Link href="/portal/documents" className="flex w-fit items-center gap-1.5 text-sm font-bold text-[#0985E7]">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to documents
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.5px] text-[#0985E7]">Document review</span>
            <h1 className="mt-1 text-2xl font-extrabold leading-[30px] text-[#0C2B49]">{document.file_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#64748b]">
              <span>Reference #{document.document_number}</span>
              <span className={`${statusStyle(document.status)} rounded-full px-2.5 py-0.5 text-[11px] font-bold`}>{getDocumentStatusLabel(document.status)}</span>
              {integrityState === 'recorded' && <span className="rounded-full bg-[#EAF8F0] px-2.5 py-0.5 text-[11px] font-bold text-[#12A150]">Integrity record available</span>}
              {integrityState === 'unavailable' && <span className="rounded-full bg-[#FFF4DD] px-2.5 py-0.5 text-[11px] font-bold text-[#B77900]">Integrity status unavailable</span>}
              {integrityState === 'mismatch' && <span className="rounded-full bg-[#FFF4DD] px-2.5 py-0.5 text-[11px] font-bold text-[#B77900]">Integrity mismatch</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {document.storage_url && <a href={document.storage_url} download className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Download</a>}
            {actions.includes('Verify Integrity') && <Link href={`/portal/documents/${id}/verify`} className="rounded-full border border-[#E8F0F8] bg-white px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Verify Integrity</Link>}
          </div>
        </div>
      </header>

      <DocumentWorkspace document={document} role={getPortalUiRole(profileQ.data?.role)} chain={chainQ.data} integrityState={integrityState} onRetry={() => void chainQ.refetch()} />
      <PortalChatbot />
    </div>
  );
}
