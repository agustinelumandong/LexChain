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
    queryKey: ['portal-doc-chain', documentId, 'quick'],
    queryFn: () => verifyRepositoryDocument(documentId, false),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
  const state = getIntegrityUiState({ record: query.data, requestFailed: query.isError });
  const record = query.data;
  const hashesConflict = Boolean(record?.onchain_hash && ((record.current_hash && record.onchain_hash.replace(/^0x/i, '').toLowerCase() !== record.current_hash.replace(/^0x/i, '').toLowerCase()) || (record.baseline_trusted && record.snapshot_hash && record.onchain_hash.replace(/^0x/i, '').toLowerCase() !== record.snapshot_hash.replace(/^0x/i, '').toLowerCase())));
  const pdfMatches = state === 'match' && !hashesConflict;
  const recordChanged = record?.metadata_status === 'ALTERED';
  const recordUnavailable = record?.metadata_status !== 'MATCH' && !recordChanged;
  const needsAttention = record?.needs_restore === true;
  const isMatch = pdfMatches && record?.metadata_status === 'MATCH' && record.needs_restore === false;
  const isMismatch = state === 'mismatch' || state === 'file_missing' || state === 'match_untrusted_snapshot';
  const noRecord = state === 'not_anchored' || state === 'not_recorded';
  const title = query.isFetching ? 'Checking document integrity…' : isMatch ? 'PDF and document details unchanged' : pdfMatches ? 'PDF unchanged' : isMismatch ? 'Document integrity warning' : noRecord ? 'No integrity record' : 'Unable to check integrity';
  const description = query.isFetching ? 'Comparing the file with its recorded version.' : pdfMatches ? 'This file matches the recorded version.' : state === 'file_missing' ? 'The stored document file is missing. Contact your lawyer or the document owner.' : state === 'match_untrusted_snapshot' ? 'The file matches the blockchain record, but its saved reference is not trusted.' : isMismatch ? 'This file differs from the recorded version. Contact your lawyer or the document owner before relying on it.' : noRecord ? 'This file cannot be compared with a recorded version yet.' : state === 'snapshot_compromised' ? 'The file differs from the blockchain record or is missing, and its saved reference is compromised.' : 'The check could not be completed. Please try again.';
  const tone = query.isFetching ? 'border-[#0067B3] bg-[#F0F8FF] text-[#0067B3]' : recordChanged || state === 'mismatch' || state === 'file_missing' ? 'border-red-700 bg-red-50 text-red-700' : isMatch ? 'border-[#0C7A3B] bg-[#F1FBF5] text-[#0C7A3B]' : 'border-[#9A5D00] bg-[#FFF8E8] text-[#9A5D00]';
  const checkedAt = query.data?.verified_at ? new Date(query.data.verified_at) : null;
  const Icon = query.isFetching ? InfoOutlinedIcon : pdfMatches ? CheckCircleOutlineIcon : WarningAmberOutlinedIcon;

  return <section aria-live="polite" aria-busy={query.isFetching} className={`rounded-[14px] border-2 px-4 py-3 ${tone}`}>
    <div className="flex flex-wrap items-start gap-3">
    <Icon aria-hidden="true" sx={{ fontSize: 20 }} className={`mt-0.5 shrink-0 ${pdfMatches && !query.isFetching ? 'text-[#0C7A3B]' : ''}`} />
    <div className="min-w-0 flex-1 basis-56 text-[#0C2B49]">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-5">{description}</p>
      {!query.isFetching && pdfMatches && !recordChanged && recordUnavailable && <p className="mt-2 text-sm font-bold">{record?.metadata_status === 'NOT_ANCHORED' ? 'No saved document details.' : 'Document details could not be checked.'}</p>}
      {!query.isFetching && pdfMatches && !recordChanged && needsAttention && <p className="mt-2 text-sm font-bold">A record needs attention.</p>}
      {!query.isFetching && pdfMatches && !recordChanged && record?.metadata_status === 'MATCH' && record.needs_restore == null && <p className="mt-2 text-sm font-bold">Repair status could not be checked.</p>}
      {mockMode && <p className="mt-1 text-sm font-semibold">Demo result only; no real integrity check was performed.</p>}
      {!query.isFetching && checkedAt && !Number.isNaN(checkedAt.getTime()) && <p className="mt-1 text-xs">Checked {checkedAt.toLocaleString()}</p>}
    </div>
    {!query.isFetching && <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
      {state === 'unavailable' && <button type="button" onClick={() => void query.refetch()} className="min-h-11 rounded-full border border-current px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Try again</button>}
      <Link href={`/portal/documents/${encodeURIComponent(documentId)}/verify`} className="inline-flex min-h-11 items-center rounded-full border border-current px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">View verification details</Link>
    </div>}
    </div>
    {!query.isFetching && recordChanged && <div className="mt-3 flex items-start gap-3 border-t border-[#D7E4F2] pt-3 text-sm text-[#0C2B49]">
      <WarningAmberOutlinedIcon aria-hidden="true" sx={{ fontSize: 20 }} className="shrink-0 text-[#9A5D00]" />
      <div className="min-w-0">
        <p className="font-bold">{record.metadata_changes?.length === 1 && record.metadata_changes[0].field === 'file_name' ? 'File name changed' : 'Document details changed'}</p>
        {record.metadata_changes?.map((change, index) => <dl key={`${change.field}-${index}`} className="mt-2 break-words">
          <dt className={record.metadata_changes?.length === 1 && change.field === 'file_name' ? 'sr-only' : 'font-semibold'}>{change.field.replaceAll('_', ' ')}</dt>
          <dd>At finalization: <span className="font-semibold">{change.anchored ?? 'Not available'}</span></dd>
          <dd>Current: <span className="font-semibold">{change.current === null ? 'None' : change.current ?? 'Not available'}</span></dd>
        </dl>)}
      </div>
    </div>}
  </section>;
}
