'use client';

import type { ApiSchema } from '@/shared/types/index';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { toast } from 'sonner';
import { getBaseSepoliaTransactionUrl } from '@/features/verification/integrity-ui';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { isMockMode } from '@/lib/mocks/mode';
import { signedCopyFileUrl } from '@/features/documents/document-lifecycle-api';

const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p>Loading PDF preview…</p>,
});

type VerificationResult = ApiSchema<'DocumentVerificationResponse'>;

function statusHeading(result: VerificationResult) {
  if (result.status === 'AUTHENTIC') return result.is_authentic ? 'This PDF matches the saved version' : 'We could not check this document';
  if (result.status === 'VERIFICATION_UNAVAILABLE' || (result.status === 'TAMPERED' && result.is_authentic)) return 'We could not check this document';
  if (result.status === 'NOT_ANCHORED') return 'No blockchain record is saved';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'The saved reference needs attention';
  if (result.status === 'TAMPERED') return 'This PDF differs from the saved version';
  return 'We could not check this document';
}

function HashRow({ label, hash, transactionUrl }: { label: string; hash: string; transactionUrl?: string | null }) {
  const shortened = hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;

  async function copyHash() {
    if (!navigator.clipboard?.writeText) {
      toast.error(`Could not copy ${label.toLowerCase()}. Try again.`, { duration: Infinity });
      return;
    }
    try {
      await navigator.clipboard.writeText(hash);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}. Try again.`, { duration: Infinity });
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#64748b]">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs font-semibold text-[#0C2B49]" title={hash}>{shortened}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {transactionUrl && <a href={transactionUrl} target="_blank" rel="noreferrer" aria-label="View transaction on Base Sepolia" className="text-[11px] font-black text-[#0985E7]">Base Sepolia</a>}
        <button type="button" aria-label={`Copy ${label}`} onClick={() => void copyHash()} className="rounded-full border border-[#D7E4F2] bg-white px-3 py-1 text-[11px] font-black text-[#0985E7] transition hover:bg-[#EAF4FF]">
        Copy
        </button>
      </div>
    </div>
  );
}

function VerificationDetails({ result }: { result: VerificationResult }) {
  const simulated = isMockMode();
  const simulatedAnchorConfirmed = simulated
    && result.status === 'TAMPERED'
    && result.baseline_trusted
    && Boolean(result.onchain_hash);

  return (
    <section aria-label="Verification result" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
      {result.file_name && <h3 className="font-bold text-[#0C2B49]">{result.file_name}</h3>}
      {simulated && <p role="note" className="text-sm font-semibold text-[#8A5B00]">Mock verification is simulated and does not represent a real backend or blockchain verification.</p>}
      {result.status !== 'NOT_ANCHORED' && <a href={signedCopyFileUrl(result.document_id, { filename: result.file_name ?? undefined })} target="_blank" rel="noreferrer" className="inline-flex text-sm font-bold text-[#0985E7]">Open current PDF</a>}
      {simulatedAnchorConfirmed && (
        <div role="status" aria-label="Simulated blockchain anchor status" className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-extrabold text-green-800">Blockchain baseline confirmed <span className="font-semibold">(simulated)</span></p>
          <p className="mt-1 text-xs text-green-800">The stored baseline matches the chain hash; the current PDF does not.</p>
        </div>
      )}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-bold text-[#64748b]">Trusted baseline</dt><dd className="mt-1 text-[#0C2B49]">{result.baseline_trusted ? 'Trusted' : 'Not trusted'}</dd></div>
        {result.finalized_at && <div><dt className="font-bold text-[#64748b]">Finalized</dt><dd className="mt-1 text-[#0C2B49]">{result.finalized_at}</dd></div>}
        <div><dt className="font-bold text-[#64748b]">Verified</dt><dd className="mt-1 text-[#0C2B49]">{result.verified_at}</dd></div>
      </dl>
      <div className="grid gap-3 sm:grid-cols-2">
        {result.onchain_hash && <HashRow label="On-chain hash" hash={result.onchain_hash} />}
        {result.snapshot_hash && <HashRow label="Stored snapshot hash" hash={result.snapshot_hash} />}
        {result.current_hash && <HashRow label="Current document hash" hash={result.current_hash} />}
        {result.tx_hash && <HashRow label="Transaction hash" hash={result.tx_hash} transactionUrl={getBaseSepoliaTransactionUrl(result.tx_hash)} />}
      </div>
    </section>
  );
}

export default function VerifyWorkspace({ result, onRetry }: { result: VerificationResult; onRetry: () => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const authentic = result.status === 'AUTHENTIC' && result.is_authentic;
  const contradictoryVerdict = (result.status === 'AUTHENTIC' && !result.is_authentic) || (result.status === 'TAMPERED' && result.is_authentic);
  const unavailable = result.status === 'VERIFICATION_UNAVAILABLE' || contradictoryVerdict;
  const notAnchored = result.status === 'NOT_ANCHORED';
  const compromised = result.status === 'SNAPSHOT_COMPROMISED';
  const neutral = unavailable || notAnchored || compromised;
  const tamperReport = result.status === 'TAMPERED'
    && !result.is_authentic
    && result.baseline_trusted
    && result.tamper_report_status === 'AVAILABLE'
    ? result.tamper_report
    : null;
  const tamperedSegments = tamperReport?.segments ?? [];
  const currentPdfSegments = tamperedSegments
    .filter((segment) => segment.location === 'current')
    .map((segment, index): ApiSchema<'ExtractionBlock'> => ({
      index: segment.block_index ?? -(index + 1),
      editable: false,
      type: 'text',
      text: segment.current_text,
      original_text: segment.original_text,
      bbox: segment.bbox ?? null,
      page_idx: segment.page_idx ?? null,
      text_level: null,
      score: null,
      is_html: false,
      edited: false,
    }));
  const showTamperComparison = result.status === 'TAMPERED'
    && !result.is_authentic
    && result.baseline_trusted;

  return <section className="flex flex-col gap-5 md:min-h-0 md:flex-1">
    <div className={`rounded-[18px] border p-5 ${authentic ? 'border-green-200 bg-green-50' : neutral ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        {authentic ? <CheckCircleIcon className="text-[#12A150]" sx={{ fontSize: 38 }} /> : neutral ? <InfoOutlinedIcon className="text-[#B77900]" sx={{ fontSize: 38 }} /> : <ErrorIcon className="text-[#D94B66]" sx={{ fontSize: 38 }} />}
        <div><h2 className={`text-xl font-extrabold ${authentic ? 'text-[#12A150]' : neutral ? 'text-[#B77900]' : 'text-[#D94B66]'}`}>{statusHeading(result)}</h2><p className="mt-1 text-sm text-[#475467]">{contradictoryVerdict ? 'The backend returned conflicting verification fields, so integrity could not be confirmed.' : result.message}</p></div>
      </div>
      {(unavailable || notAnchored) && <button type="button" onClick={onRetry} className="mt-4 rounded-full border border-[#0985E7] bg-white px-4 py-2 text-sm font-black text-[#0985E7]">Try again</button>}
    </div>

    {showTamperComparison ? (
      <div className="grid min-w-0 gap-5 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.9fr)]">
        <section aria-label="Current document" className="flex min-h-[30rem] min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white p-4 md:min-h-0">
          <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-[#0C2B49]">Current PDF</h3>
              <p className="mt-1 text-xs text-[#64748b]">Review the current document beside its trusted baseline comparison.</p>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">
            <PdfDocumentViewer
              sourceUrl={signedCopyFileUrl(result.document_id, { filename: result.file_name ?? undefined })}
              currentPage={currentPage}
              blocks={currentPdfSegments}
              selectedBlockIndex={null}
              hoveredBlockIndex={null}
              tamperedBlockIndexes={new Set(currentPdfSegments.map((segment) => segment.index))}
              onPageChange={setCurrentPage}
              onSelectBlock={() => undefined}
              onHoverBlockChange={() => undefined}
            />
          </div>
        </section>
        <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-auto">
          <section aria-label="Changed content" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
            {tamperedSegments.length > 0 ? (
              <>
                <div>
                  <h3 className="font-extrabold text-[#0C2B49]">Changed content</h3>
                  <p className="mt-1 text-sm text-[#64748b]">{tamperReport?.total_changes ?? 0} {tamperReport?.total_changes === 1 ? 'change' : 'changes'} returned.</p>
                  {tamperReport?.truncated && <p role="note" className="mt-1 text-sm text-[#8A5B00]">Additional changes were found. Only the listed segments are shown here.</p>}
                </div>
                {tamperedSegments.map((segment, index) => (
                  <dl key={index} className="grid gap-3 text-sm">
                    <div>
                      <dt className="font-bold capitalize text-[#0C2B49]">{segment.type} · {segment.severity}</dt>
                      <dd className="mt-1 text-sm text-[#64748b]">{segment.reason}</dd>
                    </div>
                    <div className="rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-3">
                      <dt className="font-bold text-[#64748b]">Anchored version</dt>
                      <dd className="mt-1 font-semibold text-[#0C2B49]">{segment.original_text || (segment.type === 'insert' ? 'Not present in the anchored version' : 'Not provided')}</dd>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <dt className="font-bold text-[#D94B66]">Current PDF</dt>
                      <dd className="mt-1 font-semibold text-[#0C2B49]">{segment.current_text || (segment.type === 'delete' ? 'Removed from the current PDF' : 'Not provided')}</dd>
                    </div>
                    <div><dt className="font-bold text-[#64748b]">Location</dt><dd className="mt-1 text-[#0C2B49]">{segment.location === 'current' ? 'Current PDF' : 'Anchored version'}{segment.page_idx == null ? ' · text only' : ` · page ${segment.page_idx + 1}`}</dd></div>
                  </dl>
                ))}
              </>
            ) : (
              <div role="status" aria-label="Comparison details unavailable" className="rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-4">
                <h3 className="font-extrabold text-[#0C2B49]">Detailed comparison unavailable</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748b]">
                  {result.tamper_report_status === 'UNAVAILABLE'
                    ? result.tamper_report_unavailable_reason || 'The tampered verdict still stands, but a trustworthy text comparison could not be produced.'
                    : result.tamper_report_status === 'NOT_APPLICABLE'
                      ? 'No text comparison applies to this verification response.'
                      : 'This verification response includes the verdict and file hashes, but no extracted-text differences or baseline PDF.'}
                </p>
              </div>
            )}
          </section>
          <VerificationDetails result={result} />
        </div>
      </div>
    ) : <VerificationDetails result={result} />}
  </section>;
}
