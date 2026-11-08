'use client';

import { use, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ApiSchema } from '@/shared/types/index';
import { PortalChatbot as PortalChatbot } from "@/features/portal/components";
import { CopyableIdentifier, DocumentWorkspace, type Tab } from '@/features/documents/components/document-workspace';
import { getDocumentActions, getDocumentLifecycleBadgeClasses, getDocumentLifecycleLabel, getDocumentProcessingBadgeClasses, getDocumentProcessingStatusLabel, isDocumentOnChain } from '@/features/documents/document-ui';
import { renameDocument, finalizeDocument, markDocumentReady, reopenDocument, cancelDocument, signedCopyFileUrl } from '@/features/documents/document-lifecycle-api';
import { getPortalUiRole, listDocumentParties } from "@/features/access";
import { listRegisterBooks } from '@/features/office/books-api';
import { Modal } from '@/features/admin/components/modal';
import { portalRequest } from '@/shared/api/client';
import { PortalApiError } from '@/shared/api/portal-error';
import { isMockMode } from '@/lib/mocks/mode';
import { retryDocumentProcessing } from '@/features/documents/document-lifecycle-api';
import { usePopup } from '@/shared/components/ui/use-popup';
import { DocumentIntegrityStatus } from '@/features/verification/components/document-integrity-status';

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;
const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), { ssr: false });

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

