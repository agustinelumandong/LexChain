'use client';

import type { ApiSchema } from '@/shared/types/index';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';

type VerificationResult = ApiSchema<'DocumentVerificationResponse'>;

function statusHeading(result: VerificationResult) {
  if (result.status === 'AUTHENTIC') return result.is_authentic ? 'Document is authentic' : 'Integrity status unavailable';
  if (result.status === 'VERIFICATION_UNAVAILABLE' || (result.status === 'TAMPERED' && result.is_authentic)) return 'Integrity status unavailable';
  if (result.status === 'NOT_ANCHORED') return 'Document is not anchored';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'Trusted snapshot is compromised';
  if (result.status === 'TAMPERED') return 'Document was tampered with';
  return 'Document integrity requires attention';
}

function HashRow({ label, hash }: { label: string; hash: string }) {
  const [copied, setCopied] = useState(false);
  const shortened = hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;

  async function copyHash() {
    await navigator.clipboard?.writeText(hash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#64748b]">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs font-semibold text-[#0C2B49]" title={hash}>{shortened}</p>
      </div>
      <button type="button" onClick={() => void copyHash()} className="shrink-0 rounded-full border border-[#D7E4F2] bg-white px-3 py-1 text-[11px] font-black text-[#0985E7] transition hover:bg-[#EAF4FF]">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function VerifyWorkspace({ result, onRetry }: { result: VerificationResult; onRetry: () => void }) {
  const authentic = result.status === 'AUTHENTIC' && result.is_authentic;
  const contradictoryVerdict = (result.status === 'AUTHENTIC' && !result.is_authentic) || (result.status === 'TAMPERED' && result.is_authentic);
  const unavailable = result.status === 'VERIFICATION_UNAVAILABLE' || contradictoryVerdict;
  const notAnchored = result.status === 'NOT_ANCHORED';
  const compromised = result.status === 'SNAPSHOT_COMPROMISED';
  const neutral = unavailable || notAnchored || compromised;

  return <section className="flex flex-col gap-5 md:min-h-0 md:flex-1">
    <div className={`rounded-[18px] border p-5 ${authentic ? 'border-green-200 bg-green-50' : neutral ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        {authentic ? <CheckCircleIcon className="text-[#12A150]" sx={{ fontSize: 38 }} /> : neutral ? <InfoOutlinedIcon className="text-[#B77900]" sx={{ fontSize: 38 }} /> : <ErrorIcon className="text-[#D94B66]" sx={{ fontSize: 38 }} />}
        <div><h2 className={`text-xl font-extrabold ${authentic ? 'text-[#12A150]' : neutral ? 'text-[#B77900]' : 'text-[#D94B66]'}`}>{statusHeading(result)}</h2><p className="mt-1 text-sm text-[#475467]">{contradictoryVerdict ? 'The backend returned conflicting verification fields, so integrity could not be confirmed.' : result.message}</p></div>
      </div>
      {(unavailable || notAnchored) && <button type="button" onClick={onRetry} className="mt-4 rounded-full border border-[#0985E7] bg-white px-4 py-2 text-sm font-black text-[#0985E7]">Retry verification</button>}
    </div>

    <section aria-label="Verification result" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
      {result.file_name && <h3 className="font-bold text-[#0C2B49]">{result.file_name}</h3>}
      {result.storage_url && <a href={result.storage_url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-bold text-[#0985E7]">Open current PDF</a>}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-bold text-[#64748b]">Trusted baseline</dt><dd className="mt-1 text-[#0C2B49]">{result.baseline_trusted ? 'Trusted' : 'Not trusted'}</dd></div>
        {result.finalized_at && <div><dt className="font-bold text-[#64748b]">Finalized</dt><dd className="mt-1 text-[#0C2B49]">{result.finalized_at}</dd></div>}
        <div><dt className="font-bold text-[#64748b]">Verified</dt><dd className="mt-1 text-[#0C2B49]">{result.verified_at}</dd></div>
      </dl>
      <div className="grid gap-3 sm:grid-cols-2">
        {result.onchain_hash && <HashRow label="On-chain hash" hash={result.onchain_hash} />}
        {result.snapshot_hash && <HashRow label="Stored snapshot hash" hash={result.snapshot_hash} />}
        {result.current_hash && <HashRow label="Current document hash" hash={result.current_hash} />}
        {result.tx_hash && <HashRow label="Transaction hash" hash={result.tx_hash} />}
      </div>
    </section>
  </section>;
}
