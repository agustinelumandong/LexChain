'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ApiSchema } from '@/shared/types/index';
import { getDocumentLifecycleLabel, getDocumentProcessingStatusLabel } from '@/features/documents/document-ui';
import { DocumentProcessingStatus } from '@/features/documents/components/document-processing-status';
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
      if (!['SIGNED', 'FINALIZED'].includes(query.state.data?.lifecycle?.trim().toUpperCase() ?? '')) return 2000;
      const currentStatus = query.state.data?.status?.trim().toLowerCase() ?? '';
      return DONE.has(currentStatus) || FAILED.has(currentStatus) || REVIEW_READY.has(currentStatus) ? false : 2000;
    },
  });

  const hasSignedCopy = ['SIGNED', 'FINALIZED'].includes(data?.lifecycle?.trim().toUpperCase() ?? '');
  const status = data?.status?.trim().toLowerCase() ?? 'processing';
  const done = hasSignedCopy && DONE.has(status);
  const reviewReady = hasSignedCopy && REVIEW_READY.has(status);
  const lookupError = isError && !!id;
  const failed = (hasSignedCopy && FAILED.has(status)) || !id;
  const normalizedStatus = getDocumentProcessingStatusLabel(data?.lifecycle ?? '', data?.status ?? (failed ? 'FAILED' : 'PROCESSING'));
  const processingTerminal = hasSignedCopy && (done || reviewReady || FAILED.has(status));
  const backToDocument = <Link href={`/portal/documents/${encodeURIComponent(id)}`} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Back to document</Link>;

  useEffect(() => {
    if (!id || !processingTerminal) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] }),
      queryClient.invalidateQueries({ queryKey: ['portal-search'] }),
    ]);
  }, [id, processingTerminal, queryClient]);

  if (isLoading && id) {
    return <DocumentProcessingStatus heading="Checking document status…" currentStatus="Checking status" description="Fetching the latest status from the document service.">{backToDocument}</DocumentProcessingStatus>;
  }

  if (data && !hasSignedCopy && !lookupError) {
    return (
      <DocumentProcessingStatus
        heading="Waiting for signed PDF"
        currentStatus={getDocumentLifecycleLabel(data.lifecycle)}
        description="Processing starts when a signed PDF is attached. This page will update as processing progresses."
      >{backToDocument}</DocumentProcessingStatus>
    );
  }

  if (hasSignedCopy && !done && !reviewReady && !lookupError && !failed) {
    return (
      <DocumentProcessingStatus
        heading="Processing your document…"
        currentStatus={normalizedStatus}
        description="This page will update as processing progresses."
      >{backToDocument}</DocumentProcessingStatus>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {data && <p className="text-sm text-[#5B6F8A]">Lifecycle: {getDocumentLifecycleLabel(data.lifecycle)}</p>}
      {reviewReady && !lookupError && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#166534' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Extracted text ready for review</p>
            <p className="mt-1 text-sm text-[#5B6F8A]">Review and approve the extracted text before processing continues.</p>
          </div>
          <Link href={`/portal/documents/${id}/review`} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white">Review extracted text</Link>
        </>
      )}
      {done && !lookupError && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#166534' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Document ready</p>
            <p className="mt-1 text-sm text-[#5B6F8A]">Processing is complete. Open the document to review the available details.</p>
          </div>
          <Link href={`/portal/documents/${id}`} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white">View document</Link>
        </>
      )}
      {lookupError && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Unable to check document status</p>
            <p className="mt-1 text-sm text-[#5B6F8A]">{error instanceof Error ? error.message : 'The document status lookup failed. Your document may still be processing.'}</p>
          </div>
          <button type="button" onClick={() => void refetch()} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white">Retry status check</button>
        </>
      )}
      {failed && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing failed</p>
            <p className="mt-1 text-sm text-[#5B6F8A]">
              {id ? 'Open the document to inspect its available details and retry processing if permitted.' : 'Missing document id.'}
            </p>
          </div>
          <Link href={id ? `/portal/documents/${id}` : '/portal/upload'} className="rounded-full bg-[#0067B3] px-6 py-3 text-sm font-black text-white">{id ? 'View document' : 'Try Again'}</Link>
        </>
      )}
    </div>
  );
}
