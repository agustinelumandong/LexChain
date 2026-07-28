// @vitest-environment jsdom
import { Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewPage from './page';

const extractionMocks = vi.hoisted(() => ({ analyze: vi.fn(), approve: vi.fn(), get: vi.fn(), save: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: navigationMocks.replace }) }));
vi.mock('../../../lib/extraction-api', () => ({
  analyzeExtraction: extractionMocks.analyze,
  approveExtraction: extractionMocks.approve,
  getExtractionReview: extractionMocks.get,
  saveExtractionEdits: extractionMocks.save,
}));
vi.mock('./review-workspace', () => ({
  default: (props: {
    actionError: string | null;
    onSave: (edits: ApiSchema<'BlockEdit'>[]) => Promise<unknown>;
    onAnalyze: () => Promise<unknown>;
    onApprove: () => Promise<unknown>;
  }) => (
    <section aria-label="OCR review workspace">
      {props.actionError && <p role="alert">{props.actionError}</p>}
      <button type="button" onClick={() => void props.onSave([{ index: 2, text: 'Corrected OCR output' }]).catch(() => undefined)}>Save workspace changes</button>
      <button type="button" onClick={() => void props.onAnalyze().catch(() => undefined)}>Analyze workspace changes</button>
      <button type="button" onClick={() => void props.onApprove().catch(() => undefined)}>Approve workspace changes</button>
    </section>
  ),
}));

type ExtractionReview = ApiSchema<'ExtractionReviewResponse'>;
type ApproveExtractionResponse = ApiSchema<'ApproveExtractionResponse'>;

const review: ExtractionReview = {
  document_id: 'doc-1', extraction_id: 'extraction-1', status: 'ready_for_review', file_name: 'Review document.pdf',
  storage_url: '/mock-documents/review-document.pdf', engine: 'LexChain OCR', page_count: 2, confidence_avg: 0.88,
  blocks: [{ index: 2, editable: true, type: 'text', text: 'OCR output', original_text: '0CR output', bbox: [80, 200, 920, 290], page_idx: 1, text_level: null, score: 0.61, is_html: false, edited: false }],
  flags: [{ block_index: 2, kind: 'low_confidence', severity: 'high', message: 'Check the low-confidence name.', excerpt: '0CR output' }],
  flag_count: 1, high_severity_count: 1, edited_block_count: 0, is_reviewed: false, reviewed_by: null, reviewed_at: null,
};
const approval: ApproveExtractionResponse = { document_id: 'doc-1', status: 'approved', edited_block_count: 0, content_hash: 'a'.repeat(64), message: 'Extraction review approved.' };
const staleError = Object.assign(new Error('Review state changed'), { status: 409 });
const missingError = Object.assign(new Error('Not found'), { status: 404 });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const params = Object.assign(Promise.resolve({ id: 'doc-1' }), { status: 'fulfilled', value: { id: 'doc-1' } });
  render(<QueryClientProvider client={queryClient}><Suspense fallback={<p>Loading route…</p>}><ReviewPage params={params} /></Suspense></QueryClientProvider>);
  return { invalidate, queryClient };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ role: 'document_issuer' })));
  extractionMocks.get.mockResolvedValue(review);
  extractionMocks.save.mockResolvedValue(review);
  extractionMocks.analyze.mockResolvedValue(review);
  extractionMocks.approve.mockResolvedValue(approval);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('ReviewPage', () => {
  it('renders the compare review workspace for an issuer', async () => {
    renderPage();
    expect(await screen.findByRole('region', { name: 'OCR review workspace' })).toBeTruthy();
  });

  it('replaces cached review flags with the save response before refreshing document data', async () => {
    const savedReview = { ...review, flags: [], flag_count: 0, high_severity_count: 0 };
    extractionMocks.save.mockResolvedValue(savedReview);
    const { invalidate, queryClient } = renderPage();
    await screen.findByRole('region', { name: 'OCR review workspace' });

    fireEvent.click(screen.getByRole('button', { name: 'Save workspace changes' }));

    await waitFor(() => expect(queryClient.getQueryData(['portal-extraction', 'doc-1'])).toEqual(savedReview));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-doc', 'doc-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-doc-status', 'doc-1'] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['portal-extraction', 'doc-1'] });
  });

  it('replaces cached review flags with the analysis response before refreshing document data', async () => {
    const analyzedReview = { ...review, flags: [], flag_count: 0, high_severity_count: 0 };
    extractionMocks.analyze.mockResolvedValue(analyzedReview);
    const { invalidate, queryClient } = renderPage();
    await screen.findByRole('region', { name: 'OCR review workspace' });

    fireEvent.click(screen.getByRole('button', { name: 'Analyze workspace changes' }));

    await waitFor(() => expect(queryClient.getQueryData(['portal-extraction', 'doc-1'])).toEqual(analyzedReview));
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['portal-extraction', 'doc-1'] });
  });

  it('refetches a stale review after a conflicting save and explains the conflict', async () => {
    extractionMocks.save.mockRejectedValue(staleError);
    const { invalidate } = renderPage();
    await screen.findByRole('region', { name: 'OCR review workspace' });

    fireEvent.click(screen.getByRole('button', { name: 'Save workspace changes' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Review state changed. Refreshing the latest review.');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-extraction', 'doc-1'] });
  });

  it('describes a missing initial review without claiming the document was deleted', async () => {
    extractionMocks.get.mockRejectedValue(missingError);
    renderPage();

    expect((await screen.findByRole('alert')).textContent).toContain('This review is not ready or you no longer have access');
    expect(screen.getByRole('link', { name: 'Back to document' }).getAttribute('href')).toBe('/portal/documents/doc-1');
    expect(screen.getByRole('link', { name: 'View processing status' }).getAttribute('href')).toBe('/portal/upload/processing?id=doc-1');
  });

  it('waits for approval invalidations before replacing the review route', async () => {
    let resolve!: () => void;
    const pendingInvalidation = new Promise<void>((finish) => { resolve = finish; });
    const { invalidate } = renderPage();
    invalidate.mockReturnValue(pendingInvalidation);
    await screen.findByRole('region', { name: 'OCR review workspace' });

    fireEvent.click(screen.getByRole('button', { name: 'Approve workspace changes' }));

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-extraction', 'doc-1'] }));
    expect(navigationMocks.replace).not.toHaveBeenCalled();
    await act(async () => resolve());
    await waitFor(() => expect(navigationMocks.replace).toHaveBeenCalledWith('/portal/upload/processing?id=doc-1'));
  });
});
