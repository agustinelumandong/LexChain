'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import type { ApiSchema } from '@/shared/types/index';
import { attachSignedCopy, listDocumentHistory, listDraftComments, listSignedCopies, replaceSignedCopy, syncDraftComments } from '@/features/documents/document-lifecycle-api';
import { getDocumentLifecycleLabel, getDocumentStatusLabel } from '@/features/documents/document-ui';
import { shortenIntegrityHash } from "@/features/verification";
import { GoogleDraftPanel } from '@/features/documents/components/google-draft-panel';
import { listDocumentParties, type PortalUiRole } from '@/features/access';

type WorkspaceDocument = ApiSchema<'DocumentResponse'>;

const tabs = ['Overview', 'Files', 'Comments', 'Blockchain', 'Signed copies', 'Access', 'History'] as const;
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
  role?: PortalUiRole;
  finalizationResult?: ApiSchema<'RecordResponse'>;
  confirmingFinalize?: boolean;
  isFinalizing?: boolean;
  finalizeError?: string | null;
  onCancelFinalize?: () => void;
  onConfirmFinalize?: () => void;
  success?: string;
  readinessError?: string | null;
  readinessSuccess?: string;
  isChangingReadiness?: boolean;
  onMarkReady?: () => void;
  onReopen?: () => void;
};

const finalizationConfirmation = 'This will anchor the approved document hash on-chain and finalize the document. This action cannot be undone.';

