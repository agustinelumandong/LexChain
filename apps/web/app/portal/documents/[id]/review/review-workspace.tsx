'use client';

import type { ApiSchema } from '@lexchain/types';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { ExtractionReview } from '../../../lib/extraction-api';

const PdfDocumentViewer = dynamic(() => import('./pdf-document-viewer'), {
  ssr: false,
  loading: () => <p>Loading source PDF…</p>,
});

export type ReviewWorkspaceProps = {
  review: ExtractionReview;
  actionError: string | null;
  isSaving: boolean;
  isAnalyzing: boolean;
  isApproving: boolean;
  onSave: (edits: ApiSchema<'BlockEdit'>[]) => Promise<ExtractionReview>;
  onAnalyze: () => Promise<ExtractionReview>;
  onApprove: () => Promise<void>;
};

export default function ReviewWorkspace({
  review,
  actionError,
  isSaving,
  isAnalyzing,
  isApproving,
  onSave,
  onAnalyze,
  onApprove,
}: ReviewWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'compare' | 'raw'>('compare');
  const [mobilePane, setMobilePane] = useState<'source' | 'review'>('review');
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sanitizedTables, setSanitizedTables] = useState<Record<number, string | null>>({});
  const edits = review.blocks.flatMap<ApiSchema<'BlockEdit'>>((block) => {
    if (block.editable === false) return [];
    const draft = drafts[block.index];
    return draft === undefined || draft === block.text ? [] : [{ index: block.index, text: draft }];
  });
  const mutationPending = isSaving || isAnalyzing || isApproving;

  useEffect(() => {
    let cancelled = false;
    void import('dompurify')
      .then(({ default: DOMPurify }) => {
        if (cancelled) return;
        setSanitizedTables(Object.fromEntries(
          review.blocks
            .filter((block) => block.is_html)
            .map((block) => [block.index, DOMPurify.sanitize(drafts[block.index] ?? block.text)]),
        ));
      })
      .catch(() => {
        if (cancelled) return;
        setSanitizedTables(Object.fromEntries(
          review.blocks.filter((block) => block.is_html).map((block) => [block.index, null]),
        ));
      });
    return () => {
      cancelled = true;
    };
  }, [drafts, review.blocks]);

  async function saveChanges() {
    if (edits.length === 0) return;
    const savedEdits = edits;
    try {
      await onSave(savedEdits);
      setDrafts((current) => {
        const remaining = { ...current };
        savedEdits.forEach((edit) => {
          if (current[edit.index] === edit.text) delete remaining[edit.index];
        });
        return remaining;
      });
    } catch {
      // The route exposes the mutation error; retain drafts for correction or retry.
    }
  }

  return (
    <section className="min-w-0">
      <div role="tablist" aria-label="Extraction review view" className="flex border-b border-[#E8F0F8]">
        {(['compare', 'raw'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="review-workspace-panel"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-5 py-3 text-sm font-black ${activeTab === tab ? 'border-[#0985E7] text-[#0985E7]' : 'border-transparent text-[#64748b]'}`}
          >
            {tab === 'compare' ? 'Compare' : 'Raw'}
          </button>
        ))}
      </div>

      <div id="review-workspace-panel" role="tabpanel" className="pt-5">
        {activeTab === 'compare' ? (
          <>
            <div aria-label="Mobile review pane" className="mb-3 grid grid-cols-2 gap-2 md:hidden">
              {(['source', 'review'] as const).map((pane) => (
                <button
                  key={pane}
                  type="button"
                  aria-label={`${pane === 'source' ? 'Source' : 'Review'} pane`}
                  aria-pressed={mobilePane === pane}
                  onClick={() => setMobilePane(pane)}
                  className={`rounded-full px-4 py-2 text-sm font-black ${mobilePane === pane ? 'bg-[#0985E7] text-white' : 'border border-[#D7E4F2] text-[#64748b]'}`}
                >
                  {pane === 'source' ? 'Source' : 'Review'}
                </button>
              ))}
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <section aria-label="Source document" className={mobilePane === 'source' ? 'min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-4' : 'hidden min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-4 md:block'}>
                <PdfDocumentViewer
                  sourceUrl={review.storage_url}
                  pageCount={review.page_count}
                  currentPage={currentPage}
                  blocks={review.blocks}
                  selectedBlockIndex={selectedBlockIndex}
                  onPageChange={setCurrentPage}
                  onSelectBlock={setSelectedBlockIndex}
                />
              </section>

              <section aria-label="Reviewed document" className={mobilePane === 'review' ? 'min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]' : 'hidden min-w-0 rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)] md:block'}>
                {review.blocks.map((block) => {
                  const text = drafts[block.index] ?? block.text;
                  const dirty = drafts[block.index] !== undefined && drafts[block.index] !== block.text;
                  const selected = selectedBlockIndex === block.index;
                  const sanitizedTable = sanitizedTables[block.index];
                  return (
                    <section
                      key={block.index}
                      id={`review-block-${block.index}`}
                      data-block-index={block.index}
                      className={`group rounded-lg px-2 py-1.5 ${selected ? 'bg-[#F5FAFF]' : ''}`}
                    >
                      {block.is_html ? (
                        <>
                          {sanitizedTable === undefined && <p className="text-sm text-[#64748b]">Loading table…</p>}
                          {sanitizedTable === null && <p className="text-sm text-[#B42318]">Table preview unavailable. Edit it in Raw view.</p>}
                          {typeof sanitizedTable === 'string' && (
                            <div
                              className="overflow-x-auto text-sm text-[#0C2B49] [&_table]:w-full [&_td]:border [&_td]:border-[#D7E4F2] [&_td]:p-2 [&_th]:border [&_th]:border-[#D7E4F2] [&_th]:p-2"
                              dangerouslySetInnerHTML={{ __html: sanitizedTable }}
                            />
                          )}
                          <button
                            type="button"
                            disabled={review.is_reviewed || block.editable === false}
                            onClick={() => {
                              setSelectedBlockIndex(block.index);
                              setActiveTab('raw');
                            }}
                            className="mt-2 text-xs font-black text-[#0985E7] disabled:opacity-40"
                          >
                            Edit table in Raw view
                          </button>
                        </>
                      ) : block.editable !== false ? (
                        <textarea
                          id={`review-block-input-${block.index}`}
                          aria-label={`Reviewed text for block ${block.index}`}
                          data-selected={selected}
                          value={text}
                          rows={block.text_level === 1 ? 1 : Math.max(2, text.split('\n').length)}
                          disabled={review.is_reviewed}
                          onFocus={() => setSelectedBlockIndex(block.index)}
                          onChange={(event) => setDrafts((current) => ({ ...current, [block.index]: event.target.value }))}
                          className={`w-full resize-y rounded-lg border bg-transparent px-2 py-1.5 leading-7 text-[#0C2B49] outline-none transition-colors hover:border-[#D7E4F2] focus:border-[#0985E7] disabled:resize-none disabled:bg-[#F8FBFF] ${block.text_level === 1 ? 'text-xl font-black' : 'text-sm'} ${dirty || selected ? 'border-[#98C9F3]' : 'border-transparent'}`}
                        />
                      ) : (
                        <p className="rounded-lg border border-dashed border-[#F5D7A1] bg-[#FFF9EC] px-3 py-2 text-sm text-[#64748b]">
                          {block.type} region — shown on the source PDF and not editable.
                        </p>
                      )}
                    </section>
                  );
                })}
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {review.blocks.map((block) => {
              const text = drafts[block.index] ?? block.text;
              return (
                <section
                  key={block.index}
                  id={`review-block-${block.index}`}
                  data-block-index={block.index}
                  className={`rounded-[18px] border bg-white p-5 ${selectedBlockIndex === block.index ? 'border-[#0985E7]' : 'border-[#E8F0F8]'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-black text-[#0C2B49]">Block {block.index}</h2>
                    <p className="text-xs font-bold text-[#64748b]">
                      {block.page_idx === null || block.page_idx === undefined ? 'Page not reported' : `Page ${block.page_idx + 1}`}
                      {' · '}
                      {block.score === null || block.score === undefined ? 'Confidence not reported' : `${Math.round(block.score * 100)}% confidence`}
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#F8FBFF] p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#64748b]">Original OCR text</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#475569]">{block.original_text}</p>
                  </div>
                  {block.editable !== false ? (
                    <>
                      <label htmlFor={`review-block-input-${block.index}`} className="mt-4 block text-sm font-bold text-[#0C2B49]">Reviewed text</label>
                      <textarea
                        id={`review-block-input-${block.index}`}
                        aria-label={`Reviewed text for block ${block.index}`}
                        value={text}
                        rows={Math.max(3, text.split('\n').length + 1)}
                        disabled={review.is_reviewed}
                        onFocus={() => setSelectedBlockIndex(block.index)}
                        onChange={(event) => setDrafts((current) => ({ ...current, [block.index]: event.target.value }))}
                        className="mt-1.5 w-full resize-y rounded-xl border border-[#D7E4F2] px-3 py-2.5 font-mono text-sm leading-6 text-[#0C2B49] outline-none focus:border-[#0985E7] disabled:bg-[#F8FBFF]"
                      />
                    </>
                  ) : <p className="mt-4 text-sm font-bold text-[#B77900]">This {block.type} region is not editable.</p>}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {actionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{actionError}</p>}
      <div className="mt-5 flex flex-wrap gap-2 rounded-[18px] border border-[#E8F0F8] bg-white p-4">
        <button
          type="button"
          disabled={edits.length === 0 || mutationPending || review.is_reviewed}
          onClick={() => void saveChanges()}
          className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
        >
          {isSaving ? 'Saving changes…' : 'Save changes'}
        </button>
        <button
          type="button"
          disabled={edits.length > 0 || mutationPending || review.is_reviewed}
          onClick={() => void onAnalyze().catch(() => undefined)}
          className="rounded-full border border-[#0985E7] px-4 py-2.5 text-sm font-black text-[#0985E7] disabled:opacity-40"
        >
          {isAnalyzing ? 'Analyzing semantic issues…' : 'Analyze semantic issues'}
        </button>
        <button
          type="button"
          disabled={edits.length > 0 || mutationPending || review.is_reviewed}
          onClick={() => void onApprove().catch(() => undefined)}
          className="rounded-full bg-[#0C2B49] px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
        >
          {isApproving ? 'Approving reviewed text…' : 'Approve reviewed text'}
        </button>
      </div>
      {edits.length > 0 && <p className="mt-3 text-xs font-semibold text-[#B77900]">Save changes before analysis or approval.</p>}
      {review.is_reviewed && <p className="mt-3 text-xs font-semibold text-[#12A150]">Reviewed text is approved and frozen.</p>}
    </section>
  );
}
