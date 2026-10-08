'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { verifyRepositoryDocument } from "@/features/verification";
import { VerifyWorkspace as VerifyWorkspace } from "@/features/verification/components";

export default function DocumentVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const verifyQuery = useQuery({
    queryKey: ['portal-doc-chain', id],
    queryFn: () => verifyRepositoryDocument(id),
    retry: false,
    refetchOnMount: 'always',
  });
  const isNotFoundOrUnanchored = verifyQuery.error instanceof Error && 'status' in verifyQuery.error && verifyQuery.error.status === 404;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden md:h-[calc(100dvh-7rem)] md:overflow-hidden">
      <header>
        <Link href={`/portal/documents/${id}`} className="text-sm font-bold text-[#0985E7]">← Back to document</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-black text-[#0C2B49]">Document Verification</h1>
        </div>
        <p className="mt-1 text-sm text-[#64748b]">The backend compares the current signed PDF with its anchored hash and returns the verification verdict.</p>
      </header>

      {verifyQuery.isPending || verifyQuery.isFetching ? (
        <VerifySkeleton />
      ) : verifyQuery.isError ? (
        <div role="alert" className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-6">
          <p className="font-bold">{isNotFoundOrUnanchored ? 'Document not found or no on-chain record' : 'Verification request failed'}</p>
          <p className="text-sm text-[#64748b]">
            {isNotFoundOrUnanchored ? 'The backend could not find this document or it has not been anchored.' : verifyQuery.error instanceof Error ? verifyQuery.error.message : 'Verification could not be completed.'}
          </p>
          {!isNotFoundOrUnanchored && <button type="button" onClick={() => void verifyQuery.refetch()} className="rounded-full border border-[#0985E7] px-5 py-3 text-sm font-black text-[#0985E7]">
            Retry verification
          </button>}
        </div>
      ) : verifyQuery.data ? (
        <VerifyWorkspace result={verifyQuery.data} onRetry={() => void verifyQuery.refetch()} />
      ) : null}
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
        aria-label="Verifying document integrity"
        className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-[#F5FAFF]/60 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 rounded-full border border-[#D7E4F2] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(12,43,73,0.1)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D7E4F2] border-t-[#0985E7]" />
          <p className="text-sm font-black text-[#0C2B49]">
            Loading verification… checking the document against its on-chain record.
          </p>
        </div>
      </div>
    </div>
  );
}