export default function DocumentDetailPage({ params, initialTab }: { params: Promise<{ id: string }>; initialTab?: string }) {
  const { id } = use(params);
  const mockMode = isMockMode();
  const queryClient = useQueryClient();
  const [renamePending, setRenamePending] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [renameError, setRenameError] = useState<string>();
  const { open: documentActionsOpen, setOpen: setDocumentActionsOpen, ref: documentActionsRef } = usePopup();
  const [confirmingFinalize, setConfirmingFinalize] = useState(false);
  const finalizationDialogRef = useRef<HTMLDialogElement>(null);
  const finalizationHeadingRef = useRef<HTMLHeadingElement>(null);
  const finalizationTriggerRef = useRef<HTMLElement | null>(null);
  const [finalizationStep, setFinalizationStep] = useState<1 | 2 | 3>(1);
  const [reviewedCopyId, setReviewedCopyId] = useState<string | null>(null);
  const [reviewedDetails, setReviewedDetails] = useState<string | null>(null);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>();
  const [finalizationResult, setFinalizationResult] = useState<ApiSchema<'RecordResponse'>>();
  const [statusMessage, setStatusMessage] = useState<string>();
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

  const finalizationBooks = useQuery({ queryKey: ['portal-books'], queryFn: listRegisterBooks, enabled: confirmingFinalize && Boolean(docQ.data?.book_id), retry: false });
  const finalizationParties = useQuery({ queryKey: ['portal-document-parties', id], queryFn: () => listDocumentParties(id), enabled: confirmingFinalize, retry: false });

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
      toast.success(
        mockMode
          ? 'Demo finalization complete. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.'
          : 'Document finalized and anchored on-chain.',
        {
          action: {
            label: 'View blockchain record →',
            onClick: () => setActiveTab('Blockchain'),
          },
        },
      );
      await refreshLifecycleQueries();
    },
    onError: (error) => {
      if (error instanceof PortalApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ['portal-doc', id] });
      }
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
      toast.success(
        mockMode
          ? 'Demo document status confirmed. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.'
          : updatedDocument.on_chain
            ? 'Document finalized and recorded on-chain.'
            : 'Document finalization confirmed.',
        {
          action: {
            label: updatedDocument.on_chain ? 'View blockchain record →' : 'View record status →',
            onClick: () => setActiveTab('Blockchain'),
          },
        },
      );
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
      toast.success(action === 'ready' ? 'Document marked ready for signature.' : 'Document reopened for editing.');
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
      toast.success('Document cancelled. The record was kept.');
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
      toast.success(result.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      ]);
    },
  });

  function openFinalizeConfirmation() {
    finalizationTriggerRef.current = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
    setFinalizationStep(1);
    setReviewedCopyId(null);
    setReviewedDetails(null);
    finalizeMutation.reset();
    setFinalizationResult(undefined);
    setConfirmingFinalize(true);
  }

  function openCancelConfirmation() {
    cancelMutation.reset();
    setCancelConfirmationOpen(true);
  }

  useEffect(() => {
    const dialog = finalizationDialogRef.current;
    if (!dialog) return;
    if (confirmingFinalize && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    else if (!confirmingFinalize && dialog.open) { dialog.close(); finalizationTriggerRef.current?.focus(); }
  }, [confirmingFinalize, docQ.data]);

  useEffect(() => {
    if (confirmingFinalize) finalizationHeadingRef.current?.focus();
  }, [confirmingFinalize, finalizationStep]);

  if (docQ.isLoading) return <div role="status" aria-label="Loading document" className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;
  if (docQ.isError && (!docQ.data || !finalizationResult)) {
    const status = readErrorStatus(docQ.error);
    if (status === 404) {
      return (
        <section aria-labelledby="document-unavailable-heading" className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-[#E8F0F8] bg-white p-8 text-center shadow-sm">
          <h1 id="document-unavailable-heading" className="text-xl font-black text-[#0C2B49]">Document unavailable</h1>
          <p className="mt-2 text-sm text-[#5B6F8A]">This document could not be found or your account does not have permission to view it.</p>
          <Link href="/portal/documents" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0067B3] px-5 py-2 text-sm font-bold text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
            Back to Documents
          </Link>
        </section>
      );
    }
    if (status === 401 || status === 403) {
      return (
        <section role="alert" aria-labelledby="document-access-heading" className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-[#E8F0F8] bg-white p-8 text-center shadow-sm">
          <h1 id="document-access-heading" className="text-xl font-black text-[#0C2B49]">Access denied</h1>
          <p className="mt-2 text-sm text-[#5B6F8A]">You do not have access to this document.</p>
          <Link href="/portal/documents" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0067B3] px-5 py-2 text-sm font-bold text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
            Back to Documents
          </Link>
        </section>
      );
    }
    return (
      <section role="alert" aria-labelledby="document-error-heading" className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-[#E8F0F8] bg-white p-8 text-center shadow-sm">
        <h1 id="document-error-heading" className="text-xl font-black text-[#0C2B49]">Unable to load document</h1>
        <p className="mt-2 text-sm text-[#B42318]">{docQ.error instanceof PortalApiError ? docQ.error.message : 'Unable to load this document.'}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => void docQ.refetch()} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0067B3] px-5 py-2 text-sm font-black text-[#0067B3] hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
            Retry
          </button>
          <Link href="/portal/documents" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D7E4F2] px-5 py-2 text-sm font-bold text-[#0C2B49] hover:bg-[#F4F8FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
            Back to Documents
          </Link>
        </div>
      </section>
    );
  }
  if (!docQ.data) return <p role="status" className="text-sm text-[#4B6382]">Loading document…</p>;

  const document = docQ.data;
  const role = getPortalUiRole(profileQ.data?.role);
  const actions = getDocumentActions(role, document);
  const finalizationBook = finalizationBooks.data?.find((book) => book.id === document.book_id);
  const finalizationDetails = JSON.stringify([document.file_name, document.book_id, document.doc_no, document.page_no, document.signed_copy, finalizationBook, finalizationParties.data]);
  const finalizationDetailsUnavailable = finalizationParties.isLoading || finalizationParties.isError || !finalizationParties.data || (Boolean(document.book_id) && (finalizationBooks.isLoading || finalizationBooks.isError || !finalizationBook));

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
      toast.success('Document renamed.');
      await docQ.refetch();
      setRenameOpen(false);
    } catch (error) {
      setRenameError(error instanceof Error ? error.message : 'Unable to rename this document.');
    } finally {
      setRenamePending(false);
    }
  }

  const canReviewText = actions.includes('Review extracted text');
  const canFinalize = actions.includes('Finalize') && !finalizationResult && !hasUnknownFinalization;
  const canRetry = actions.includes('Retry processing');
  const workflowActions = (canReviewText || canFinalize || canRetry || retryProcessingMutation.error instanceof Error) ? (
    <div className="flex flex-wrap items-center gap-2">
      {retryProcessingMutation.error instanceof Error && <p role="alert" className="text-sm font-bold text-[#B42318]">{retryProcessingMutation.error.message || 'Unable to retry document processing.'}</p>}
      <div className="flex flex-wrap gap-2">
        {canReviewText && <Link href={`/portal/documents/${id}/review`} aria-label="Review extracted text" className="inline-flex min-h-11 items-center rounded-full bg-[#0067B3] px-5 py-2 text-sm font-extrabold text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Review text</Link>}
        {canFinalize && <button type="button" onClick={openFinalizeConfirmation} className="min-h-11 rounded-full bg-[#0673C4] px-5 py-2 text-sm font-extrabold text-white hover:bg-[#005FA3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Finalize</button>}
        {canRetry && <button type="button" onClick={() => retryProcessingMutation.mutate()} disabled={retryProcessingMutation.isPending} className="min-h-11 rounded-full border border-[#0067B3] px-5 py-2 text-sm font-extrabold text-[#0067B3] hover:bg-[#EEF6FF] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">{retryProcessingMutation.isPending ? 'Retrying…' : 'Retry processing'}</button>}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 sm:px-6">
        <Link href="/portal/documents" className="flex w-fit shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0C2B49] hover:text-[#0067B3]">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to documents
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 title={document.file_name} className="min-w-0 max-w-full break-words text-2xl font-bold leading-8 text-[#0C2B49]">{document.file_name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-0.5 text-xs font-bold ${getDocumentLifecycleBadgeClasses(document.lifecycle)}`}>
                {isDocumentOnChain(document.lifecycle) ? (
                  <LinkIcon aria-hidden="true" sx={{ fontSize: 14 }} />
                ) : (
                  <CircleIcon aria-hidden="true" sx={{ fontSize: 8 }} />
                )}
                {getDocumentLifecycleLabel(document.lifecycle)}
              </span>
              {(document.lifecycle === 'FINALIZED' || (document.lifecycle === 'SIGNED' && document.status)) && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-0.5 text-xs font-bold ${getDocumentProcessingBadgeClasses(document.status)}`}>
                  <CircleIcon aria-hidden="true" sx={{ fontSize: 8 }} />
                  {getDocumentProcessingStatusLabel(document.lifecycle, document.status)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(actions.includes('Rename document') || document.permissions.can_cancel) && <div ref={documentActionsRef} className="relative">
              <button type="button" aria-label="More document actions" aria-expanded={documentActionsOpen} aria-controls="document-actions-menu" onClick={() => setDocumentActionsOpen((open) => !open)} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#D7E4F2] text-[#0C2B49] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">
                <MoreVertIcon aria-hidden="true" sx={{ fontSize: 20 }} />
              </button>
              {documentActionsOpen && <div id="document-actions-menu" role="group" aria-label="Document actions" className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[#D7E4F2] bg-white p-1 shadow-lg shadow-[#183B6B]/10">
                {actions.includes('Rename document') && <button type="button" onClick={() => { setDocumentActionsOpen(false); requestRename(); }} disabled={renamePending} className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-[#0C2B49] hover:bg-[#EEF4FB] disabled:opacity-50">Rename</button>}
                {document.permissions.can_cancel && <button type="button" onClick={() => { setDocumentActionsOpen(false); openCancelConfirmation(); }} className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-[#B42318] hover:bg-red-50">Cancel document</button>}
              </div>}
            </div>}
            {document.lifecycle !== 'FINALIZED' && actions.includes('Check document') && <Link href={`/portal/documents/${id}/verify`} className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#0067B3] bg-[#EAF4FF] px-3 py-2 text-sm font-extrabold text-[#0C2B49] transition-colors hover:border-[#0067B3] hover:bg-[#0067B3] hover:text-white active:bg-[#0067B3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"><ShieldOutlinedIcon aria-hidden="true" className="text-[#0067B3] transition-colors group-hover:text-white group-focus-visible:text-white" sx={{ fontSize: 18 }} />Verify integrity</Link>}
          </div>
        </div>
        {document.lifecycle === 'FINALIZED' && <DocumentIntegrityStatus documentId={id} mockMode={mockMode} />}
      </header>

      <Modal open={renameOpen} onClose={() => { if (!renamePending) setRenameOpen(false); }} title="Rename document">
        <form onSubmit={submitRename}>
          <label htmlFor="document-name" className="grid gap-1.5 text-sm font-bold text-[#0C2B49]">
            Document name
            <input id="document-name" value={renameName} onChange={(event) => setRenameName(event.target.value)} className="w-full rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm font-medium outline-none focus:border-[#0067B3]" />
          </label>
          {renameError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{renameError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setRenameOpen(false)} disabled={renamePending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49] hover:bg-[#F4F8FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!renameName.trim() || renamePending} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0067B3] px-5 py-2.5 text-sm font-black text-white hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-40">{renamePending ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={cancelConfirmationOpen} onClose={() => { if (!cancelMutation.isPending) setCancelConfirmationOpen(false); }} title="Cancel document?">
        <p className="text-sm leading-6 text-[#4B6382]">This will mark the document as cancelled. The document record will be kept.</p>
        {cancelMutation.error instanceof Error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{cancelMutation.error.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setCancelConfirmationOpen(false)} disabled={cancelMutation.isPending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D7E4F2] px-5 py-2.5 text-sm font-bold text-[#0C2B49] hover:bg-[#F4F8FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50">Keep document</button>
          <button type="button" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#B42318] px-5 py-2.5 text-sm font-black text-white hover:bg-[#912018] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-50">{cancelMutation.isPending ? 'Cancelling…' : 'Confirm cancellation'}</button>
        </div>
      </Modal>

      {hasUnknownFinalization && <div role="status" className="mx-auto w-full max-w-7xl space-y-3 rounded-xl border border-[#F1D29A] bg-[#FFF8E8] px-4 py-3 text-sm text-[#785000]">
        <p className="font-bold">Finalization outcome unknown. The request may have been accepted. Check status before taking further action.</p>
        {statusMessage && <p>{statusMessage}</p>}
        <button type="button" onClick={() => checkFinalizationMutation.mutate()} disabled={checkFinalizationMutation.isPending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0067B3] px-4 py-2 font-bold text-[#0067B3] hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3] disabled:opacity-60">{checkFinalizationMutation.isPending ? 'Checking status…' : 'Check status'}</button>
      </div>}
      {docQ.isError && finalizationResult && <>
        <p role="alert" className="text-sm font-bold text-[#B42318]">{mockMode ? 'Demo finalization completed, but the document could not be refreshed.' : 'Finalization succeeded, but the document could not be refreshed.'}</p>
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

      <dialog ref={finalizationDialogRef} tabIndex={-1} aria-modal="true" aria-label="Confirm finalization" onCancel={(event) => { event.preventDefault(); if (!finalizeMutation.isPending) setConfirmingFinalize(false); }} className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-transparent p-0 backdrop:bg-[#0C2B49]/40 ${finalizationStep === 1 ? 'max-w-5xl' : finalizationStep === 2 ? 'max-w-3xl' : 'max-w-xl'}`}>
        {confirmingFinalize && <div className={`flex max-h-[90dvh] w-full flex-col rounded-2xl bg-white p-4 shadow-xl sm:p-6 ${finalizationStep === 1 ? 'h-[90dvh]' : ''}`}>
          <header className="shrink-0 pb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#4B6382]">Step {finalizationStep} of 3</p>
            <h2 ref={finalizationHeadingRef} tabIndex={-1} className="mt-1 text-lg font-black text-[#0C2B49]">{finalizationStep === 1 ? 'Review the signed PDF' : finalizationStep === 2 ? 'Check document details' : 'Confirm finalization'}</h2>
            {finalizationStep === 1 && <p className="mt-1 text-sm text-[#4B6382]">Scroll through the entire signed PDF before continuing.</p>}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {finalizationStep === 1 && (document.signed_copy ? <div className="flex h-full min-h-0 flex-col">
              <PdfDocumentViewer key={document.signed_copy.id} sourceUrl={signedCopyFileUrl(document.document_id, { copyId: document.signed_copy.id })} watermarkText="LEXCHAIN COPY" continuous currentPage={0} blocks={[]} selectedBlockIndex={null} hoveredBlockIndex={null} onPageChange={() => undefined} onSelectBlock={() => undefined} onHoverBlockChange={() => undefined} onReachedEnd={() => setReviewedCopyId(document.signed_copy?.id ?? null)} />
            </div> : <p role="alert" className="text-sm text-[#B42318]">The signed PDF is unavailable. Attach a signed PDF before finalizing.</p>)}
            {finalizationStep === 2 && <div className="space-y-4 text-sm text-[#0C2B49]">
              <p>Check these details before finalizing. Go back and correct the document if anything is wrong.</p>
              <dl className="grid gap-4 rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-4 sm:grid-cols-2">
                <div><dt className="font-bold text-[#4B6382]">Document</dt><dd className="mt-1 break-words">{document.file_name}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Signed PDF</dt><dd className="mt-1 break-words">{document.signed_copy?.original_filename ?? document.file_name}{typeof document.signed_copy?.size_bytes === 'number' ? ` · ${(document.signed_copy.size_bytes / (1024 * 1024)).toFixed(1)} MB` : ''}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Register book</dt><dd className="mt-1">{!document.book_id ? 'Not assigned' : finalizationBooks.isLoading ? 'Loading…' : finalizationBooks.isError ? 'Unable to load book' : finalizationBook ? `Book ${finalizationBook.book_number} · Series ${finalizationBook.series_year}` : 'Book unavailable'}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Register entry</dt><dd className="mt-1">{document.doc_no != null ? `Document ${document.doc_no}` : 'Document number unavailable'} · {document.page_no != null ? `Page ${document.page_no}` : 'Page number unavailable'}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Created</dt><dd className="mt-1">{!Number.isNaN(Date.parse(document.created_at)) ? `${new Date(document.created_at).toISOString().slice(0, 10)} UTC` : 'Unavailable'}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Attached</dt><dd className="mt-1">{document.signed_copy?.created_at && !Number.isNaN(Date.parse(document.signed_copy.created_at)) ? `${new Date(document.signed_copy.created_at).toISOString().slice(0, 10)} UTC` : 'Unavailable'}</dd></div>
                <div><dt className="font-bold text-[#4B6382]">Participants</dt><dd className="mt-1">{finalizationParties.isLoading ? 'Loading…' : finalizationParties.isError || !finalizationParties.data ? 'Unavailable' : [finalizationParties.data.issuer, ...(finalizationParties.data.parties ?? [])].map((party) => `${[party.f_name, party.l_name].filter(Boolean).join(' ') || party.email} (${party.role}, ${party.status})`).join(', ')}</dd></div>
                {document.signed_copy?.sha256 && <div className="sm:col-span-2"><dt className="font-bold text-[#4B6382]">Signed PDF fingerprint</dt><dd className="mt-1 break-all font-mono text-xs">SHA-256: {document.signed_copy.sha256}</dd></div>}
              </dl>
              {(finalizationParties.isError || (document.book_id && (finalizationBooks.isError || (!finalizationBooks.isLoading && !finalizationBook)))) && <div role="alert" className="text-sm text-[#B42318]">Unable to load all document details. <button type="button" onClick={() => { if (finalizationParties.isError) void finalizationParties.refetch(); if (document.book_id) void finalizationBooks.refetch(); }} className="font-bold underline">Retry</button></div>}
            </div>}
            {finalizationStep === 3 && <div className="space-y-3 text-sm leading-6 text-[#4B6382]">
              <p>Are the signed PDF and document details correct?</p>
              <p>The frozen filing copy cannot be replaced or removed after finalization.</p>
              {mockMode && <p>Demo mode: this action uses synthetic data. No real PDF digest or blockchain transaction will be produced.</p>}
            </div>}
            {finalizeMutation.isPending && <div role="status" className="mt-3 rounded-xl border border-[#CFE7FC] bg-[#F0F7FE] p-3 text-sm font-semibold text-[#0067B3]"><p>{mockMode ? 'Completing demo finalization…' : 'Waiting for blockchain confirmation…'}</p><p className="mt-0.5 text-xs font-normal text-[#4B6382]">Please keep this window open while the transaction is recorded.</p><div role="progressbar" aria-label="Finalization in progress" className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#CFE7FC]"><div className="document-processing-indeterminate h-full w-2/5 rounded-full bg-[#0067B3] motion-reduce:animate-none" /></div></div>}
            {finalizeMutation.error instanceof Error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-[#B42318]">{finalizeMutation.error.message}</p>}
            {finalizationStep === 3 && reviewedDetails !== finalizationDetails && <p role="alert" className="mt-3 text-sm font-bold text-[#B42318]">Document details changed. Go back and review them again.</p>}
            {finalizationStep > 1 && reviewedCopyId !== document.signed_copy?.id && <p role="alert" className="mt-3 text-sm font-bold text-[#B42318]">The signed PDF changed. Go back and review the current copy.</p>}
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 pt-4">
            <button type="button" onClick={() => setConfirmingFinalize(false)} disabled={finalizeMutation.isPending} className="min-h-11 rounded-full border border-[#D6E3F1] px-4 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Cancel</button>
            {finalizationStep > 1 && <button type="button" onClick={() => setFinalizationStep(finalizationStep === 3 ? 2 : 1)} disabled={finalizeMutation.isPending} className="min-h-11 rounded-full border border-[#D6E3F1] px-4 text-sm font-bold text-[#0C2B49] disabled:opacity-60">Back</button>}
            {finalizationStep < 3 ? <button type="button" onClick={() => { if (finalizationStep === 2) setReviewedDetails(finalizationDetails); setFinalizationStep(finalizationStep === 1 ? 2 : 3); }} disabled={!document.signed_copy || reviewedCopyId !== document.signed_copy.id || (finalizationStep === 2 && finalizationDetailsUnavailable)} className="min-h-11 rounded-full bg-[#0673C4] px-5 text-sm font-bold text-white disabled:opacity-50">Next</button> : <button type="button" onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending || !document.signed_copy || reviewedCopyId !== document.signed_copy.id || finalizationDetailsUnavailable || reviewedDetails !== finalizationDetails} className="min-h-11 rounded-full bg-[#0673C4] px-5 text-sm font-bold text-white disabled:opacity-50">{finalizeMutation.isPending ? 'Finalizing…' : 'Confirm finalization'}</button>}
          </footer>
        </div>}
      </dialog>

      <DocumentWorkspace
        initialTab={initialTab}
        className="min-h-0 flex-1 md:flex"
        document={document}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        finalizationResult={finalizationResult}
        onDocumentUpdated={publishUpdatedDocument}
        role={role}
        readinessError={readinessMutation.error instanceof Error ? readinessMutation.error : null}
        isChangingReadiness={readinessMutation.isPending}
        finalizationOutcomeUnknown={hasUnknownFinalization}
        isConfirmingFinalization={confirmingFinalize}
        workflowActions={workflowActions}
        onMarkReady={() => readinessMutation.mutate('ready')}
        onReopen={() => readinessMutation.mutate('reopen')}
      />
      {document.lifecycle === 'FINALIZED' && <PortalChatbot documentId={id} />}
    </div>
  );
}
