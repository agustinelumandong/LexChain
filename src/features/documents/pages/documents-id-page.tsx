'use client';

import { use, useState } from 'react';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ApiSchema } from '@/shared/types/index';
import { PortalChatbot as PortalChatbot } from "@/features/portal/components";
import { DocumentWorkspace } from '@/features/documents/components/document-workspace';
import { getDocumentActions, getDocumentLifecycleLabel, getDocumentStatusLabel } from '@/features/documents/document-ui';
import { renameDocument, finalizeDocument, markDocumentReady, reopenDocument } from '@/features/documents/document-lifecycle-api';
import { getPortalUiRole } from "@/features/access";

type DocumentResponse = ApiSchema<'DocumentResponse'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!response.ok) throw Object.assign(new Error(`Failed to fetch ${path}`), { status: response.status });
  return response.json();
}

function statusStyle(status?: string | null) {
  const value = status?.toLowerCase();
  if (value === 'anchored' || value === 'completed' || value === 'processed') return 'bg-[#EAF8F0] text-[#12A150]';
  if (value === 'processing' || value === 'pending' || value === 'accepted') return 'bg-[#FFF4DD] text-[#B77900]';
  return 'bg-[#EAF4FF] text-[#1689F5]';
}

function readErrorStatus(error: unknown) {
  return error instanceof Error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined;
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [renamePending, setRenamePending] = useState(false);
  const [confirmingFinalize, setConfirmingFinalize] = useState(false);
  const [finalizationResult, setFinalizationResult] = useState<ApiSchema<'RecordResponse'>>();
  const [success, setSuccess] = useState<string>();
  const [docQ, profileQ] = useQueries({
    queries: [
      { queryKey: ['portal-doc', id], queryFn: () => getJson<DocumentResponse>(`/documents/${id}`) },
      { queryKey: ['portal-profile'], queryFn: () => getJson<UserProfile | null>('/users/') },
    ],
  });

  async function refreshLifecycleQueries() {
    await Promise.all([
      ['portal-doc', id],
      ['portal-doc-chain', id],
      ['portal-document-audit', id],
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  }

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeDocument(id),
    onSuccess: async (result) => {
      setFinalizationResult(result);
      setConfirmingFinalize(false);
      setSuccess('Document finalized and anchored on-chain.');
      await refreshLifecycleQueries();
    },
  });

  const readinessMutation = useMutation({
    mutationFn: (action: 'ready' | 'reopen') => action === 'ready' ? markDocumentReady(id) : reopenDocument(id),
    onSuccess: async (_result, action) => {
      setSuccess(action === 'ready' ? 'Document marked ready for signature.' : 'Document reopened for editing.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
        queryClient.invalidateQueries({ queryKey: ['portal-document-comments', id] }),
      ]);
    },
  });

  function openFinalizeConfirmation() {
    finalizeMutation.reset();
    setSuccess(undefined);
    setFinalizationResult(undefined);
    setConfirmingFinalize(true);
  }

  if (docQ.isLoading) return <div role="status" aria-label="Loading document" className="h-40 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;
  if (docQ.isError) {
    const status = readErrorStatus(docQ.error);
    if (status === 404) return <p className="text-sm text-[#64748b]">Document not found.</p>;
    if (status === 401 || status === 403) return <p role="alert" className="text-sm font-bold text-[#B42318]">You do not have access to this document.</p>;
    return <div role="alert" className="space-y-3"><p className="text-sm font-bold text-[#B42318]">Unable to load this document.</p><button type="button" onClick={() => void docQ.refetch()} className="rounded-full border border-[#0985E7] px-4 py-2 text-sm font-black text-[#0985E7]">Retry</button></div>;
  }
  if (!docQ.data) return <p role="status" className="text-sm text-[#64748b]">Loading document…</p>;

  const document = docQ.data;
  const role = getPortalUiRole(profileQ.data?.role);
  const actions = getDocumentActions(role, document);

  async function requestRename() {
    const fileName = window.prompt('Document name', document.file_name ?? '');
    if (!fileName?.trim()) return;
    setRenamePending(true);
    try {
      await renameDocument(id, fileName);
      await docQ.refetch();
    } finally {
      setRenamePending(false);
    }
  }

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
              <span className="rounded-full bg-[#EAF4FF] px-2.5 py-0.5 text-[11px] font-bold text-[#1689F5]">{getDocumentLifecycleLabel(document.lifecycle)}</span>
              <span className={`${statusStyle(document.status)} rounded-full px-2.5 py-0.5 text-[11px] font-bold`}>{getDocumentStatusLabel(document.status)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.includes('Rename document') && <button type="button" onClick={requestRename} disabled={renamePending} className="rounded-full border border-[#D7E4F2] px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Rename document</button>}
            {actions.includes('Review extracted text') && <Link href={`/portal/documents/${id}/review`} className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Review extracted text</Link>}
            {document.signed_copy && <a href={document.signed_copy.storage_url} download className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Download current signed PDF</a>}
            {actions.includes('Finalize') && !finalizationResult && <button type="button" onClick={openFinalizeConfirmation} className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-extrabold text-white">Finalize</button>}
            {actions.includes('Verify integrity') && <Link href={`/portal/documents/${id}/verify`} className="rounded-full border border-[#E8F0F8] bg-white px-4 py-2.5 text-sm font-extrabold text-[#0C2B49]">Verify integrity</Link>}
          </div>
        </div>
      </header>

      <DocumentWorkspace
        document={document}
        finalizationResult={finalizationResult}
        confirmingFinalize={confirmingFinalize}
        isFinalizing={finalizeMutation.isPending}
        finalizeError={finalizeMutation.error instanceof Error ? finalizeMutation.error.message : null}
        onCancelFinalize={() => setConfirmingFinalize(false)}
        onConfirmFinalize={() => finalizeMutation.mutate()}
        success={success}
        readinessError={readinessMutation.error instanceof Error ? readinessMutation.error.message : null}
        readinessSuccess={readinessMutation.isSuccess ? success : undefined}
        isChangingReadiness={readinessMutation.isPending}
        onMarkReady={() => readinessMutation.mutate('ready')}
        onReopen={() => readinessMutation.mutate('reopen')}
      />
      <PortalChatbot documentId={id} />
    </div>
  );
}
