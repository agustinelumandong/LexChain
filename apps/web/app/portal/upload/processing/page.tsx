'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ApiSchema } from '@lexchain/types';

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
  const router = useRouter();
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

  useEffect(() => {
    if (done && !failed && id) {
      const timer = setTimeout(() => router.push(`/portal/documents/${id}`), 1500);
      return () => clearTimeout(timer);
    }
  }, [done, failed, id, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {!done && !failed && (
        <>
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#0985E7] border-t-transparent" />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Processing your document...</p>
            <p className="mt-1 text-sm text-[#64748b]">Current status: {status}</p>
          </div>
        </>
      )}
      {done && !failed && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#12A150' }} />
          <div>
            <p className="text-xl font-black text-[#0C2B49]">Document ready</p>
            <p className="mt-1 text-sm text-[#64748b]">Redirecting to your document...</p>
          </div>
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
          <button
            onClick={() => router.push('/portal/upload')}
            className="rounded-full bg-[#0985E7] px-6 py-3 text-sm font-black text-white"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
