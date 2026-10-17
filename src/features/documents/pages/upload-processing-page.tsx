'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ApiSchema } from '@/shared/types/index';
import { getDocumentLifecycleLabel, getDocumentProcessingStatusLabel } from '@/features/documents/document-ui';
import { portalRequest } from '@/shared/api/client';

type DocumentResponse = ApiSchema<'DocumentResponse'>;

const DONE = new Set(['anchored', 'completed', 'processed']);
const FAILED = new Set(['failed', 'error']);
const REVIEW_READY = new Set(['awaiting_review', 'ready_for_review']);

async function fetchDocument(id: string): Promise<DocumentResponse> {
  const res = await portalRequest(`/api/portal/proxy?path=${encodeURIComponent(`/documents/${id}`)}`);
  return res.json();
}

export default function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const id = use(searchParams).id ?? '';
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['portal-doc-status', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
    refetchInterval: (query) => {
      if (query.state.data?.lifecycle !== 'FINALIZED') return 2000;
      const currentStatus = query.state.data?.status?.trim().toLowerCase() ?? '';
      return DONE.has(currentStatus) || FAILED.has(currentStatus) || REVIEW_READY.has(currentStatus) ? false : 2000;
    },
  });

  const isFinalized = data?.lifecycle === 'FINALIZED';
  const status = data?.status?.trim().toLowerCase() ?? 'processing';
  const done = isFinalized && DONE.has(status);
  const reviewReady = isFinalized && REVIEW_READY.has(status);
  const lookupError = isError && !!id;
  const failed = (isFinalized && FAILED.has(status)) || !id;
  const normalizedStatus = getDocumentProcessingStatusLabel(data?.lifecycle ?? '', data?.status ?? (failed ? 'FAILED' : 'PROCESSING'));
  const processingTerminal = isFinalized && (done || reviewReady || FAILED.has(status));

  useEffect(() => {
    if (!id || !processingTerminal) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      queryClient.invalidateQueries({ queryKey: ['portal-search'] }),
    ]);
  }, [id, processingTerminal, queryClient]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {isLoading && <p role="status" className="text-sm font-bold text-[#64748b]">Loading document…</p>}
      {data && <p className="text-sm font-bold text-[#64748b]">Lifecycle: {getDocumentLifecycleLabel(data.lifecycle)}</p>}
      {data && !isFinalized && !lookupError && (
        <div>
          <p className="text-xl font-black text-[#0C2B49]">Waiting for finalization</p>
          <p className="mt-1 text-sm text-[#64748b]">OCR processing starts after the document is finalized.</p>
        </div>
      )}
      {isFinalized && !done && !reviewReady && !lookupError && !failed && (
        <>
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#0985E7] border-t-transparent" />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing your document...</p>
            <p className="mt-1 text-sm text-[#64748b]">Current status: {normalizedStatus}</p>
            <p className="mt-3 text-sm text-[#64748b]">This page will update when the document reaches its next backend state.</p>
          </div>
        </>
      )}
      {reviewReady && !lookupError && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#12A150' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Extracted text ready for review</p>
            <p className="mt-1 text-sm text-[#64748b]">Review and approve the extracted text before processing continues.</p>
          </div>
          <Link href={`/portal/documents/${id}/review`} className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">Review extracted text</Link>
        </>
      )}
      {done && !lookupError && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#12A150' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Document ready</p>
            <p className="mt-1 text-sm text-[#64748b]">Processing is complete. Open the document to review the available details.</p>
          </div>
          <Link href={`/portal/documents/${id}`} className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">View document</Link>
        </>
      )}
      {lookupError && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Unable to check document status</p>
            <p className="mt-1 text-sm text-[#64748b]">{error instanceof Error ? error.message : 'The document status lookup failed. Your document may still be processing.'}</p>
          </div>
          <button type="button" onClick={() => void refetch()} className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">Retry status check</button>
        </>
      )}
      {failed && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing failed</p>
            <p className="mt-1 text-sm text-[#64748b]">
              {id ? 'The document is finalized, but processing failed. Open the document to inspect its available details.' : 'Missing document id.'}
            </p>
          </div>
          <Link href={id ? `/portal/documents/${id}` : '/portal/upload'} className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">{id ? 'View document' : 'Try Again'}</Link>
        </>
      )}
    </div>
  );
}
