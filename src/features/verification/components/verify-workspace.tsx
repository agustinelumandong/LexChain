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
import { useRef, useState } from 'react';
import { isMockMode } from '@/lib/mocks/mode';
import { signedCopyFileUrl } from '@/features/documents/document-lifecycle-api';
import { TamperChangeCard } from '@/features/verification/components/tamper-change-card';

const PdfDocumentViewer = dynamic(() => import('@/features/documents/components/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p>Loading PDF preview…</p>,
});

type VerificationResult = ApiSchema<'DocumentVerificationResponse'>;

function statusHeading(result: VerificationResult, role: PortalUiRole) {
  if (result.status === 'NOT_ANCHORED' && role === 'user') return 'No saved record yet';
  if (result.status === 'AUTHENTIC') return result.is_authentic ? (result.baseline_trusted ? 'PDF unchanged' : 'This PDF matches, but the saved reference needs attention') : 'We could not check this document';
  if (result.status === 'FILE_MISSING') return result.is_authentic ? 'We could not check this document' : 'The document file is missing';
  if (result.status === 'VERIFICATION_UNAVAILABLE' || (result.status === 'TAMPERED' && result.is_authentic)) return 'We could not check this document';
  if (result.status === 'NOT_ANCHORED') return 'No blockchain record is saved';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'The saved reference needs attention';
  if (result.status === 'TAMPERED') return 'This PDF differs from the saved version';
  return 'We could not check this document';
}

type CheckTone = 'ok' | 'caution' | 'bad';
type IntegrityCheck = { label: string; tone: CheckTone };
type RecordChange = ApiSchema<'RecordChange'>;
type TamperSegment = ApiSchema<'TamperSegment'>;

