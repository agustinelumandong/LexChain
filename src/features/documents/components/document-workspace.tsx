'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ApiSchema } from '@/shared/types/index';
import { listSignedCopies } from '@/features/documents/document-lifecycle-api';
import { getDocumentLifecycleLabel, getDocumentStatusLabel } from '@/features/documents/document-ui';
import { shortenIntegrityHash } from "@/features/verification";

type WorkspaceDocument = ApiSchema<'DocumentResponse'>;

const tabs = ['Overview', 'Files', 'Blockchain', 'Signed copies', 'Access', 'Activity'] as const;
type Tab = typeof tabs[number];

function readable(value: unknown): string {
  if (value == null) return 'Not supplied';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const [key, entryValue] = entries[0];
      return `${key} — ${readable(entryValue)}`;
    }
    if (entries.length === 2 && 'type' in value && 'value' in value) {
      return `${readable(value.value)} (${String(value.type).replace(/_/g, ' ').toLowerCase()})`;
    }
    if ('clause' in value && 'severity' in value) {
      return `${value.clause} — ${value.severity}`;
    }
  }
  return JSON.stringify(value);
}

function anchorLabel(lifecycleStatus: string, onChain: boolean) {
  if (onChain) return 'Recorded on-chain';
  if (lifecycleStatus.toUpperCase() === 'FINALIZED') return 'Awaiting on-chain confirmation';
  return 'Not finalized';
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not available';
}

function InsightGroup({ title, items }: { title: string; items?: unknown[] | null }) {
  if (!items?.length) return null;

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => <li key={index} className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-sm text-[#0C2B49]">{readable(item)}</li>)}
      </ul>
    </section>
  );
}

type DocumentWorkspaceProps = {
  document: WorkspaceDocument;
  finalizationResult?: ApiSchema<'RecordResponse'>;
  confirmingFinalize?: boolean;
  isFinalizing?: boolean;
  finalizeError?: string | null;
  onCancelFinalize?: () => void;
  onConfirmFinalize?: () => void;
  success?: string;
};

const finalizationConfirmation = 'This will anchor the approved document hash on-chain and finalize the document. This action cannot be undone.';

