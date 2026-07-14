'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ApiSchema } from '@lexchain/types';
import { getDocumentStatusLabel } from '../../lib/document-ui';

type DocumentResponse = ApiSchema<'DocumentResponse'>;

const DONE = new Set(['anchored', 'completed', 'processed', 'failed', 'error']);

async function fetchDocument(id: string): Promise<DocumentResponse> {
  const res = await fetch(`/api/portal/proxy?path=${encodeURIComponent(`/documents/${id}`)}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Failed to load document status');
  return res.json();
}

export default function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const id = use(searchParams).id ?? '';

  const { data, isError } = useQuery({
    queryKey: ['portal-doc-status', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
    refetchInterval: (query) => (DONE.has(query.state.data?.status?.toLowerCase() ?? '') ? false : 2000),
  });

  const status = data?.status?.toLowerCase() ?? 'processing';
  const done = DONE.has(status);
  const failed = isError || status === 'failed' || status === 'error' || !id;
  const normalizedStatus = getDocumentStatusLabel(data?.status ?? (failed ? 'FAILED' : 'PROCESSING'));

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {!done && !failed && (
        <>
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#0985E7] border-t-transparent" />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing your document...</p>
            <p className="mt-1 text-sm text-[#64748b]">Current status: {normalizedStatus}</p>
            <p className="mt-3 text-sm text-[#64748b]">LexChain is scanning the upload, drafting a summary, and preparing integrity checks.</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8F0F8]"><div className="h-full w-2/3 rounded-full bg-[#0985E7]" /></div>
            <p className="mt-2 text-xs font-bold text-[#64748b]">Your summary will appear here when processing is complete.</p>
          </div>
        </>
      )}
      {done && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#12A150' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Document ready</p>
            <p className="mt-1 text-sm text-[#64748b]">Your document summary is ready.</p>
          </div>
          <Link href={`/portal/documents/${id}`} className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">View document</Link>
        </>
      )}
      {failed && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: '#ef4444' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing failed</p>
            <p className="mt-1 text-sm text-[#64748b]">
              {id ? 'Please try uploading again.' : 'Missing document id.'}
            </p>
          </div>
          <Link href="/portal/upload" className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white">Try Again</Link>
        </>
      )}
    </div>
  );
}