function nearestScrollOptions(): ScrollIntoViewOptions {
  return { block: 'nearest', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' };
}

const RESULT_PANEL_TONE: Record<CheckTone, string> = {
  ok: 'border-green-700 bg-green-50',
  caution: 'border-amber-700 bg-amber-50',
  bad: 'border-red-700 bg-red-50',
};
const HEADLINE_ICON_TONE: Record<CheckTone, string> = {
  ok: 'text-[#166534]',
  caution: 'text-[#8A5B00]',
  bad: 'text-[#B42318]',
};
const CHECK_CHIP_TONE: Record<CheckTone, string> = {
  ok: 'border-green-200 bg-white text-[#166534]',
  caution: 'border-amber-300 bg-white text-[#8A5B00]',
  bad: 'border-[#B42318] bg-[#B42318] text-white',
};

function pdfCheckLabel(
  result: VerificationResult,
  { authentic, untrustedSnapshot, unavailable }: { authentic: boolean; untrustedSnapshot: boolean; unavailable: boolean },
): string {
  if (authentic) return untrustedSnapshot ? 'PDF matches, saved reference needs attention' : 'PDF unchanged';
  if (unavailable) return 'PDF could not be checked';
  if (result.status === 'TAMPERED') return 'PDF differs';
  if (result.status === 'FILE_MISSING') return 'PDF file missing';
  if (result.status === 'NOT_ANCHORED') return 'No saved PDF record';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'Saved reference needs attention';
  return 'PDF could not be checked';
}

function recordCheck(
  status: string | null | undefined,
  labels: { unchanged: string; changed: string; notSaved: string; unknown: string },
): IntegrityCheck {
  if (status === 'MATCH') return { label: labels.unchanged, tone: 'ok' };
  if (status === 'ALTERED') return { label: labels.changed, tone: 'bad' };
  return { label: status === 'NOT_ANCHORED' ? labels.notSaved : labels.unknown, tone: 'caution' };
}

function CheckToneIcon({ tone, size }: { tone: CheckTone; size: number }) {
  const Icon = tone === 'ok' ? CheckCircleIcon : tone === 'caution' ? InfoOutlinedIcon : ErrorOutlineIcon;
  return <Icon className="shrink-0" sx={{ fontSize: size }} aria-hidden="true" />;
}

function RecordChangeList({ title, changes, hideFieldName = false }: { title: string; changes: RecordChange[]; hideFieldName?: boolean }) {
  if (changes.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-black uppercase tracking-wide text-[#5B6F8A]">{title} · {changes.length}</h4>
      <dl className="mt-2 space-y-3 text-sm">
        {changes.map((change, index) => (
          <div key={`${change.field}-${index}`} className="break-words rounded-xl border border-[#E8F0F8] bg-[#F8FBFF] p-3">
            <dt className={hideFieldName ? 'sr-only' : 'font-bold text-[#0C2B49]'}>{change.field.replaceAll('_', ' ')}</dt>
            <dd className="text-[#344054]"><span>At finalization:</span> <span className="font-semibold">{change.anchored ?? 'Not available'}</span></dd>
            <dd className="text-[#344054]">Current: <span className="font-semibold">{change.current === null ? 'None' : change.current ?? 'Not available'}</span></dd>
          </div>
        ))}
      </dl>
    </div>
  );
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
        <p className="text-xs font-black uppercase tracking-wide text-[#5B6F8A]">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs font-semibold text-[#0C2B49]" title={hash}>{shortened}</p>
      </div>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => void copyHash()}
        className="shrink-0 rounded-full border border-[#D7E4F2] bg-white px-3 py-1 text-xs font-black text-[#0067B3] transition hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]"
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

function plainLanguageExplanation(result: VerificationResult, contradictoryVerdict: boolean, role: PortalUiRole): string {
  if (contradictoryVerdict) {
    return 'The check returned conflicting verification fields, so integrity could not be confirmed.';
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
    return role === 'user'
      ? 'There is no saved record to compare this document with yet. Your lawyer may still be finalizing it.'
      : 'This document has not been anchored on the blockchain. Finalize the document first to record its fingerprint.';
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
  role,
}: {
  result: VerificationResult;
  hideFileName?: boolean;
  authentic?: boolean;
  role: PortalUiRole;
}) {
  const simulated = isMockMode();
  const simulatedAnchorConfirmed = simulated
    && result.status === 'TAMPERED'
    && result.baseline_trusted
    && Boolean(result.onchain_hash);
  const isClient = role === 'user';
  const trustedBaseline = <div><dt className="font-bold text-[#5B6F8A]">Trusted baseline</dt><dd className="mt-1 text-[#0C2B49]">{result.baseline_trusted ? 'Trusted' : 'Not trusted'}</dd></div>;
  const technicalProof = (
    <>
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
    </>
  );

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
        {!isClient && trustedBaseline}
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
      {isClient ? (
        <details className="rounded-xl border border-[#D7E4F2] bg-[#F8FBFF] px-3.5">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-[#0C2B49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Technical details</summary>
          <div className="space-y-4 pb-3.5 pt-1">
            <dl className="text-sm">{trustedBaseline}</dl>
            {technicalProof}
          </div>
        </details>
      ) : technicalProof}
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
  const [selectedChange, setSelectedChange] = useState<number | null>(null);
  const [revealRequest, setRevealRequest] = useState<{ blockIndex: number; id: number } | null>(null);
  const pdfPaneRef = useRef<HTMLElement>(null);
  const changeListRef = useRef<HTMLUListElement>(null);
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
  const currentSegments = tamperedSegments.filter((segment) => segment.location === 'current');
  const overlayIndexOf = (segment: TamperSegment) => segment.block_index ?? -(currentSegments.indexOf(segment) + 1);
  const currentPdfSegments = currentSegments
    .map((segment): ApiSchema<'ExtractionBlock'> => ({
      index: overlayIndexOf(segment),
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
  const canShowOnPdf = (segment: TamperSegment) => segment.location === 'current' && segment.page_idx != null;
  const selectedSegment = selectedChange === null ? undefined : tamperedSegments[selectedChange];

  function showChangeOnPdf(position: number, segment: TamperSegment) {
    setSelectedChange(position);
    setCurrentPage(segment.page_idx ?? currentPage);
    setRevealRequest((current) => ({ blockIndex: overlayIndexOf(segment), id: (current?.id ?? 0) + 1 }));
    pdfPaneRef.current?.scrollIntoView(nearestScrollOptions());
  }

  function selectChangeFromPdf(blockIndex: number) {
    const position = tamperedSegments.findIndex((segment) => segment.location === 'current' && overlayIndexOf(segment) === blockIndex);
    if (position < 0) return;
    setSelectedChange(position);
    changeListRef.current?.querySelector(`[data-change="${position}"]`)?.scrollIntoView(nearestScrollOptions());
  }

  const showTamperComparison = result.status === 'TAMPERED'
    && !result.is_authentic
    && result.baseline_trusted;
  const showPdfWorkspace = authentic || showTamperComparison;
  const fileNameChanged = result.metadata_status === 'ALTERED' && result.metadata_changes?.length === 1 && result.metadata_changes[0].field === 'file_name';

  const pdfCheck: IntegrityCheck = {
    label: pdfCheckLabel(result, { authentic, untrustedSnapshot, unavailable }),
    tone: authentic && !untrustedSnapshot ? 'ok' : neutral ? 'caution' : 'bad',
  };
  const metadataCheck = recordCheck(result.metadata_status, {
    unchanged: 'Document details unchanged',
    changed: fileNameChanged ? 'File name changed' : 'Document details changed',
    notSaved: 'No saved document details',
    unknown: 'Document details could not be checked',
  });
  const analysisCheck = recordCheck(result.analysis_status, {
    unchanged: 'Analysis unchanged',
    changed: 'Analysis changed',
    notSaved: 'No saved analysis record',
    unknown: 'Analysis could not be checked',
  });
  const checks = [pdfCheck, metadataCheck, analysisCheck];
  const problems = checks.filter((check) => check.tone === 'bad');
  const cautions = checks.filter((check) => check.tone === 'caution');
  const overallTone: CheckTone = problems.length > 0 ? 'bad' : cautions.length > 0 ? 'caution' : 'ok';
  const headlineCheck = problems.length > 1
    ? null
    : problems[0] ?? (pdfCheck.tone !== 'ok' || cautions.length === 0 ? pdfCheck : cautions.length === 1 ? cautions[0] : null);
  const headline = headlineCheck === pdfCheck
    ? (contradictoryVerdict ? 'We could not check this document' : statusHeading(result, role))
    : headlineCheck?.label ?? (problems.length > 1 ? `${problems.length} problems found` : `${cautions.length} checks need attention`);
  const metadataChanges = result.metadata_status === 'ALTERED' ? result.metadata_changes ?? [] : [];
  const analysisChanges = result.analysis_status === 'ALTERED' ? result.analysis_changes ?? [] : [];
  const hasChanges = showTamperComparison || result.metadata_status === 'ALTERED' || result.analysis_status === 'ALTERED';
  const metadataUnknown = metadataCheck.label === 'Document details could not be checked';
  const analysisUnknown = analysisCheck.label === 'Analysis could not be checked';
  const resultDetails = (
    <section aria-label="Result details" className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
      {hasChanges && <h3 className="font-extrabold text-[#0C2B49]">What changed</h3>}
      <div>
        <p className="text-sm leading-5 text-[#344054]">{plainLanguageExplanation(result, contradictoryVerdict, role)}</p>
        {role === 'user' && !authentic && !unavailable && (
          <p className="mt-1 text-sm text-[#475467]">
            Contact your lawyer or the document owner if you have questions regarding this document&apos;s integrity.
          </p>
        )}
      </div>
      {metadataUnknown && <p className="text-sm text-[#344054]">The check on document details did not finish. This does not mean the record was changed.</p>}
      {analysisUnknown && <p className="text-sm text-[#344054]">The check on the analysis did not finish. This does not mean the analysis was changed.</p>}
      <RecordChangeList title="Document details" changes={metadataChanges} hideFieldName={fileNameChanged} />
      <RecordChangeList title="Analysis" changes={analysisChanges} />
    </section>
  );

  return <section className="flex flex-col gap-5 md:min-h-0 md:flex-1">
    <section aria-label="Verification results" className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border-2 px-4 py-3 ${RESULT_PANEL_TONE[overallTone]}`}>
      <div className={`flex min-w-0 items-center gap-2 ${HEADLINE_ICON_TONE[overallTone]}`}>
        <CheckToneIcon tone={overallTone} size={20} />
        <h2 className="text-base font-bold text-[#0C2B49]">{headline}</h2>
      </div>
      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {checks.filter((check) => check !== headlineCheck).map((check) => (
          <li key={check.label} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${CHECK_CHIP_TONE[check.tone]}`}>
            <CheckToneIcon tone={check.tone} size={14} />
            {check.label}
          </li>
        ))}
      </ul>
      {(unavailable || notAnchored) && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0067B3] bg-white px-5 py-2 text-sm font-bold text-[#0067B3] hover:bg-[#EEF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Try again</button>}
    </section>

    {showPdfWorkspace ? (
      <div className="grid min-w-0 gap-5 md:min-h-[30rem] md:flex-1 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.9fr)] md:grid-rows-[minmax(0,1fr)]">
        <section ref={pdfPaneRef} aria-label="Current document" className="flex min-h-[30rem] min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white p-4 md:min-h-0">
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
              selectedBlockIndex={selectedSegment ? overlayIndexOf(selectedSegment) : null}
              hoveredBlockIndex={null}
              revealRequest={revealRequest}
              tamperedBlockIndexes={new Set(currentPdfSegments.map((segment) => segment.index))}
              onPageChange={setCurrentPage}
              onSelectBlock={selectChangeFromPdf}
              onHoverBlockChange={() => undefined}
            />
          </div>
        </section>
        <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-auto">
          {resultDetails}
          {showTamperComparison && (
            <section aria-label="PDF text changes" className="space-y-4 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
              {tamperedSegments.length > 0 ? (
                <>
                  <div>
                    <h3 className="font-extrabold text-[#0C2B49]">PDF text changes</h3>
                    <p className="mt-1 text-sm text-[#5B6F8A]">{tamperReport?.total_changes ?? 0} {tamperReport?.total_changes === 1 ? 'change' : 'changes'} found.{tamperedSegments.some(canShowOnPdf) && ' Select one to see it on the PDF.'}</p>
                    {tamperReport?.truncated && <p role="note" className="mt-1 text-sm text-[#8A5B00]">Additional changes were found. Only the listed segments are shown here.</p>}
                  </div>
                  <ul ref={changeListRef} className="space-y-3">
                    {tamperedSegments.map((segment, position) => (
                      <TamperChangeCard
                        key={position}
                        segment={segment}
                        position={position}
                        selected={selectedChange === position}
                        onShow={canShowOnPdf(segment) ? () => showChangeOnPdf(position, segment) : undefined}
                      />
                    ))}
                  </ul>
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
          <VerificationDetails result={result} hideFileName={showPdfWorkspace} authentic={authentic} role={role} />
        </div>
      </div>
    ) : <>
      {resultDetails}
      <VerificationDetails result={result} role={role} />
    </>}
  </section>;
}
