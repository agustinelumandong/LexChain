'use client';

import { use, useState, useSyncExternalStore } from 'react';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { z } from 'zod';
import type { ApiSchema } from '@/shared/types/index';
import { PortalChatbot as PortalChatbot } from "@/features/portal/components";
import { CopyableIdentifier, DocumentWorkspace } from '@/features/documents/components/document-workspace';
import { getDocumentActions, getDocumentLifecycleBadgeClasses, getDocumentLifecycleLabel, getDocumentProcessingBadgeClasses, getDocumentProcessingStatusLabel } from '@/features/documents/document-ui';
import { renameDocument, finalizeDocument, markDocumentReady, reopenDocument, cancelDocument } from '@/features/documents/document-lifecycle-api';
import { getPortalUiRole } from "@/features/access";
import { Modal } from '@/features/admin/components/modal';
import { portalRequest } from '@/shared/api/client';
import { PortalApiError } from '@/shared/api/portal-error';
import { isMockMode } from '@/lib/mocks/mode';
import { retryDocumentProcessing } from '@/features/documents/document-lifecycle-api';

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

const finalizationStatusDocumentSchema = z.object({
  document_id: z.string(),
  file_name: z.string(),
  lifecycle: z.string(),
  on_chain: z.boolean(),
  permissions: z.object({
    can_view: z.boolean(),
    can_rename: z.boolean(),
    can_create_draft: z.boolean(),
    can_mark_ready: z.boolean(),
    can_reopen: z.boolean(),
    can_attach_signed_copy: z.boolean(),
    can_replace_signed_copy: z.boolean(),
    can_correct_entry: z.boolean(),
    can_cancel: z.boolean(),
    can_finalize: z.boolean(),
    can_share: z.boolean(),
    can_revoke: z.boolean(),
  }),
  created_at: z.string(),
}).passthrough();

async function getJson<T>(path: string): Promise<T> {
  const response = await portalRequest(`/api/portal/proxy?path=${encodeURIComponent(path)}`);
  return response.json();
}

function readErrorStatus(error: unknown) {
  return error instanceof Error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined;
}