export function DocumentWorkspace({
  document,
  role = 'user',
  finalizationResult,
  confirmingFinalize = false,
  isFinalizing = false,
  finalizeError = null,
  onCancelFinalize,
  onConfirmFinalize,
  success,
  readinessError,
  readinessSuccess,
  isChangingReadiness = false,
  onMarkReady,
  onReopen,
}: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [signedCopyMode, setSignedCopyMode] = useState<'attach' | 'replace' | null>(null);
  const [signedCopyFile, setSignedCopyFile] = useState<File | null>(null);
  const [replacementReason, setReplacementReason] = useState('');
  const [signedCopyError, setSignedCopyError] = useState<string | null>(null);
  const [signedCopySuccess, setSignedCopySuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const signedCopyMutation = useMutation({
    mutationFn: ({ mode, file, reason }: { mode: 'attach' | 'replace'; file: File; reason: string }) => mode === 'attach'
      ? attachSignedCopy(document.document_id, file, { bookId: document.book_id ?? '', docNo: document.doc_no, pageNo: document.page_no })
      : replaceSignedCopy(document.document_id, file, reason),
    onSuccess: async (updatedDocument, { mode }) => {
      queryClient.setQueryData(['portal-doc', document.document_id], updatedDocument);
      setSignedCopyMode(null);
      setSignedCopyFile(null);
      setReplacementReason('');
      setSignedCopyError(null);
      setSignedCopySuccess(mode === 'attach' ? 'Signed PDF attached.' : 'Signed PDF replaced.');
      await queryClient.invalidateQueries({ queryKey: ['portal-doc-signed-copies', document.document_id] });
    },
  });
  const signedCopiesQuery = useQuery({ queryKey: ['portal-doc-signed-copies', document.document_id], queryFn: () => listSignedCopies(document.document_id), enabled: activeTab === 'Signed copies' });
  const partiesQuery = useQuery({
    queryKey: ['portal-document-parties', document.document_id],
    queryFn: () => listDocumentParties(document.document_id),
    enabled: role === 'lawyer' && activeTab === 'Access',
    retry: false,
  });
  const historyQuery = useQuery({
    queryKey: ['portal-document-history', document.document_id],
    queryFn: () => listDocumentHistory(document.document_id),
    enabled: activeTab === 'History',
    retry: false,
  });
  const commentsKey = ['portal-document-comments', document.document_id];
  const commentsQuery = useQuery({ queryKey: commentsKey, queryFn: () => listDraftComments(document.document_id), enabled: activeTab === 'Comments' && Boolean(document.draft_url), retry: false });
  const syncComments = useMutation({ mutationFn: () => syncDraftComments(document.document_id), onSuccess: (comments) => queryClient.setQueryData(commentsKey, comments) });
  const visibleTabs = tabs.filter((tab) => tab !== 'Comments' || Boolean(document.draft_url));
  const hasInsights = Boolean(document.summary || document.labels?.length || document.entities?.length || document.risk_flags?.length);
  const lifecycle = document;
  const participants = partiesQuery.data?.parties ?? [];
  const historyChanges = historyQuery.data?.changes ?? [];

  return (
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
      <div role="tablist" aria-label="Document workspace" className="flex overflow-x-auto border-b border-[#E8F0F8] px-3">
        {visibleTabs.map((tab) => (
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
            {finalizationResult && <dl className="grid gap-3 rounded-xl bg-[#F8FBFF] p-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-[#64748b]">Document ID</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.document_id}</dd></div><div><dt className="font-bold text-[#64748b]">On-chain document ID</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.onchain_document_id}</dd></div><div><dt className="font-bold text-[#64748b]">Data hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.data_hash}</dd></div><div><dt className="font-bold text-[#64748b]">Transaction hash</dt><dd className="mt-1 break-all font-mono text-[#0C2B49]">{finalizationResult.tx_hash}</dd></div></dl>}
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

        {activeTab === 'Comments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#0C2B49]">Draft comments</h2><p className="mt-1 text-sm text-[#64748b]">Comments are synced from the linked Google draft.</p></div>{document.lifecycle === 'PREPARING' && document.permissions.can_mark_ready && <button type="button" onClick={() => syncComments.mutate()} disabled={syncComments.isPending} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7] disabled:opacity-60">{syncComments.isPending ? 'Syncing comments…' : 'Sync comments'}</button>}</div>
            {commentsQuery.isLoading && <p role="status" className="text-sm text-[#64748b]">Loading comments…</p>}
            {commentsQuery.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">Unable to load draft comments.</p>}
            {syncComments.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{syncComments.error instanceof Error ? syncComments.error.message : 'Unable to sync comments.'}</p>}
            {commentsQuery.data && <><p className="text-sm font-bold text-[#64748b]">{commentsQuery.data.unresolved} unresolved · Last synced {formatDate(commentsQuery.data.synced_at)}</p>{commentsQuery.data.comments.length === 0 ? <p className="text-sm text-[#64748b]">No comments found in the draft.</p> : commentsQuery.data.comments.map((comment) => <article key={comment.id} className="space-y-2 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4"><div className="flex justify-between gap-3"><p className="font-bold text-[#0C2B49]">{comment.author_name || 'Draft commenter'}</p><span className="text-xs text-[#64748b]">{comment.resolved ? 'Resolved' : 'Unresolved'}</span></div>{comment.quoted_text && <blockquote className="border-l-2 border-[#0985E7] pl-3 text-sm text-[#64748b]">{comment.quoted_text}</blockquote>}<p className="whitespace-pre-wrap text-sm text-[#0C2B49]">{comment.content}</p>{comment.replies?.map((reply, index) => <div key={`${comment.id}-reply-${index}`} className="ml-4 border-l border-[#D6E3F1] pl-3"><p className="text-xs font-bold text-[#64748b]">{reply.author_name || 'Reply'}</p><p className="whitespace-pre-wrap text-sm text-[#0C2B49]">{reply.content}</p></div>)}</article>)}</>}
            {readinessError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{readinessError}</p>}
            {readinessSuccess && <p role="status" className="text-sm font-bold text-[#067647]">{readinessSuccess}</p>}
            <div className="flex gap-2">{document.permissions.can_mark_ready && <button type="button" onClick={onMarkReady} disabled={isChangingReadiness} className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isChangingReadiness ? 'Updating…' : 'Mark ready for signature'}</button>}{document.permissions.can_reopen && <button type="button" onClick={onReopen} disabled={isChangingReadiness} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-bold text-[#0985E7] disabled:opacity-60">Reopen draft</button>}</div>
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
            {signedCopySuccess && <p role="status" className="text-sm font-bold text-[#067647]">{signedCopySuccess}</p>}
            <div className="flex flex-wrap gap-2">
              {document.permissions?.can_attach_signed_copy && <button type="button" onClick={() => { setSignedCopyMode('attach'); setSignedCopyError(null); setSignedCopySuccess(null); signedCopyMutation.reset(); }} className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Attach signed PDF</button>}
              {document.permissions?.can_replace_signed_copy && <button type="button" onClick={() => { setSignedCopyMode('replace'); setSignedCopyError(null); setSignedCopySuccess(null); signedCopyMutation.reset(); }} className="rounded-full border border-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-[#0985E7]">Replace signed PDF</button>}
            </div>
            {signedCopyMode && <form className="space-y-3 rounded-xl border border-[#D7E4F2] bg-white p-4" onSubmit={(event) => {
              event.preventDefault();
              if (!signedCopyFile || (signedCopyMode === 'replace' && !replacementReason.trim()) || (signedCopyMode === 'attach' && !document.book_id)) return;
              signedCopyMutation.mutate({ mode: signedCopyMode, file: signedCopyFile, reason: replacementReason });
            }}>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Signed PDF<input aria-label="Signed PDF" type="file" accept="application/pdf,.pdf" required disabled={signedCopyMutation.isPending} onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                if (file && (file.size === 0 || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')))) {
                  setSignedCopyFile(null);
                  setSignedCopyError('Choose a non-empty PDF file.');
                  return;
                }
                setSignedCopyFile(file);
                setSignedCopyError(null);
              }} /></label>
              {signedCopyMode === 'replace' && <label className="flex flex-col gap-1.5 text-sm font-bold text-[#0C2B49]">Replacement reason<textarea aria-label="Replacement reason" required value={replacementReason} disabled={signedCopyMutation.isPending} onChange={(event) => setReplacementReason(event.target.value)} className="rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7] disabled:bg-[#F8FBFF]" /></label>}
              {signedCopyMode === 'attach' && !document.book_id && <p role="alert" className="text-sm font-bold text-[#B42318]">Register book details are unavailable for this document.</p>}
              {signedCopyError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyError}</p>}
              {signedCopyMutation.isError && <p role="alert" className="text-sm font-bold text-[#B42318]">{signedCopyMutation.error instanceof Error ? signedCopyMutation.error.message : 'Upload failed.'} Your selected file and replacement reason have been kept. Review the error and retry.</p>}
              <div className="flex flex-wrap gap-2"><button type="submit" disabled={!signedCopyFile || (signedCopyMode === 'replace' && !replacementReason.trim()) || (signedCopyMode === 'attach' && !document.book_id) || signedCopyMutation.isPending} className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{signedCopyMutation.isPending ? 'Uploading…' : signedCopyMode === 'replace' ? 'Confirm replacement' : 'Confirm attachment'}</button><button type="button" disabled={signedCopyMutation.isPending} onClick={() => { setSignedCopyMode(null); setSignedCopyFile(null); setReplacementReason(''); setSignedCopyError(null); signedCopyMutation.reset(); }} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button></div>
            </form>}
            <GoogleDraftPanel document={document} />
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
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-[#0C2B49]">Access</h2>
            {role === 'lawyer' ? <>
              {partiesQuery.isLoading && <p role="status" className="text-sm text-[#64748b]">Loading document participants…</p>}
              {partiesQuery.isError && <p role="alert" className="text-sm font-semibold text-[#B42318]">Unable to load document participants.</p>}
              {!partiesQuery.isLoading && !partiesQuery.isError && participants.length === 0 && <p className="rounded-xl border border-dashed border-[#D6E3F1] bg-[#F8FBFF] px-4 py-3 text-sm text-[#5B6F8A]">No participants have access to this document yet.</p>}
              {participants.length > 0 && <ul aria-label="Document participants" className="divide-y divide-[#E8F0F8] rounded-xl border border-[#E8F0F8]">
                {participants.map((party) => <li key={party.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0"><p className="break-words text-sm font-bold text-[#0C2B49]">{[party.f_name, party.l_name].filter(Boolean).join(' ') || party.email}</p><p className="break-all text-xs text-[#64748b]">{party.email}</p></div>
                  <span className="shrink-0 text-xs font-bold capitalize text-[#4B6382]">{party.role} · {party.status}</span>
                </li>)}
              </ul>}
              {document.permissions.can_share || document.permissions.can_revoke ? <Link href={`/portal/documents/${document.document_id}/participants`} className="inline-flex rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Manage document participants</Link> : null}
            </> : <div className="rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-4 py-3"><p className="font-bold text-[#0C2B49]">Access details are unavailable for your role.</p><p className="mt-1 text-sm text-[#5B6F8A]">Only Lawyers can manage document participants.</p></div>}
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-3">
            <div><h2 className="text-lg font-extrabold text-[#0C2B49]">Document history</h2><p className="mt-1 text-sm text-[#64748b]">Lifecycle changes, oldest first.</p></div>
            {historyQuery.isLoading && <p role="status" className="text-sm text-[#64748b]">Loading document history…</p>}
            {historyQuery.isError && <p role="alert" className="text-sm font-semibold text-[#B42318]">Unable to load document history.</p>}
            {historyQuery.data && historyChanges.length === 0 && <p className="rounded-xl border border-dashed border-[#D6E3F1] bg-[#F8FBFF] px-4 py-3 text-sm text-[#5B6F8A]">No lifecycle changes have been recorded for this document yet.</p>}
            {historyChanges.length > 0 && <ol aria-label="Document history" className="space-y-3">
              {historyChanges.map((change, index) => <li key={`${change.created_at}-${change.action}-${index}`} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] px-4 py-3">
                <div><p className="text-sm font-bold text-[#0C2B49]">{getDocumentLifecycleLabel(change.action)}</p><p className="mt-1 text-sm text-[#4B6382]">{change.from_stage ? getDocumentLifecycleLabel(change.from_stage) : 'No previous stage'} → {getDocumentLifecycleLabel(change.to_stage)}</p><p className="mt-1 text-xs text-[#64748b]">{change.actor_id ? `Actor ${change.actor_id}` : 'Actor not supplied'}</p></div>
                <time dateTime={change.created_at} className="text-xs font-semibold text-[#64748b]">{formatDate(change.created_at)}</time>
              </li>)}
            </ol>}
          </div>
        )}

      </div>
    </section>
  );
}
