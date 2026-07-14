'use client';

import { use } from 'react';
import { useMutation, useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import type { ApiSchema } from '@lexchain/types';
import PortalChatbot from '../../components/portal-chatbot';
import { getDocumentActions, getDocumentStatusLabel } from '../../lib/document-ui';
import { getPortalUiRole } from '../../lib/portal-role';

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type DocumentPartyListResponse = ApiSchema<'DocumentPartyListResponse'>;
type VersionHistoryResponse = ApiSchema<'VersionHistoryResponse'>;
type AuditLogResponse = ApiSchema<'AuditLogResponse'>;
type OnChainVerificationResponse = ApiSchema<'OnChainVerificationResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

const cardClass = 'bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] p-5';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === 'anchored' || s === 'completed' || s === 'processed') return 'bg-[#EAF8F0] text-[#12A150]';
  if (s === 'processing' || s === 'pending' || s === 'accepted') return 'bg-[#FFF4DD] text-[#B77900]';
  return 'bg-[#EAF4FF] text-[#1689F5]';
}

function renderUnknown(value: unknown) {
  if (value == null) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function InsightList({ items, empty }: { items?: unknown[] | null; empty: string }) {
  if (!items?.length) return <p className="text-xs font-medium text-[#64748b]">{empty}</p>;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0985E7]" />
          <span className="text-[13px] font-medium leading-5 text-[#0C2B49]">{renderUnknown(item)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [docQ, partiesQ, versionsQ, auditQ, chainQ] = useQueries({
    queries: [
      { queryKey: ['portal-doc', id], queryFn: () => getJson<DocumentResponse>(`/documents/${id}`) },
      { queryKey: ['portal-doc-parties', id], queryFn: () => getJson<DocumentPartyListResponse>(`/documents/${id}/parties`) },
      { queryKey: ['portal-doc-versions', id], queryFn: () => getJson<VersionHistoryResponse>(`/documents/${id}/versions`) },
      { queryKey: ['portal-doc-audit', id], queryFn: () => getJson<AuditLogResponse[]>(`/documents/${id}/audit-logs`) },
      {
        queryKey: ['portal-doc-chain', id],
        queryFn: () => getJson<OnChainVerificationResponse>(`/blockchain/verify/${id}`),
        retry: false,
      },
    ],
  });

  const [profileQ] = useQueries({
    queries: [{ queryKey: ['portal-profile'], queryFn: () => getJson<UserProfile | null>('/users/') }],
  });
  const anchorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/blockchain/record/${id}`)}`, { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Unable to anchor document');
      return response.json();
    },
    onSuccess: () => void docQ.refetch(),
  });

  const doc = docQ.data;
  const parties = partiesQ.data?.parties ?? [];
  const issuer = partiesQ.data?.issuer;
  const versions = versionsQ.data?.versions ?? [];
  const auditLogs = auditQ.data ?? [];
  const chain = chainQ.data;
  const actions = getDocumentActions(getPortalUiRole(profileQ.data?.role), doc ?? {});

  if (docQ.isLoading) return <div className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;
  if (docQ.isError || !doc) return <p className="text-sm text-[#64748b]">Document not found.</p>;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <Link href="/portal/documents" className="flex w-fit items-center gap-1.5 text-sm font-bold text-[#0985E7]">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
        </Link>
        <span className="text-xs font-bold uppercase tracking-[0.5px] text-[#0985E7]">Document Details</span>
        <h1 className="text-2xl font-extrabold leading-[30px] text-[#0C2B49]">{doc.file_name}</h1>
        <p className="text-[13px] font-medium leading-[19px] text-[#64748b]">
          #{doc.document_number} - Uploaded {formatDate(doc.created_at)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.includes('View PDF') && <Link href={`/portal/documents/${id}/viewer`} className="flex items-center justify-center gap-2 rounded-full bg-[#0985E7] px-5 py-3 text-sm font-extrabold text-white">View PDF</Link>}
        {actions.includes('Anchor to Blockchain') && <button type="button" disabled={anchorMutation.isPending} onClick={() => anchorMutation.mutate()} className="rounded-full border border-[#E8F0F8] bg-white px-5 py-3 text-sm font-extrabold text-[#0C2B49] disabled:opacity-40">{anchorMutation.isPending ? 'Anchoring...' : 'Anchor to Blockchain'}</button>}
        {actions.includes('Verify Document') && <Link href={`/portal/documents/${id}/verify`} className="flex items-center justify-center gap-2 rounded-full border border-[#E8F0F8] bg-white px-5 py-3 text-sm font-extrabold text-[#0C2B49]">Verify Document</Link>}
        <Link href={`/portal/documents/${id}/ask`} className="flex items-center justify-center gap-2 rounded-full border border-[#E8F0F8] bg-white px-5 py-3 text-sm font-extrabold text-[#0C2B49]">
          <QuestionAnswerIcon sx={{ fontSize: 16 }} /> Ask AI
        </Link>
        <Link href={`/portal/search?q=${encodeURIComponent(doc.file_name)}`} className="flex items-center justify-center gap-2 rounded-full border border-[#E8F0F8] bg-white px-5 py-3 text-sm font-extrabold text-[#0C2B49]">
          <SearchIcon sx={{ fontSize: 16 }} /> Search
        </Link>
      </div>

      <div className={cardClass}>
        <div className="mb-3 flex items-center gap-3.5">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#EAF4FF]">
            <DescriptionIcon sx={{ fontSize: 22, color: '#0985E7' }} />
          </div>
          <span className="text-lg font-extrabold leading-[22px] text-[#0C2B49]">Document summary</span>
        </div>
        <div className="flex flex-col gap-[13px]">
          <div className="flex justify-between gap-4">
            <span className="text-xs font-bold text-[#64748b]">Content type</span>
            <span className="truncate text-xs font-extrabold text-[#0C2B49]">{doc.content_type}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs font-bold text-[#64748b]">Status</span>
            <span className={`${statusStyle(doc.status)} rounded-full px-2.5 py-0.5 text-[11px] font-bold`}>{getDocumentStatusLabel(doc.status)}</span>
          </div>
          <div className="h-px bg-[#E8F0F8]" />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#64748b]">Short summary</span>
            <p className="text-[13px] font-medium leading-[18px] text-[#0C2B49]">{doc.summary || 'No summary available yet.'}</p>
          </div>
        </div>
      </div>

      <div className={`${cardClass} flex items-center justify-between gap-4`}>
        <div>
          <h2 className="text-[15px] font-extrabold text-[#0C2B49]">Document status</h2>
          <p className="mt-1 text-[13px] font-medium text-[#64748b]">Current processing state for this document.</p>
        </div>
        <span className={`${statusStyle(doc.status)} shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold`}>{getDocumentStatusLabel(doc.status)}</span>
      </div>

      <div className={`${cardClass} flex items-start gap-4`}>
        <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${doc.on_chain ? 'bg-[#EAF8F0]' : 'bg-[#FFF4DD]'}`}>
          <VerifiedUserIcon sx={{ fontSize: 24, color: doc.on_chain ? '#12A150' : '#B77900' }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[15px] font-extrabold text-[#0C2B49]">Blockchain status</span>
          <p className="text-[13px] font-medium text-[#64748b]">
            {chain ? `Hash ${chain.data_hash}` : doc.on_chain ? 'On-chain record exists but could not be loaded.' : 'This document is not yet recorded on-chain.'}
          </p>
          {chain && <span className="text-xs font-bold text-[#64748b]">Recorded {formatDate(new Date(chain.onchain_timestamp * 1000).toISOString())}</span>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${doc.on_chain ? 'bg-[#EAF8F0] text-[#12A150]' : 'bg-[#FFF4DD] text-[#B77900]'}`}>
          {doc.on_chain ? 'Anchored' : 'Not anchored'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#0C2B49]">
            <PeopleIcon sx={{ fontSize: 16, color: '#0985E7' }} /> Access control ({parties.length + (issuer ? 1 : 0)})
          </h2>
          <div className="flex flex-col gap-3">
            {issuer && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0C2B49]">{issuer.f_name} {issuer.l_name}</p>
                  <p className="truncate text-xs text-[#64748b]">{issuer.email}</p>
                </div>
                <span className="rounded-full bg-[#EAF8F0] px-2 py-0.5 text-[11px] font-black text-[#12A150]">Issuer</span>
              </div>
            )}
            {parties.map((party) => (
              <div key={party.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0C2B49]">{party.f_name} {party.l_name}</p>
                  <p className="truncate text-xs text-[#64748b]">{party.email}</p>
                </div>
                <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[11px] font-black text-[#0985E7]">{party.role}</span>
              </div>
            ))}
            {!issuer && parties.length === 0 && <p className="text-xs text-[#64748b]">No parties added.</p>}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#0C2B49]">
            <HistoryIcon sx={{ fontSize: 16, color: '#0985E7' }} /> Version History ({versionsQ.data?.total_version ?? versions.length})
          </h2>
          {versions.length === 0 ? <p className="text-xs text-[#64748b]">No versions yet.</p> : (
            <div className="flex flex-col gap-3">
              {versions.map((version) => (
                <div key={version.document_id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#0C2B49]">{version.file_name}</p>
                    <p className="text-[#A0AAB8]">#{version.document_number} - {formatDate(version.created_at)}</p>
                  </div>
                  <span className={`${statusStyle(version.status)} shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold`}>
                    {version.is_latest ? 'Current' : version.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#0C2B49]">
            <ListAltIcon sx={{ fontSize: 16, color: '#0985E7' }} /> Audit trail
          </h2>
          {auditLogs.length === 0 ? <p className="text-xs text-[#64748b]">No audit events.</p> : (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {auditLogs.map((log) => <div key={log.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#F8FBFF] px-3 py-2 text-xs"><div className="min-w-0"><p className="font-bold capitalize text-[#0C2B49]">{log.action.replace(/_/g, ' ')}</p>{log.details && <p className="truncate text-[#64748b]">{renderUnknown(log.details)}</p>}</div><span className="shrink-0 text-[#A0AAB8]">{formatDate(log.created_at)}</span></div>)}
            </div>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#0C2B49]">
            <WarningAmberIcon sx={{ fontSize: 16, color: '#B77900' }} /> Risk review
          </h2>
          <InsightList items={doc.risk_flags} empty="No risk flags detected." />
        </div>

        <div className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-[#0C2B49]">
            <ShieldIcon sx={{ fontSize: 16, color: '#0985E7' }} /> Extracted information
          </h2>
          <InsightList items={doc.entities?.length ? doc.entities : doc.labels} empty="No extracted information available." />
        </div>
        <div className={cardClass}><h2 className="mb-3 text-sm font-black text-[#0C2B49]">Confidence</h2><p className="text-[13px] font-medium text-[#64748b]">{doc.summary ? 'Summary generated from document processing.' : 'Confidence is unavailable until processing completes.'}</p></div>
      </div>

      {actions.includes('Verify Document') && (
        <Link href={`/portal/documents/${id}/verify`} className="flex w-full items-center justify-center rounded-full bg-[#0985E7] py-3 text-sm font-extrabold text-white">
          Verify on Chain
        </Link>
      )}

      <PortalChatbot />
    </div>
  );
}
