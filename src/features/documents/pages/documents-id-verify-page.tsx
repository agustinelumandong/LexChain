'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState } from 'react';
import RestoreIcon from '@mui/icons-material/Restore';
import { toast } from 'sonner';
import { usePortalRole } from '@/features/access/components';
import { Modal } from '@/features/admin/components/modal';
import { restoreDocument } from '@/features/documents/document-lifecycle-api';
import { verifyRepositoryDocument } from "@/features/verification";
import { VerifyWorkspace as VerifyWorkspace } from "@/features/verification/components";
import { portalFetch } from '@/shared/api/client';
import type { ApiSchema } from '@/shared/types/index';

export default function DocumentVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const role = usePortalRole();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreResult, setRestoreResult] = useState<ApiSchema<'RestoreResponse'> | null>(null);
  const restoreSubmissionLock = useRef(false);
  const documentQuery = useQuery({
    queryKey: ['portal-doc', id],
    queryFn: () => portalFetch<ApiSchema<'DocumentResponse'>>(`/documents/${id}`),
    retry: false,
  });
  const verifyQuery = useQuery({
    queryKey: ['portal-doc-chain', id],
    queryFn: () => verifyRepositoryDocument(id),
    retry: false,
    refetchOnMount: 'always',
  });
  const restoreMutation = useMutation({
    mutationFn: () => restoreDocument(id),
    retry: false,
    onSuccess: async (result) => {
      queryClient.setQueryData(['portal-doc-chain', id], result.verification);
      setRestoreDialogOpen(false);
      setRestoreResult(result);
      if (result.unrepaired?.length) toast.warning('Some record values still need a database backup.');
      else toast.success(result.restored ? 'Document repair completed.' : 'Nothing needed repair. Verification has been refreshed.');
      await Promise.all([
        ['portal-doc', id],
        ['portal-documents'],
        ['portal-doc-signed-copies', id],
        ['portal-document-history', id],
        ['portal-doc-chain', id],
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
    onSettled: () => { restoreSubmissionLock.current = false; },
  });
  const verificationAllowsRestore = !verifyQuery.isFetching && !verifyQuery.isError && verifyQuery.data?.needs_restore === true;
  const documentAllowsRestore = role === 'lawyer'
    && !documentQuery.isFetching
    && !documentQuery.isError
    && documentQuery.data?.permissions?.can_restore === true;
  const canOfferRestore = verificationAllowsRestore && documentAllowsRestore;
  const isNotFoundOrUnanchored = verifyQuery.error instanceof Error && 'status' in verifyQuery.error && verifyQuery.error.status === 404;

  function closeRestoreDialog() {
    if (restoreMutation.isPending || restoreSubmissionLock.current) return;
    setRestoreDialogOpen(false);
  }

  function submitRestore() {
    if (restoreMutation.isPending || restoreSubmissionLock.current) return;
    restoreSubmissionLock.current = true;
    restoreMutation.mutate();
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden md:h-[calc(100dvh-7rem)] md:overflow-hidden">
      <header>
        <Link href={`/portal/documents/${id}`} className="text-sm font-bold text-[#0C2B49] hover:text-[#0067B3]">← Back to document</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-black text-[#0C2B49]">Check this document</h1>
          {canOfferRestore && (
            <button
              type="button"
              onClick={() => { restoreMutation.reset(); setRestoreDialogOpen(true); }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7E4F2] bg-white px-4 py-2.5 text-sm font-black text-[#0C2B49] transition hover:bg-[#F1F7FD]"
            >
              <RestoreIcon aria-hidden="true" sx={{ fontSize: 18 }} />
              Restore from backup
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-[#4B6382]">We compare this PDF with the version saved when the document was finalized to help show whether it has changed.</p>
      </header>

      {restoreResult && (
        <section aria-label="Restore result" className="rounded-[18px] border border-[#D7E4F2] bg-white p-4 text-sm text-[#344054]">
          <h2 className="font-bold text-[#0C2B49]">Restore result</h2>
          <p>{restoreResult.unrepaired?.length ? 'Some values could not be repaired.' : restoreResult.restored ? 'The backend completed the repair.' : 'Nothing needed repair.'}</p>
          {restoreResult.repaired && restoreResult.repaired.length > 0 && <p className="mt-2">Repaired: {restoreResult.repaired.map((value) => `${value.record}.${value.field}`).join(', ')}</p>}
          {restoreResult.unrepaired && restoreResult.unrepaired.length > 0 && <p role="alert" className="mt-2 font-bold text-[#8A5B00]">Needs a database backup: {restoreResult.unrepaired.join(', ')}</p>}
        </section>
      )}

      {role === 'lawyer' && verificationAllowsRestore && documentQuery.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm text-[#6B4E00]">
          <p>We could not confirm your permission to restore this document, so restore is unavailable.</p>
          <button type="button" disabled={documentQuery.isFetching} onClick={() => void documentQuery.refetch()} className="rounded-full border border-amber-300 bg-white px-4 py-2 font-bold disabled:cursor-wait disabled:opacity-60">
            {documentQuery.isFetching ? 'Checking permission…' : 'Try again'}
          </button>
        </div>
      )}

      {verifyQuery.isPending || verifyQuery.isFetching ? (
        <VerifySkeleton />
      ) : verifyQuery.isError ? (
        <div role="alert" className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-6">
          <p className="font-bold">{isNotFoundOrUnanchored ? 'No saved blockchain record found' : 'We could not check this document'}</p>
          <p className="text-sm text-[#4B6382]">
            {isNotFoundOrUnanchored ? 'We could not find this document or its saved blockchain record.' : verifyQuery.error instanceof Error ? verifyQuery.error.message : 'Please try again.'}
          </p>
          {!isNotFoundOrUnanchored && <button type="button" onClick={() => void verifyQuery.refetch()} className="rounded-full border border-[#0067B3] px-5 py-3 text-sm font-black text-[#0067B3]">
            Try again
          </button>}
        </div>
      ) : verifyQuery.data ? (
        <VerifyWorkspace result={verifyQuery.data} onRetry={() => void verifyQuery.refetch()} role={role} />
      ) : null}

      <Modal open={restoreDialogOpen} onClose={closeRestoreDialog} title="Restore archived original">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#4B6382]">
            The backend will check and repair the file and record using the blockchain and archived original. If a current PDF is replaced, it will be kept in signed-copy history if the backend can read it. Any values that cannot be repaired will need a database backup.
          </p>
          {restoreMutation.isError && <p role="alert" className="text-sm font-semibold text-[#B42318]">
            {restoreMutation.error instanceof Error ? restoreMutation.error.message : 'The document could not be restored. Please try again.'}
          </p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={restoreMutation.isPending} onClick={closeRestoreDialog} className="rounded-full border border-[#D7E4F2] bg-white px-4 py-2.5 text-sm font-bold text-[#4B6382] disabled:cursor-not-allowed disabled:opacity-60">
              Cancel
            </button>
            <button type="button" disabled={restoreMutation.isPending} onClick={submitRestore} className="rounded-full bg-[#0C2B49] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
              {restoreMutation.isPending ? 'Restoring…' : 'Restore archived original'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function VerifySkeleton() {
  return (
    <div className="relative flex flex-col gap-5 md:min-h-0 md:flex-1">
      <div className="h-32 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />
      <div className="grid min-w-0 flex-1 gap-5 md:min-h-0 md:grid-cols-2">
        <div className="min-h-64 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white md:min-h-0" />
        <div className="min-h-64 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white md:min-h-0" />
      </div>
      <div
        role="status"
        aria-label="Checking the document"
        className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-[#F5FAFF]/60 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 rounded-full border border-[#D7E4F2] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(12,43,73,0.1)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7E4F2] border-t-[#0067B3]" />
          <p className="text-sm font-black text-[#0C2B49]">
            Checking this document against its saved version…
          </p>
        </div>
      </div>
    </div>
  );
}