function subscribeToFinalizationStatus(onStoreChange: () => void) {
  window.addEventListener('portal-finalization-status', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('portal-finalization-status', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mockMode = isMockMode();
  const queryClient = useQueryClient();
  const [renamePending, setRenamePending] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [renameError, setRenameError] = useState<string>();
  const [confirmingFinalize, setConfirmingFinalize] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [finalizationResult, setFinalizationResult] = useState<ApiSchema<'RecordResponse'>>();
  const [statusMessage, setStatusMessage] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const unknownFinalizationKey = `portal-finalize-unknown:${id}`;
  const hasUnknownFinalization = useSyncExternalStore(
    subscribeToFinalizationStatus,
    () => sessionStorage.getItem(unknownFinalizationKey) === '1',
    () => false,
  );
  const [docQ, profileQ] = useQueries({
    queries: [
      { queryKey: ['portal-doc', id], queryFn: () => getJson<DocumentResponse>(`/documents/${id}`), refetchInterval: 10_000 },
      { queryKey: ['portal-profile'], queryFn: () => getJson<UserProfile | null>('/users/') },
    ],
  });

  function publishUpdatedDocument(updatedDocument: DocumentResponse) {
    queryClient.setQueryData(['portal-doc', id], updatedDocument);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      queryClient.invalidateQueries({ queryKey: ['portal-document-history', id] }),
    ]);
  }

  async function refreshLifecycleQueries() {
    await Promise.all([
      ['portal-doc', id],
      ['portal-documents'],
      ['portal-doc-chain', id],
      ['portal-document-history', id],
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  }

  const finalizeMutation = useMutation({
    mutationFn: async () => z.object({
      document_id: z.literal(id),
      onchain_document_id: z.string().min(1),
      data_hash: z.string().min(1),
      tx_hash: z.string().min(1),
    }).parse(await finalizeDocument(id)),
    retry: false,
    onSuccess: async (result) => {
      setFinalizationResult(result);
      setConfirmingFinalize(false);
      setSuccess(mockMode
        ? 'Demo finalization complete. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.'
        : 'Document finalized and anchored on-chain.');
      await refreshLifecycleQueries();
    },
    onError: (error) => {
      if (error instanceof PortalApiError && error.status >= 400 && error.status < 500 && error.status !== 408) return;
      sessionStorage.setItem(unknownFinalizationKey, '1');
      window.dispatchEvent(new Event('portal-finalization-status'));
      setConfirmingFinalize(false);
    },
  });

  const checkFinalizationMutation = useMutation({
    mutationFn: async () => finalizationStatusDocumentSchema.parse(await getJson<unknown>(`/documents/${id}`)),
    retry: false,
    onSuccess: async (updatedDocument) => {
      if (updatedDocument.document_id !== id || updatedDocument.lifecycle !== 'FINALIZED') {
        setStatusMessage('Status is inconclusive. Finalization is still locked; check status again later.');
        return;
      }
      queryClient.setQueryData(['portal-doc', id], updatedDocument);
      sessionStorage.removeItem(unknownFinalizationKey);
      window.dispatchEvent(new Event('portal-finalization-status'));
      setStatusMessage(undefined);
      setSuccess(mockMode
        ? 'Demo document status confirmed. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.'
        : 'Document finalized and anchored on-chain.');
      await refreshLifecycleQueries();
    },
    onError: () => {
      setStatusMessage('Unable to check finalization status. Finalization is still locked; check status again later.');
    },
  });

  const readinessMutation = useMutation({
    mutationFn: (action: 'ready' | 'reopen') => action === 'ready' ? markDocumentReady(id) : reopenDocument(id),
    onSuccess: async (updatedDocument, action) => {
      queryClient.setQueryData(['portal-doc', id], updatedDocument);
      setSuccess(action === 'ready' ? 'Document marked ready for signature.' : 'Document reopened for editing.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-document-comments', id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-document-history', id] }),
      ]);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelDocument(id),
    onSuccess: async (updatedDocument) => {
      queryClient.setQueryData(['portal-doc', id], updatedDocument);
      setCancelConfirmationOpen(false);
      setSuccess('Document cancelled. The record was kept.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
        queryClient.invalidateQueries({ queryKey: ['portal-document-history', id] }),
      ]);
    },
  });

  const retryProcessingMutation = useMutation({
    mutationFn: () => retryDocumentProcessing(id),
    onSuccess: async (result) => {
      setSuccess(result.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      ]);
    },
  });

  function openFinalizeConfirmation() {
    finalizeMutation.reset();
    setSuccess(undefined);
    setFinalizationResult(undefined);
    setConfirmingFinalize(true);
  }

  function openCancelConfirmation() {
    cancelMutation.reset();
    setSuccess(undefined);
    setCancelConfirmationOpen(true);
  }

  if (docQ.isLoading) return <div role="status" aria-label="Loading document" className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;
  if (docQ.isError && (!docQ.data || !finalizationResult)) {
    const status = readErrorStatus(docQ.error);
    if (status === 404) return <p className="text-sm text-[#4B6382]">Document not found.</p>;
    if (status === 401 || status === 403) return <p role="alert" className="text-sm font-bold text-[#B42318]">You do not have access to this document.</p>;
    return <div role="alert" className="space-y-3"><p className="text-sm font-bold text-[#B42318]">{docQ.error instanceof PortalApiError ? docQ.error.message : 'Unable to load this document.'}</p><button type="button" onClick={() => void docQ.refetch()} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-black text-[#0985E7]">Retry</button></div>;
  }
  if (!docQ.data) return <p role="status" className="text-sm text-[#4B6382]">Loading document…</p>;

  const document = docQ.data;
  const role = getPortalUiRole(profileQ.data?.role);
  const isDrafting = document.lifecycle === 'PREPARING' || document.lifecycle === 'READY_FOR_SIGNATURE';
  const actions = getDocumentActions(role, document);

  function requestRename() {
    setRenameName(document.file_name ?? '');
    setRenameError(undefined);
    setRenameOpen(true);
  }

  async function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileName = renameName.trim();
    if (!fileName) return;
    setRenamePending(true);
    try {
      await renameDocument(id, fileName);
      await docQ.refetch();
      setRenameOpen(false);
    } catch (error) {
      setRenameError(error instanceof Error ? error.message : 'Unable to rename this document.');
    } finally {
      setRenamePending(false);
    }
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <header className={`mx-auto flex w-full flex-col gap-2 ${isDrafting ? 'max-w-4xl' : ''}`}>
        <Link href="/portal/documents" className="flex w-fit shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0C2B49] hover:text-[#0985E7]">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to documents
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 title={document.file_name} className="min-w-0 max-w-full break-words text-2xl font-bold leading-8 text-[#0C2B49]">{document.file_name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getDocumentLifecycleBadgeClasses(document.lifecycle)}`}>{getDocumentLifecycleLabel(document.lifecycle)}</span>
              {document.lifecycle === 'FINALIZED' && <span className={`${getDocumentProcessingBadgeClasses(document.status)} rounded-full px-2.5 py-0.5 text-xs font-bold`}>{getDocumentProcessingStatusLabel(document.lifecycle, document.status)}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.includes('Rename document') && <button type="button" aria-label="Rename document" onClick={requestRename} disabled={renamePending} className="min-h-11 rounded-full border border-[#D7E4F2] px-3 py-2 text-sm font-extrabold text-[#0C2B49]">Rename</button>}
            {actions.includes('Review extracted text') && <Link href={`/portal/documents/${id}/review`} aria-label="Review extracted text" className="inline-flex min-h-11 items-center rounded-full bg-[#0985E7] px-3 py-2 text-sm font-extrabold text-white">Review text</Link>}
            {actions.includes('Finalize') && !finalizationResult && !hasUnknownFinalization && <button type="button" onClick={openFinalizeConfirmation} className="min-h-11 rounded-full bg-[#0673C4] px-3 py-2 text-sm font-extrabold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]">Finalize</button>}
            {actions.includes('Retry processing') && <button type="button" onClick={() => { setSuccess(undefined); retryProcessingMutation.mutate(); }} disabled={retryProcessingMutation.isPending} className="min-h-11 rounded-full border border-[#0985E7] px-3 py-2 text-sm font-extrabold text-[#0985E7] disabled:opacity-50">{retryProcessingMutation.isPending ? 'Retrying…' : 'Retry processing'}</button>}
            {document.permissions.can_cancel && <button type="button" aria-label="Cancel document" onClick={openCancelConfirmation} className="min-h-11 rounded-full border border-[#B42318] px-3 py-2 text-sm font-extrabold text-[#B42318]">Cancel</button>}
            {actions.includes('Check document') && <Link href={`/portal/documents/${id}/verify`} className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#0985E7] bg-[#EAF4FF] px-3 py-2 text-sm font-extrabold text-[#0C2B49] transition-colors hover:border-[#0985E7] hover:bg-[#0985E7] hover:text-white active:bg-[#0879D8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7]"><ShieldOutlinedIcon aria-hidden="true" className="text-[#0985E7] transition-colors group-hover:text-white group-focus-visible:text-white" sx={{ fontSize: 18 }} />Verify integrity</Link>}
          </div>
        </div>
        {retryProcessingMutation.error instanceof Error && <p role="alert" className="text-sm font-bold text-[#B42318]">{retryProcessingMutation.error.message || "Unable to retry document processing."}</p>}
      </header>

      <Modal open={renameOpen} onClose={() => { if (!renamePending) setRenameOpen(false); }} title="Rename document">
        <form onSubmit={submitRename}>
          <label htmlFor="document-name" className="grid gap-1.5 text-sm font-bold text-[#0C2B49]">
            Document name
            <input id="document-name" value={renameName} onChange={(event) => setRenameName(event.target.value)} className="w-full rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0985E7]" />
          </label>
          {renameError && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{renameError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setRenameOpen(false)} disabled={renamePending} className="rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!renameName.trim() || renamePending} className="rounded-full bg-[#0985E7] px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">{renamePending ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={cancelConfirmationOpen} onClose={() => { if (!cancelMutation.isPending) setCancelConfirmationOpen(false); }} title="Cancel document?">
        <p className="text-sm leading-6 text-[#4B6382]">This will mark the document as cancelled. The document record will be kept.</p>
        {cancelMutation.error instanceof Error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{cancelMutation.error.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setCancelConfirmationOpen(false)} disabled={cancelMutation.isPending} className="rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49] disabled:opacity-50">Keep document</button>
          <button type="button" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="rounded-full bg-[#B42318] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">{cancelMutation.isPending ? 'Cancelling…' : 'Confirm cancellation'}</button>
        </div>
      </Modal>

      {hasUnknownFinalization && <div role="status" className="space-y-3 rounded-xl border border-[#F1D29A] bg-[#FFF8E8] px-4 py-3 text-sm text-[#785000]">
        <p className="font-bold">Finalization outcome unknown. The request may have been accepted. Check status before taking further action.</p>
        {statusMessage && <p>{statusMessage}</p>}
        <button type="button" onClick={() => checkFinalizationMutation.mutate()} disabled={checkFinalizationMutation.isPending} className="rounded-full border border-[#0985E7] px-4 py-2 font-bold text-[#0985E7] disabled:opacity-60">{checkFinalizationMutation.isPending ? 'Checking status…' : 'Check status'}</button>
      </div>}
      {success && <p role="status" className="rounded-xl border border-[#BCE8CC] bg-[#F1FBF5] px-4 py-3 text-sm font-bold text-[#0C7A3B]">{success}</p>}
      {docQ.isError && finalizationResult && <p role="alert" className="text-sm font-bold text-[#B42318]">{mockMode ? 'Demo finalization completed, but the document could not be refreshed.' : 'Finalization succeeded, but the document could not be refreshed.'}</p>}
      {finalizationResult && <>
        {mockMode && <p role="note" className="rounded-xl border border-[#F1D29A] bg-[#FFF8E8] px-4 py-3 text-sm font-bold text-[#785000]">Synthetic demo record. No real PDF digest or blockchain transaction was produced.</p>}
        <details className="rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-4">
          <summary className="cursor-pointer text-sm font-bold text-[#0C2B49]">Record details (IDs and fingerprints)</summary>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-[#4B6382]">Document ID{mockMode ? ' (synthetic)' : ''}</dt><dd className="mt-1"><CopyableIdentifier value={finalizationResult.document_id} label="document ID" /></dd></div>
            <div><dt className="font-bold text-[#4B6382]">Blockchain record ID{mockMode ? ' (synthetic)' : ''}</dt><dd className="mt-1"><CopyableIdentifier value={finalizationResult.onchain_document_id} label="blockchain record ID" /></dd></div>
            <div><dt className="font-bold text-[#4B6382]">Document fingerprint{mockMode ? ' (synthetic; not a real PDF digest)' : ''}</dt><dd className="mt-1"><CopyableIdentifier value={finalizationResult.data_hash} label="document fingerprint" /></dd></div>
            <div><dt className="font-bold text-[#4B6382]">Transaction ID{mockMode ? ' (synthetic; no blockchain transaction)' : ''}</dt><dd className="mt-1"><CopyableIdentifier value={finalizationResult.tx_hash} label="transaction ID" /></dd></div>
          </dl>
        </details>
      </>}

      {confirmingFinalize && (
        <div role="dialog" aria-modal="true" aria-label="Confirm finalization" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C2B49]/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#CFE7FC] bg-white p-6 shadow-[0_16px_40px_rgba(12,43,73,0.25)]">
            <p className="text-lg font-black text-[#0C2B49]">Finalize this document?</p>
            <p className="mt-2 text-sm leading-6 text-[#4B6382]">{mockMode ? 'Demo mode: this action uses synthetic data. No real PDF digest or blockchain transaction will be produced.' : 'This freezes the signed copy and records its fingerprint on the blockchain. It cannot be undone.'}</p>
            {finalizeMutation.isPending && <p role="status" className="mt-3 text-sm text-[#4B6382]">{mockMode ? 'Completing demo finalization…' : 'Waiting for blockchain confirmation…'}</p>}
            {finalizeMutation.error instanceof Error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{finalizeMutation.error.message}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setConfirmingFinalize(false)} disabled={finalizeMutation.isPending} className="rounded-full border border-[#D6E3F1] px-4 py-2 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Cancel</button>
              <button type="button" onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending} className="rounded-full bg-[#0673C4] px-4 py-2 text-sm font-bold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0985E7] disabled:opacity-60">{finalizeMutation.isPending ? 'Finalizing…' : 'Confirm finalization'}</button>
            </div>
          </div>
        </div>
      )}

      <DocumentWorkspace
        className="min-h-0 flex-1 md:flex"
        document={document}
        onDocumentUpdated={publishUpdatedDocument}
        role={role}
        readinessError={readinessMutation.error instanceof Error ? readinessMutation.error : null}
        isChangingReadiness={readinessMutation.isPending}
        finalizationOutcomeUnknown={hasUnknownFinalization}
        onMarkReady={() => readinessMutation.mutate('ready')}
        onReopen={() => readinessMutation.mutate('reopen')}
      />
      <PortalChatbot documentId={id} />
    </div>
  );
}
