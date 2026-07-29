'use client';

import type { ApiSchema } from '@lexchain/types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const PdfDocumentViewer = dynamic(() => import('../review/pdf-document-viewer'), {
  ssr: false,
  loading: () => <p>Loading source PDF…</p>,
});

type VerificationResult = ApiSchema<'DocumentVerificationResponse'>;
type TamperedSegment = ApiSchema<'TamperedSegment'>;

function statusHeading(result: VerificationResult) {
  if (result.status === 'AUTHENTIC' && result.is_authentic) return 'Document is authentic';
  if (result.status === 'VERIFICATION_UNAVAILABLE') return 'Integrity status unavailable';
  if (result.status === 'NOT_ANCHORED') return 'Document is not anchored';
  if (result.status === 'SNAPSHOT_COMPROMISED') return 'Trusted snapshot is compromised';
  if (result.status === 'TAMPERED') return 'Document was tampered with';
  return 'Document integrity requires attention';
}

function severityClass(severity: string) {
  if (severity === 'critical') return 'text-[#B42318]';
  if (severity === 'major') return 'text-[#B77900]';
  return 'text-[#64748b]';
}

function SegmentDiff({ segment }: { segment: TamperedSegment }) {
  if (!segment.word_diff?.length) return <p className="mt-2 text-sm text-[#0C2B49]">{segment.current_text}</p>;

  return <p className="mt-2 text-sm text-[#0C2B49]">
    {segment.word_diff.map((part, index) => (
      <span key={index} className={part.op === 'removed' ? 'bg-red-100 text-[#B42318] line-through' : part.op === 'added' ? 'bg-green-100 text-[#067647]' : ''}>{part.text}</span>
    ))}
  </p>;
}

export default function VerifyWorkspace({ result, onRetry }: { result: VerificationResult; onRetry: () => void }) {
  const report = result.tamper_report;
  const segments = report?.segments ?? [];
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const localized = report?.localized !== false;
  const blocks = result.blocks ?? [];
  const tamperedBlockIndexes = new Set(segments.flatMap((segment) => segment.block_index === null || segment.block_index === undefined ? [] : [segment.block_index]));
  const authentic = result.status === 'AUTHENTIC' && result.is_authentic;
  const unavailable = result.status === 'VERIFICATION_UNAVAILABLE';
  const neutral = unavailable || result.status === 'NOT_ANCHORED';

  function selectSegment(segment: TamperedSegment) {
    if (segment.block_index === null || segment.block_index === undefined) return;
    setSelectedBlockIndex(segment.block_index);
    if (segment.page_idx !== null && segment.page_idx !== undefined) setCurrentPage(segment.page_idx);
  }

  return <section className="space-y-5">
    <div className={`rounded-[18px] border p-5 ${authentic ? 'border-green-200 bg-green-50' : neutral ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        {authentic ? <CheckCircleIcon className="text-[#12A150]" sx={{ fontSize: 38 }} /> : <ErrorIcon className={neutral ? 'text-[#B77900]' : 'text-[#D94B66]'} sx={{ fontSize: 38 }} />}
        <div><h2 className={`text-xl font-extrabold ${authentic ? 'text-[#12A150]' : neutral ? 'text-[#B77900]' : 'text-[#D94B66]'}`}>{statusHeading(result)}</h2><p className="mt-1 text-sm text-[#475467]">{result.message}</p></div>
      </div>
      {(unavailable || result.status === 'NOT_ANCHORED') && <button type="button" onClick={onRetry} className="mt-4 rounded-full border border-[#0985E7] bg-white px-4 py-2 text-sm font-black text-[#0985E7]">Retry verification</button>}
    </div>

    {result.status === 'TAMPERED' && report && <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-black text-[#0C2B49]">{report.total_changes} change{report.total_changes === 1 ? '' : 's'} found</h2><p className="text-sm text-[#64748b]">{report.critical_changes} critical · {(report.similarity * 100).toFixed(1)}% unchanged</p></div>
      {localized && result.storage_url && blocks.length > 0 ? <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <section aria-label="Current document" className="min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-4">
          <PdfDocumentViewer sourceUrl={result.storage_url} pageCount={result.page_count ?? 1} currentPage={currentPage} blocks={blocks} selectedBlockIndex={selectedBlockIndex} hoveredBlockIndex={hoveredBlockIndex} tamperedBlockIndexes={tamperedBlockIndexes} onPageChange={setCurrentPage} onSelectBlock={setSelectedBlockIndex} onHoverBlockChange={setHoveredBlockIndex} />
        </section>
        <SegmentList segments={segments} selectedBlockIndex={selectedBlockIndex} onSelect={selectSegment} onHover={setHoveredBlockIndex} />
      </div> : <SegmentList segments={segments} selectedBlockIndex={selectedBlockIndex} onSelect={selectSegment} onHover={setHoveredBlockIndex} textOnly />}
    </div>}

    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-[#E8F0F8] bg-white p-4 text-xs text-[#64748b]">
      {result.onchain_hash && <span>On-chain {result.onchain_hash}</span>}
      {result.current_hash && <span>Current {result.current_hash}</span>}
      {result.tx_hash && <span>Transaction {result.tx_hash}</span>}
    </div>
  </section>;
}

function SegmentList({ segments, selectedBlockIndex, onSelect, onHover, textOnly = false }: { segments: TamperedSegment[]; selectedBlockIndex: number | null; onSelect: (segment: TamperedSegment) => void; onHover: (blockIndex: number | null) => void; textOnly?: boolean }) {
  return <section aria-label={textOnly ? 'Text changes' : 'Changed sections'} className="space-y-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5">
    {textOnly && <p className="text-sm text-[#64748b]">This older document has no stored layout, so changes are shown as text only.</p>}
    {segments.map((segment, index) => <button key={`${segment.type}-${index}`} type="button" disabled={segment.block_index === null || segment.block_index === undefined} onClick={() => onSelect(segment)} onMouseEnter={() => onHover(segment.block_index ?? null)} onMouseLeave={() => onHover(null)} className={`block w-full rounded-xl border p-4 text-left disabled:cursor-default ${selectedBlockIndex === segment.block_index ? 'border-[#D94B66] bg-red-50' : 'border-[#E8F0F8] hover:border-[#F3A6B5]'}`}>
      <p className={`text-xs font-black uppercase tracking-wide ${severityClass(segment.severity)}`}>{segment.severity} · {segment.page_idx === null || segment.page_idx === undefined ? 'Text diff' : `Page ${segment.page_idx + 1}`}</p>
      <p className="mt-1 font-bold text-[#0C2B49]">{segment.reason}</p>
      <SegmentDiff segment={segment} />
      <div className="mt-3 grid gap-2 text-sm"><p className="rounded bg-red-50 p-2 text-[#B42318]"><span className="font-bold">Original: </span>{segment.original_text}</p><p className="rounded bg-green-50 p-2 text-[#067647]"><span className="font-bold">Current: </span>{segment.current_text}</p></div>
    </button>)}
  </section>;
}