export function DocumentWorkspace({
  document,
  finalizationResult,
  confirmingFinalize = false,
  isFinalizing = false,
  finalizeError = null,
  onCancelFinalize,
  onConfirmFinalize,
  success,
}: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const signedCopiesQuery = useQuery({ queryKey: ['portal-doc-signed-copies', document.document_id], queryFn: () => listSignedCopies(document.document_id), enabled: activeTab === 'Signed copies' });
  const hasInsights = Boolean(document.summary || document.labels?.length || document.entities?.length || document.risk_flags?.length);
  const lifecycle = document;

  return (
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <div role="tablist" aria-label="Document workspace" className="flex overflow-x-auto border-b border-[#E8F0F8] px-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-extrabold ${activeTab === tab ? 'border-[#0985E7] text-[#0985E7]' : 'border-transparent text-[#64748b]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Overview</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-[#64748b]">Filename</dt><dd className="mt-1 text-[#0C2B49]">{document.file_name ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Signed copy content type</dt><dd className="mt-1 text-[#0C2B49]">{document.signed_copy?.content_type ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Processing status</dt><dd className="mt-1 text-[#0C2B49]">{getDocumentStatusLabel(document.status)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Document lifecycle</dt><dd className="mt-1 text-[#0C2B49]">{getDocumentLifecycleLabel(lifecycle.lifecycle)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Document hash</dt><dd title={document.document_hash ?? undefined} className="mt-1 break-all font-mono text-[#0C2B49]">{document.document_hash ? shortenIntegrityHash(document.document_hash) : 'Not available'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Finalized</dt><dd className="mt-1 text-[#0C2B49]">{formatDate(lifecycle.finalized_at)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Anchor state</dt><dd className="mt-1 text-[#0C2B49]">{anchorLabel(lifecycle.lifecycle, document.on_chain)}</dd></div>
            </dl>
            {hasInsights && <div className="space-y-5 border-t border-[#E8F0F8] pt-5">
              <p className="text-sm leading-6 text-[#64748b]">AI-generated assistance only. Review it carefully; the original document remains authoritative.</p>
              {document.summary && <section><h3 className="text-xs font-black uppercase tracking-[0.08em] text-[#64748b]">Summary</h3><p className="mt-2 text-sm leading-6 text-[#0C2B49]">{document.summary}</p></section>}
              <InsightGroup title="Labels" items={document.labels} />
              <InsightGroup title="Entities" items={document.entities} />
              <InsightGroup title="Risk flags" items={document.risk_flags} />
            </div>}
            {success && <p role="status" className="rounded-xl border border-[#BCE8CC] bg-[#F1FBF5] px-4 py-3 text-sm font-bold text-[#0C7A3B]">{success}</p>}
            {finalizationResult && <dl className="grid gap-3 rounded-xl bg-[#F8FBFF] p-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-[#64748b]">Data hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.data_hash}</dd></div><div><dt className="font-bold text-[#64748b]">Transaction hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.tx_hash}</dd></div></dl>}
            <p className="text-sm leading-6 text-[#64748b]">Use this workspace to review the original file, derived assistance, and available integrity information.</p>
            {confirmingFinalize && (
              <div role="dialog" aria-modal="true" aria-label="Confirm finalization" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C2B49]/40 p-4">
                <div className="w-full max-w-md rounded-2xl border border-[#CFE7FC] bg-white p-6 shadow-[0_16px_40px_rgba(12,43,73,0.25)]">
                  <p className="text-lg font-black text-[#0C2B49]">Finalize this document?</p>
                  <p className="mt-2 text-sm leading-6 text-[#64748b]">{finalizationConfirmation}</p>
                  {finalizeError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{finalizeError}</p>}
                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={onCancelFinalize} disabled={isFinalizing} className="rounded-full border border-[#D6E3F1] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Cancel</button>
                    <button type="button" onClick={onConfirmFinalize} disabled={isFinalizing} className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isFinalizing ? 'Finalizing…' : 'Confirm finalization'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Files' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Document files</h2>
            {document.signed_copy ? (
              <div className="space-y-3 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4">
                <div><p className="font-bold text-[#0C2B49]">Current signed PDF</p><p className="mt-1 text-sm text-[#64748b]">{document.signed_copy.original_filename ?? document.file_name}</p></div>
                <div className="flex flex-wrap gap-3">
                  <a href={document.signed_copy.storage_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Open current signed PDF</a>
                  <a href={document.signed_copy.storage_url} download className="rounded-full border border-[#E8F0F8] px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Download current signed PDF</a>
                </div>
              </div>
            ) : <p className="text-sm text-[#64748b]">No signed PDF is attached to this document yet.</p>}
            {document.draft_url && <div className="rounded-xl border border-[#E8F0F8] p-4"><p className="font-bold text-[#0C2B49]">Working Google draft</p><p className="mt-1 text-sm text-[#64748b]">This editable draft is separate from the legal signed PDF.</p><a href={document.draft_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full border border-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-[#0985E7]">Open Google draft</a></div>}
          </div>
        )}



        {activeTab === 'Blockchain' && (
          document.on_chain ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-[#64748b]">Anchor status</dt><dd className="mt-1 text-[#0C2B49]">{anchorLabel(document.lifecycle, document.on_chain)}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Document hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{document.document_hash ?? 'Not supplied'}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Finalized</dt><dd className="mt-1 text-[#0C2B49]">{formatDate(document.finalized_at)}</dd></div>
            </dl>
          ) : <div className="space-y-4"><p className="text-sm text-[#64748b]">{document.lifecycle === 'FINALIZED' ? 'Finalized, but no on-chain record is reported.' : 'This document has not been finalized or recorded on-chain.'}</p></div>
        )}

        {activeTab === 'Signed copies' && (
          <div className="space-y-4">
            <div><h2 className="text-lg font-extrabold text-[#0C2B49]">Signed-copy history</h2><p className="mt-1 text-sm text-[#64748b]">Each uploaded legal PDF is listed separately from the document lifecycle.</p></div>
            {signedCopiesQuery.isLoading && <p className="text-sm text-[#64748b]">Loading signed copies…</p>}
            {signedCopiesQuery.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load signed-copy history.</p>}
            {signedCopiesQuery.data?.copies.length === 0 && <p className="text-sm text-[#64748b]">No signed copies have been uploaded.</p>}
            {signedCopiesQuery.data?.copies.map((copy) => <article key={copy.id} className="space-y-3 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-[#0C2B49]">{copy.original_filename ?? 'Signed PDF'}</p>{copy.is_current && <span className="rounded-full bg-[#EAF8F0] px-2.5 py-1 text-xs font-bold text-[#067647]">Current copy</span>}</div><p className="text-sm text-[#64748b]">Uploaded {formatDate(copy.created_at)} · {copy.content_type} · {copy.size_bytes.toLocaleString()} bytes</p><p className="break-all font-mono text-xs text-[#64748b]">{copy.sha256}</p>{copy.replaced_reason && <p className="text-sm text-[#64748b]">Replaced: {copy.replaced_reason}</p>}<div className="flex gap-3"><a href={copy.storage_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#0985E7]">Open signed copy</a><a href={copy.storage_url} download className="text-sm font-bold text-[#0C2B49]">Download signed copy</a></div></article>)}
          </div>
        )}

        {activeTab === 'Access' && (
          <div className="space-y-3"><h2 className="text-lg font-extrabold text-[#0C2B49]">Access</h2><p className="text-sm text-[#64748b]">Manage access on the existing document participant surface.</p>          {document.permissions.can_share || document.permissions.can_revoke ? <Link href={`/portal/documents/${document.document_id}/participants`} className="inline-flex rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Manage document participants</Link> : null}</div>
        )}

        {activeTab === 'Activity' && (
          <div className="space-y-3"><h2 className="text-lg font-extrabold text-[#0C2B49]">Activity</h2><p className="text-sm text-[#64748b]">Review lifecycle and access events on the existing audit surface.</p>{document.permissions.can_view && <Link href={`/portal/documents/${document.document_id}/activity`} className="inline-flex rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">View document activity</Link>}</div>
        )}
      </div>
    </section>
  );
}
