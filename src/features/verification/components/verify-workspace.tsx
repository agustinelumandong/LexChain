'use client';

import type { ApiSchema } from '@/shared/types/index';
import type { PortalUiRole } from '@/features/access';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
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
  if (result.status === 'AUTHENTIC') return result.is_authentic ? (result.baseline_trusted ? 'PDF unchanged' : 'This PDF matches, but the saved reference needs attention') : 'We could not check this document';
  if (result.status === 'FILE_MISSING') return result.is_authentic ? 'We could not check this document' : 'The document file is missing';
  if (result.status === 'VERIFICATION_UNAVAILABLE' || (result.status === 'TAMPERED' && result.is_authentic)) return 'We could not check this document';
  if (result.status === 'NOT_ANCHORED') return 'No blockchain record is saved';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'The saved reference needs attention';
  if (result.status === 'TAMPERED') return 'This PDF differs from the saved version';
  return 'We could not check this document';
}

function HashRow({ label, hash }: { label: string; hash: string }) {
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
        <p className="text-[11px] font-black uppercase tracking-wide text-[#5B6F8A]">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs font-semibold text-[#0C2B49]" title={hash}>{shortened}</p>
      </div>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => void copyHash()}
        className="shrink-0 rounded-full border border-[#D7E4F2] bg-white px-3 py-1 text-[11px] font-black text-[#0067B3] transition hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
      >
        Copy
      </button>
    </div>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function plainLanguageExplanation(result: VerificationResult, contradictoryVerdict: boolean): string {
  if (contradictoryVerdict) {
    return 'The backend returned conflicting verification fields, so integrity could not be confirmed.';
  }
  if (result.status === 'AUTHENTIC' && result.is_authentic && !result.baseline_trusted) {
    return 'The current PDF matches the blockchain record, but the stored snapshot is not trusted and still needs attention.';
  }
  if (result.status === 'FILE_MISSING' && !result.is_authentic) {
    return 'The stored document file was deleted and is no longer available for comparison.';
  }
  if (result.status === 'AUTHENTIC' && result.is_authentic) {
    return 'Its fingerprint matches the blockchain record.';
  }
  if (result.status === 'TAMPERED' && !result.is_authentic) {
    return 'This PDF file differs from the cryptographic fingerprint recorded on the blockchain. Changes have been detected in the current copy.';
  }
  if (result.status === 'SNAPSHOT_COMPROMISED') {
    return 'The current file differs from the blockchain record or is missing, and the stored reference is compromised. A detailed comparison is unavailable.';
  }
  if (result.status === 'NOT_ANCHORED') {
    return 'This document has not been anchored on the blockchain. Finalize the document first to record its fingerprint.';
  }
  if (result.status === 'VERIFICATION_UNAVAILABLE') {
    return 'The document or blockchain record could not be evaluated at this time. This is not a tampering result. Please try again.';
  }
  return result.message || 'We could not evaluate this document.';
}

function VerificationDetails({
  result,
  hideFileName = false,
  authentic = false,
}: {
  result: VerificationResult;
  hideFileName?: boolean;
  authentic?: boolean;
}) {
  const simulated = isMockMode();
  const simulatedAnchorConfirmed = simulated
    && result.status === 'TAMPERED'
    && result.baseline_trusted
    && Boolean(result.onchain_hash);

  return (
    <section aria-label="Verification result" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
      {!hideFileName && result.file_name && <h3 className="font-bold text-[#0C2B49]">{result.file_name}</h3>}
      {simulated && <p role="note" className="text-sm font-semibold text-[#8A5B00]">Mock verification is simulated and does not represent a real backend or blockchain verification.</p>}
      {simulatedAnchorConfirmed && (
        <div role="status" aria-label="Simulated blockchain anchor status" className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-extrabold text-green-800">Blockchain baseline confirmed <span className="font-semibold">(simulated)</span></p>
          <p className="mt-1 text-xs text-green-800">The stored baseline matches the chain hash; the current PDF does not.</p>
        </div>
      )}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-bold text-[#5B6F8A]">Trusted baseline</dt><dd className="mt-1 text-[#0C2B49]">{result.baseline_trusted ? 'Trusted' : 'Not trusted'}</dd></div>
        {result.finalized_at && (
          <div>
            <dt className="font-bold text-[#5B6F8A]">Finalized</dt>
            <dd className="mt-1 text-[#0C2B49]">
              <time dateTime={result.finalized_at}>{formatDateTime(result.finalized_at)}</time>
            </dd>
          </div>
        )}
        <div>
          <dt className="font-bold text-[#5B6F8A]">Verified</dt>
          <dd className="mt-1 text-[#0C2B49]">
            <time dateTime={result.verified_at}>{formatDateTime(result.verified_at)}</time>
          </dd>
        </div>
      </dl>
      {authentic && result.baseline_trusted && result.onchain_hash && result.snapshot_hash && result.current_hash && (
        <div role="status" aria-label="Cryptographic hash match" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-800">
          <CheckCircleIcon sx={{ fontSize: 16 }} className="text-green-600" aria-hidden="true" />
          <span>All 3 cryptographic fingerprints match</span>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {result.onchain_hash && <HashRow label="On-chain hash" hash={result.onchain_hash} />}
        {result.snapshot_hash && <HashRow label="Stored snapshot hash" hash={result.snapshot_hash} />}
        {result.current_hash && <HashRow label="Current document hash" hash={result.current_hash} />}
        {result.tx_hash && <HashRow label="Transaction hash" hash={result.tx_hash} />}
      </div>
      {result.tx_hash && getBaseSepoliaTransactionUrl(result.tx_hash) && (
        <a
          href={getBaseSepoliaTransactionUrl(result.tx_hash)!}
          target="_blank"
          rel="noreferrer"
          aria-label="View transaction on Base Sepolia"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0067B3] py-2.5 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#00528F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
        >
          <span>View transaction on Base Sepolia</span>
          <LaunchIcon sx={{ fontSize: 14 }} aria-hidden="true" />
        </a>
      )}
      <aside aria-label="Legal validity notice" className="flex items-start gap-2.5 rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-3.5 text-xs leading-5 text-[#4B6382]">
        <InfoOutlinedIcon sx={{ fontSize: 18 }} className="mt-0.5 shrink-0 text-[#0067B3]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-bold text-[#0C2B49]">File integrity only</p>
          <p className="mt-0.5">
            A cryptographic match confirms that this PDF file has not changed since its fingerprint was saved to the blockchain. A match alone does not prove legal validity, notarization, authority, or contract enforceability.
          </p>
        </div>
      </aside>
    </section>
  );
}

export default function VerifyWorkspace({
  result,
  onRetry,
  role = 'user',
}: {
  result: VerificationResult;
  onRetry: () => void;
  role?: PortalUiRole;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const normalizeHash = (hash: string) => hash.toLowerCase().replace(/^0x/, '');
  const hashesConflict = result.status === 'AUTHENTIC' && result.is_authentic && Boolean(
    (result.onchain_hash && result.current_hash && normalizeHash(result.onchain_hash) !== normalizeHash(result.current_hash))
    || (result.baseline_trusted && result.onchain_hash && result.snapshot_hash && normalizeHash(result.onchain_hash) !== normalizeHash(result.snapshot_hash)),
  );
  const authentic = result.status === 'AUTHENTIC' && result.is_authentic && !hashesConflict;
  const untrustedSnapshot = authentic && !result.baseline_trusted;
  const contradictoryVerdict = hashesConflict || (result.status === 'AUTHENTIC' && !result.is_authentic) || ((result.status === 'TAMPERED' || result.status === 'FILE_MISSING') && result.is_authentic);
  const unavailable = result.status === 'VERIFICATION_UNAVAILABLE' || contradictoryVerdict;
  const notAnchored = result.status === 'NOT_ANCHORED';
  const compromised = result.status === 'SNAPSHOT_COMPROMISED';
  const neutral = unavailable || notAnchored || compromised || untrustedSnapshot;
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
  const showPdfWorkspace = authentic || showTamperComparison;
  const fileNameChanged = result.metadata_status === 'ALTERED' && result.metadata_changes?.length === 1 && result.metadata_changes[0].field === 'file_name';

  return <section className="flex flex-col gap-5 md:min-h-0 md:flex-1">
    <section aria-label="Verification results" className={`flex flex-wrap items-start gap-3 rounded-xl border-2 p-4 ${result.metadata_status === 'ALTERED' || (!authentic && !neutral) ? 'border-red-700 bg-red-50' : neutral || result.metadata_status !== 'MATCH' ? 'border-amber-700 bg-amber-50' : 'border-green-700 bg-green-50'}`}>
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {authentic && !untrustedSnapshot ? <CheckCircleIcon className="mt-0.5 shrink-0 text-[#166534]" sx={{ fontSize: 20 }} aria-hidden="true" /> : neutral ? <InfoOutlinedIcon className="mt-0.5 shrink-0 text-[#8A5B00]" sx={{ fontSize: 20 }} aria-hidden="true" /> : <ErrorOutlineIcon className="mt-0.5 shrink-0 text-[#B42318]" sx={{ fontSize: 20 }} aria-hidden="true" />}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#0C2B49]">
            {contradictoryVerdict ? 'We could not check this document' : statusHeading(result)}
          </h2>
          <p className="text-sm leading-5 text-[#344054]">
            {plainLanguageExplanation(result, contradictoryVerdict)}
          </p>
          {role === 'user' && !authentic && !unavailable && (
            <p className="mt-1 text-sm text-[#475467]">
              Contact your lawyer or the document owner if you have questions regarding this document&apos;s integrity.
            </p>
          )}
        </div>
      </div>
      {(unavailable || notAnchored) && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0067B3] bg-white px-5 py-2 text-sm font-bold text-[#0067B3] hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Try again</button>}
    <section aria-label="Document record integrity" className="basis-full border-t border-[#B9D6ED] pt-3">
      <div className="flex items-start gap-2">
      {result.metadata_status === 'MATCH' ? <CheckCircleIcon className="mt-0.5 shrink-0 text-[#166534]" sx={{ fontSize: 20 }} aria-hidden="true" /> : <InfoOutlinedIcon className="mt-0.5 shrink-0 text-[#8A5B00]" sx={{ fontSize: 20 }} aria-hidden="true" />}
      <div className="min-w-0 flex-1">
      <h3 className="text-base font-bold text-[#0C2B49]">
        {result.metadata_status === 'MATCH' ? 'Document details unchanged' : result.metadata_status === 'ALTERED' ? fileNameChanged ? 'File name changed' : 'Document details changed' : result.metadata_status === 'NOT_ANCHORED' ? 'No saved document details' : 'Document details could not be checked'}
      </h3>
      {result.metadata_status !== 'MATCH' && result.metadata_status !== 'ALTERED' && result.metadata_status !== 'NOT_ANCHORED' && <p className="mt-1 text-sm text-[#344054]">This does not mean the record was changed.</p>}
      {result.metadata_status === 'ALTERED' && result.metadata_changes && result.metadata_changes.length > 0 && (
        <dl className="mt-3 space-y-3 text-sm">
          {result.metadata_changes.map((change, index) => (
            <div key={`${change.field}-${index}`}>
              <dt className={fileNameChanged ? 'sr-only' : 'font-bold text-[#0C2B49]'}>{change.field.replaceAll('_', ' ')}</dt>
              <dd className="mt-1 text-[#344054]"><span>At finalization:</span> <span className="font-semibold">{change.anchored ?? 'Not available'}</span></dd>
              <dd className="text-[#344054]">Current: <span className="font-semibold">{change.current === null ? 'None' : change.current ?? 'Not available'}</span></dd>
            </div>
          ))}
        </dl>
      )}
      </div>
      </div>
    </section>
    </section>

    {showPdfWorkspace ? (
      <div className="grid min-w-0 gap-5 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.9fr)]">
        <section aria-label="Current document" className="flex min-h-[30rem] min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white p-4 md:min-h-0">
          <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-[#0C2B49]">Current PDF</h3>
              <p className="mt-1 text-xs text-[#5B6F8A]">
                {authentic
                  ? (result.file_name ? `${result.file_name} · Verified authentic document.` : 'Verified authentic document.')
                  : tamperedSegments.length > 0
                    ? 'Review the current document beside its trusted baseline comparison.'
                    : 'Review the current document alongside verification details.'}
              </p>
            </div>
            <a
              href={signedCopyFileUrl(result.document_id, {
                filename: result.file_name ?? undefined,
                download: true,
              })}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D7E4F2] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0067B3] transition hover:bg-[#F1F7FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
            >
              <DownloadOutlinedIcon sx={{ fontSize: 16 }} aria-hidden="true" />
              Download PDF
            </a>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
          {showTamperComparison && (
            <section aria-label="Changed content" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
              {tamperedSegments.length > 0 ? (
                <>
                  <div>
                    <h3 className="font-extrabold text-[#0C2B49]">Changed content</h3>
                    <p className="mt-1 text-sm text-[#5B6F8A]">{tamperReport?.total_changes ?? 0} {tamperReport?.total_changes === 1 ? 'change' : 'changes'} returned.</p>
                    {tamperReport?.truncated && <p role="note" className="mt-1 text-sm text-[#8A5B00]">Additional changes were found. Only the listed segments are shown here.</p>}
                  </div>
                  {tamperedSegments.map((segment, index) => (
                    <dl key={index} className="grid gap-3 text-sm">
                      <div>
                        <dt className="font-bold capitalize text-[#0C2B49]">{segment.type} · {segment.severity}</dt>
                        <dd className="mt-1 text-sm text-[#5B6F8A]">{segment.reason}</dd>
                      </div>
                      <div className="rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-3">
                        <dt className="font-bold text-[#5B6F8A]">Anchored version</dt>
                        <dd className="mt-1 font-semibold text-[#0C2B49]">{segment.original_text || (segment.type === 'insert' ? 'Not present in the anchored version' : 'Not provided')}</dd>
                      </div>
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <dt className="font-bold text-[#B42318]">Current PDF</dt>
                        <dd className="mt-1 font-semibold text-[#0C2B49]">{segment.current_text || (segment.type === 'delete' ? 'Removed from the current PDF' : 'Not provided')}</dd>
                      </div>
                      <div><dt className="font-bold text-[#5B6F8A]">Location</dt><dd className="mt-1 text-[#0C2B49]">{segment.location === 'current' ? 'Current PDF' : 'Anchored version'}{segment.page_idx == null ? ' · text only' : ` · page ${segment.page_idx + 1}`}</dd></div>
                    </dl>
                  ))}
                </>
              ) : (
                <div role="status" aria-label="Comparison details unavailable" className="rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] p-4">
                  <h3 className="font-extrabold text-[#0C2B49]">Detailed comparison unavailable</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6F8A]">
                    {result.tamper_report_status === 'UNAVAILABLE'
                      ? result.tamper_report_unavailable_reason || 'The tampered verdict still stands, but a trustworthy text comparison could not be produced.'
                      : result.tamper_report_status === 'NOT_APPLICABLE'
                        ? 'No text comparison applies to this verification response.'
                        : 'This verification response includes the verdict and file hashes, but no extracted-text differences or baseline PDF.'}
                  </p>
                </div>
              )}
            </section>
          )}
          <VerificationDetails result={result} hideFileName={showPdfWorkspace} authentic={authentic} />
        </div>
      </div>
    ) : <VerificationDetails result={result} />}
  </section>;
}
