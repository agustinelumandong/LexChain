'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { verifyRepositoryDocument } from '@/features/verification/integrity-api';
import { getIntegrityUiState } from '@/features/verification/integrity-ui';

export function DocumentIntegrityStatus({ documentId, mockMode }: { documentId: string; mockMode: boolean }) {
  const query = useQuery({
    queryKey: ['portal-doc-chain', documentId],
    queryFn: () => verifyRepositoryDocument(documentId),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
  const state = getIntegrityUiState({ record: query.data, requestFailed: query.isError });
  const isMatch = state === 'match';
  const isMismatch = state === 'mismatch';
  const noRecord = state === 'not_anchored' || state === 'not_recorded';
  const title = query.isFetching ? 'Checking document integrity…' : isMatch ? 'Integrity verified' : isMismatch ? 'Document integrity warning' : noRecord ? 'No integrity record' : 'Unable to check integrity';
  const description = query.isFetching ? 'Comparing the file with its recorded version.' : isMatch ? 'This file matches the recorded version.' : isMismatch ? 'This file differs from the recorded version. Contact your lawyer or the document owner before relying on it.' : noRecord ? 'This file cannot be compared with a recorded version yet.' : state === 'snapshot_compromised' ? 'The recorded reference could not be trusted, so the file could not be compared.' : 'The check could not be completed. Please try again.';
  const tone = query.isFetching ? 'border-[#0067B3] bg-[#F0F8FF] text-[#0067B3]' : isMatch ? 'border-[#0C7A3B] bg-[#F1FBF5] text-[#0C7A3B]' : 'border-[#9A5D00] bg-[#FFF8E8] text-[#9A5D00]';
  const checkedAt = query.data?.verified_at ? new Date(query.data.verified_at) : null;
  const Icon = query.isFetching ? InfoOutlinedIcon : isMatch ? CheckCircleOutlineIcon : WarningAmberOutlinedIcon;

  return <section aria-live="polite" aria-busy={query.isFetching} className={`flex flex-wrap items-start gap-3 rounded-[14px] border-2 px-4 py-3 ${tone}`}>
    <Icon aria-hidden="true" sx={{ fontSize: 20 }} className="mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1 basis-56 text-[#0C2B49]">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-5">{description}</p>
      {mockMode && <p className="mt-1 text-sm font-semibold">Demo result only; no real integrity check was performed.</p>}
      {!query.isFetching && checkedAt && !Number.isNaN(checkedAt.getTime()) && <p className="mt-1 text-xs">Checked {checkedAt.toLocaleString()}</p>}
    </div>
    {!query.isFetching && <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
      {state === 'unavailable' && <button type="button" onClick={() => void query.refetch()} className="min-h-11 rounded-full border border-current px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Try again</button>}
      <Link href={`/portal/documents/${encodeURIComponent(documentId)}/verify`} className="inline-flex min-h-11 items-center rounded-full border border-current px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">View verification details</Link>
    </div>}
  </section>;
}
