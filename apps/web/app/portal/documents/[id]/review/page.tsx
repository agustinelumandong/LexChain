'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  analyzeExtraction,
  approveExtraction,
  getExtractionReview,
  saveExtractionEdits,
} from '../../../lib/extraction-api';
import { getPortalUiRole } from '../../../lib/portal-role';

type BlockEdit = ApiSchema<'BlockEdit'>;
type UserProfile = ApiSchema<'UserProfileResponse'>;

async function getProfile(): Promise<UserProfile> {
  const response = await fetch('/api/portal/proxy?path=%2Fusers%2F', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Unable to load your review access.');
  return response.json() as Promise<UserProfile>;
}

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : 'The review action failed. Please try again.';
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [selectedFlag, setSelectedFlag] = useState(0);
  const profileQuery = useQuery({ queryKey: ['portal-profile'], queryFn: getProfile });
  const role = getPortalUiRole(profileQuery.data?.role);
  const extractionQuery = useQuery({
    queryKey: ['portal-extraction', id],
    queryFn: () => getExtractionReview(id),
    enabled: role === 'issuer',
    retry: false,
  });

  async function invalidateReviewQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portal-doc', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal-doc-status', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal-extraction', id] }),
    ]);
  }

  const saveMutation = useMutation({
    mutationFn: (edits: BlockEdit[]) => saveExtractionEdits(id, edits),
    onSuccess: invalidateReviewQueries,
  });
  const analyzeMutation = useMutation({
    mutationFn: () => analyzeExtraction(id),
    onSuccess: invalidateReviewQueries,
  });
  const approveMutation = useMutation({
    mutationFn: () => approveExtraction(id),
    onSuccess: async () => {
      await invalidateReviewQueries();
      router.replace(`/portal/upload/processing?id=${id}`);
    },
  });

  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Loading review access…</p>;
  if (profileQuery.isError) return <p role="alert" className="text-sm font-semibold text-[#B42318]">{messageFor(profileQuery.error)}</p>;
  if (role !== 'issuer') {
    return (
      <section className="max-w-xl rounded-[18px] border border-[#E8F0F8] bg-white p-6">
        <h1 className="text-xl font-black text-[#0C2B49]">Review unavailable</h1>
        <p className="mt-2 text-sm text-[#64748b]">Document Participants can view shared documents, but only Document Issuers can review extracted text.</p>
      </section>
    );
  }
  if (extractionQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Loading extracted text…</p>;
  if (extractionQuery.isError || !extractionQuery.data) {
    return <p role="alert" className="text-sm font-semibold text-[#B42318]">{messageFor(extractionQuery.error)}</p>;
  }

  const review = extractionQuery.data;
  const edits = review.blocks.flatMap<BlockEdit>((block) => {
    const text = drafts[block.index] ?? block.text;
    return text === block.text ? [] : [{ index: block.index, text }];
  });
  const knownSeverities = ['high', 'medium', 'low'];
  const severities = [
    ...knownSeverities,
    ...new Set(review.flags.map((flag) => flag.severity.toLowerCase()).filter((severity) => !knownSeverities.includes(severity))),
  ];
  const selectedBlock = review.flags[selectedFlag]?.block_index;
  const actionError = saveMutation.error ?? analyzeMutation.error ?? approveMutation.error;
  const mutationPending = saveMutation.isPending || analyzeMutation.isPending || approveMutation.isPending;

  function selectFlag(flagIndex: number, blockIndex?: number | null) {
    setSelectedFlag(flagIndex);
    if (blockIndex !== null && blockIndex !== undefined) {
      document.getElementById(`extraction-block-${blockIndex}`)?.focus();
    }
  }

  function confirmApproval() {
    if (window.confirm('Approving freezes the reviewed text and starts processing. You will not be able to edit it afterward. Continue?')) {
      approveMutation.mutate();
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <header>
        <Link href={`/portal/documents/${id}`} className="text-sm font-bold text-[#0985E7]">← Back to document</Link>
        <h1 className="mt-3 text-[28px] font-black text-[#0C2B49]">Review extracted text</h1>
        <p className="mt-1 text-sm text-[#64748b]">Correct OCR text and resolve flags before approving it for processing.</p>
      </header>

      {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{messageFor(actionError)}</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(220px,0.75fr)_minmax(0,2fr)_minmax(240px,0.9fr)]">
        <aside className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <h2 className="font-black text-[#0C2B49]">Review flags</h2>
          {review.flags.length === 0 && <p className="mt-3 text-sm text-[#64748b]">No review flags found.</p>}
          <div className="mt-4 flex flex-col gap-5">
            {severities.map((severity) => {
              const flags = review.flags
                .map((flag, flagIndex) => ({ flag, flagIndex }))
                .filter(({ flag }) => flag.severity.toLowerCase() === severity);
              if (flags.length === 0) return null;
              const heading = severity === 'high' ? 'High priority' : severity === 'medium' ? 'Medium priority' : severity === 'low' ? 'Low priority' : `${severity} priority`;
              return (
                <section key={severity} aria-labelledby={`flag-group-${severity}`}>
                  <h3 id={`flag-group-${severity}`} className="text-xs font-black uppercase tracking-wide text-[#64748b]">{heading}</h3>
                  <div className="mt-2 flex flex-col gap-2">
                    {flags.map(({ flag, flagIndex }) => (
                      <button
                        key={`${flag.kind}-${flag.block_index ?? 'document'}-${flagIndex}`}
                        type="button"
                        aria-label={`${heading}, ${flag.block_index === null || flag.block_index === undefined ? 'document' : `block ${flag.block_index}`}, flag ${flagIndex + 1}: ${flag.message}`}
                        aria-current={flagIndex === selectedFlag ? 'true' : undefined}
                        onClick={() => selectFlag(flagIndex, flag.block_index)}
                        className="rounded-xl border border-[#E8F0F8] p-3 text-left aria-current:border-[#0985E7] aria-current:bg-[#F5FAFF]"
                      >
                        <span className="block text-sm font-bold text-[#0C2B49]">{flag.message}</span>
                        {flag.excerpt && <span className="mt-1 block text-xs text-[#64748b]">{flag.excerpt}</span>}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-4">
          {review.blocks.map((block) => (
            <section
              key={block.index}
              className={`rounded-[18px] border bg-white p-5 ${selectedBlock === block.index ? 'border-[#0985E7]' : 'border-[#E8F0F8]'}`}
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
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#475569]">{block.original_text}</p>
              </div>
              <label htmlFor={`extraction-block-${block.index}`} className="mt-4 block text-sm font-bold text-[#0C2B49]">Reviewed text</label>
              <textarea
                id={`extraction-block-${block.index}`}
                aria-label={`Extracted text for block ${block.index}`}
                value={drafts[block.index] ?? block.text}
                onChange={(event) => setDrafts((current) => ({ ...current, [block.index]: event.target.value }))}
                disabled={review.is_reviewed || approveMutation.isPending}
                rows={Math.max(3, block.text.split('\n').length + 1)}
                className="mt-1.5 w-full resize-y rounded-xl border border-[#D7E4F2] px-3 py-2.5 text-sm leading-6 text-[#0C2B49] outline-none focus:border-[#0985E7] disabled:bg-[#F8FBFF]"
              />
            </section>
          ))}
        </main>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
            <h2 className="font-black text-[#0C2B49]">Extraction facts</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div><dt className="font-bold text-[#64748b]">Engine</dt><dd className="text-[#0C2B49]">{review.engine}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Pages</dt><dd className="text-[#0C2B49]">{review.page_count}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Average confidence</dt><dd className="text-[#0C2B49]">{review.confidence_avg === null || review.confidence_avg === undefined ? 'Not reported' : `${Math.round(review.confidence_avg * 100)}%`}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Edited blocks</dt><dd className="text-[#0C2B49]">{review.edited_block_count}</dd></div>
              <div><dt className="font-bold text-[#64748b]">Status</dt><dd className="capitalize text-[#0C2B49]">{review.status.replaceAll('_', ' ')}</dd></div>
            </dl>
          </section>

          <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
            <h2 className="font-black text-[#0C2B49]">Review actions</h2>
            <p className="mt-2 text-xs leading-5 text-[#64748b]">Semantic analysis is optional and may add more issues for review.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={edits.length === 0 || mutationPending || review.is_reviewed}
                onClick={() => saveMutation.mutate(edits)}
                className="rounded-full bg-[#0985E7] px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
              >
                {saveMutation.isPending ? 'Saving changes…' : 'Save changes'}
              </button>
              <button
                type="button"
                disabled={edits.length > 0 || mutationPending || review.is_reviewed}
                onClick={() => analyzeMutation.mutate()}
                className="rounded-full border border-[#0985E7] px-4 py-2.5 text-sm font-black text-[#0985E7] disabled:opacity-40"
              >
                {analyzeMutation.isPending ? 'Analyzing semantic issues…' : 'Analyze semantic issues'}
              </button>
              <button
                type="button"
                disabled={mutationPending || review.is_reviewed || edits.length > 0}
                onClick={confirmApproval}
                className="rounded-full bg-[#0C2B49] px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
              >
                {approveMutation.isPending ? 'Approving reviewed text…' : 'Approve reviewed text'}
              </button>
            </div>
            {edits.length > 0 && <p className="mt-3 text-xs font-semibold text-[#B77900]">Save changes before analysis or approval.</p>}
            {review.is_reviewed && <p className="mt-3 text-xs font-semibold text-[#12A150]">Reviewed text is approved and frozen.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
