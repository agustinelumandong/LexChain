// @vitest-environment jsdom
import { Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewPage from './page';

const extractionMocks = vi.hoisted(() => ({
  analyze: vi.fn(),
  approve: vi.fn(),
  get: vi.fn(),
  save: vi.fn(),
}));
const navigationMocks = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

vi.mock('../../../lib/extraction-api', () => ({
  analyzeExtraction: extractionMocks.analyze,
  approveExtraction: extractionMocks.approve,
  getExtractionReview: extractionMocks.get,
  saveExtractionEdits: extractionMocks.save,
}));

type ExtractionReview = ApiSchema<'ExtractionReviewResponse'>;
type ApproveExtractionResponse = ApiSchema<'ApproveExtractionResponse'>;

const review: ExtractionReview = {
  document_id: 'doc-1',
  extraction_id: 'extraction-1',
  status: 'ready_for_review',
  file_name: 'Review document.pdf',
  storage_url: '/mock-documents/review-document.pdf',
  engine: 'LexChain OCR',
  page_count: 2,
  confidence_avg: 0.88,
  blocks: [
    {
      index: 1,
      editable: true,
      type: 'text',
      text: 'First block',
      original_text: 'First block',
      bbox: [80, 90, 920, 180],
      page_idx: 0,
      text_level: 1,
      score: 0.97,
      is_html: false,
      edited: false,
    },
    {
      index: 2,
      editable: true,
      type: 'text',
      text: 'OCR output',
      original_text: '0CR output',
      bbox: [80, 200, 920, 290],
      page_idx: 1,
      text_level: null,
      score: 0.61,
      is_html: false,
      edited: false,
    },
  ],
  flags: [
    {
      block_index: 2,
      kind: 'low_confidence',
      severity: 'high',
      message: 'Check the low-confidence name.',
      excerpt: '0CR output',
    },
    {
      block_index: 1,
      kind: 'missing_space',
      severity: 'medium',
      message: 'Check spacing.',
      excerpt: 'First block',
    },
  ],
  flag_count: 2,
  high_severity_count: 1,
  edited_block_count: 0,
  is_reviewed: false,
  reviewed_by: null,
  reviewed_at: null,
};

const approval: ApproveExtractionResponse = {
  document_id: 'doc-1',
  status: 'approved',
  edited_block_count: 0,
  content_hash: 'a'.repeat(64),
  message: 'Extraction review approved.',
};

let profileRole = 'document_issuer';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const params = Object.assign(Promise.resolve({ id: 'doc-1' }), {
    status: 'fulfilled',
    value: { id: 'doc-1' },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading route…</p>}>
        <ReviewPage params={params} />
      </Suspense>
    </QueryClientProvider>,
  );

  return { invalidate, queryClient };
}

function expectReviewInvalidations(invalidate: unknown) {
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-doc', 'doc-1'] });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-doc-status', 'doc-1'] });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portal-extraction', 'doc-1'] });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

beforeEach(() => {
  profileRole = 'document_issuer';
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(Response.json({ role: profileRole }))));
  extractionMocks.get.mockResolvedValue(review);
  extractionMocks.save.mockResolvedValue(review);
  extractionMocks.analyze.mockResolvedValue(review);
  extractionMocks.approve.mockResolvedValue(approval);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('ReviewPage', () => {
  it('renders issuer review blocks, severity groups, and actions', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Review extracted text' })).toBeTruthy();
    expect(screen.getByText('High priority')).toBeTruthy();
    expect((screen.getByLabelText('Extracted text for block 2') as HTMLTextAreaElement).value).toBe('OCR output');
    expect(screen.getByRole('button', { name: 'Approve reviewed text' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'High priority, block 2, flag 1: Check the low-confidence name.' }).getAttribute('aria-current')).toBe('true');
  });

  it('gives duplicate flag messages distinct accessible names with severity, block, and ordinal context', async () => {
    extractionMocks.get.mockResolvedValue({
      ...review,
      flags: [
        { ...review.flags[0], message: 'Check extracted text.' },
        { ...review.flags[0], block_index: 1, message: 'Check extracted text.' },
      ],
    });
    renderPage();

    expect(await screen.findByRole('button', { name: 'High priority, block 2, flag 1: Check extracted text.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'High priority, block 1, flag 2: Check extracted text.' })).toBeTruthy();
  });

  it('keeps participant access read-only and does not fetch the issuer extraction', async () => {
    profileRole = 'document_participant';
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Review unavailable' })).toBeTruthy();
    expect(screen.getByText(/Document Participants can view shared documents, but only Document Issuers can review extracted text/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Approve reviewed text' })).toBeNull();
    expect(extractionMocks.get).not.toHaveBeenCalled();
  });

  it('saves only blocks whose reviewed text changed', async () => {
    const { invalidate } = renderPage();
    const textArea = await screen.findByLabelText('Extracted text for block 2');

    fireEvent.change(textArea, { target: { value: 'Corrected OCR output' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(extractionMocks.save).toHaveBeenCalledWith('doc-1', [
      { index: 2, text: 'Corrected OCR output' },
    ]));
    await waitFor(() => expectReviewInvalidations(invalidate));
  });

  it('shows pending semantic analysis and invalidates review data when it finishes', async () => {
    let finishAnalysis: (value: ExtractionReview) => void = () => undefined;
    extractionMocks.analyze.mockImplementation(() => new Promise<ExtractionReview>((resolve) => {
      finishAnalysis = resolve;
    }));
    const { invalidate } = renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Analyze semantic issues' }));

    const pendingButton = await screen.findByRole('button', { name: 'Analyzing semantic issues…' }) as HTMLButtonElement;
    expect(pendingButton.disabled).toBe(true);
    expect(extractionMocks.analyze).toHaveBeenCalledWith('doc-1');

    await act(async () => finishAnalysis(review));
    await waitFor(() => expectReviewInvalidations(invalidate));
  });

  it('prevents semantic analysis while reviewed text has unsaved edits', async () => {
    renderPage();
    const textArea = await screen.findByLabelText('Extracted text for block 2');

    fireEvent.change(textArea, { target: { value: 'Unsaved correction' } });

    const analyzeButton = screen.getByRole('button', { name: 'Analyze semantic issues' }) as HTMLButtonElement;
    expect(analyzeButton.disabled).toBe(true);
    fireEvent.click(analyzeButton);
    expect(extractionMocks.analyze).not.toHaveBeenCalled();
  });

  it('blocks analysis and approval while a save is pending', async () => {
    const pendingSave = deferred<ExtractionReview>();
    extractionMocks.save.mockReturnValue(pendingSave.promise);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();
    const textArea = await screen.findByLabelText('Extracted text for block 2');

    fireEvent.change(textArea, { target: { value: 'Correction being saved' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect((await screen.findByRole('button', { name: 'Saving changes…' }) as HTMLButtonElement).disabled).toBe(true);
    const analyzeButton = screen.getByRole('button', { name: 'Analyze semantic issues' }) as HTMLButtonElement;
    const approveButton = screen.getByRole('button', { name: 'Approve reviewed text' }) as HTMLButtonElement;
    expect(analyzeButton.disabled).toBe(true);
    expect(approveButton.disabled).toBe(true);
    fireEvent.click(analyzeButton);
    fireEvent.click(approveButton);
    expect(extractionMocks.analyze).not.toHaveBeenCalled();
    expect(extractionMocks.approve).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();

    await act(async () => pendingSave.resolve(review));
  });

  it('blocks save and approval while semantic analysis is pending', async () => {
    const pendingAnalysis = deferred<ExtractionReview>();
    extractionMocks.analyze.mockReturnValue(pendingAnalysis.promise);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Analyze semantic issues' }));
    expect((await screen.findByRole('button', { name: 'Analyzing semantic issues…' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Extracted text for block 2'), { target: { value: 'Draft during analysis' } });

    const saveButton = screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement;
    const approveButton = screen.getByRole('button', { name: 'Approve reviewed text' }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
    expect(approveButton.disabled).toBe(true);
    fireEvent.click(saveButton);
    fireEvent.click(approveButton);
    expect(extractionMocks.save).not.toHaveBeenCalled();
    expect(extractionMocks.approve).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();

    await act(async () => pendingAnalysis.resolve(review));
  });

  it('confirms that approval freezes text and starts processing before approving', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { invalidate } = renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Approve reviewed text' }));

    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/freezes the reviewed text and starts processing/i));
    expect(confirm.mock.calls[0]?.[0]).not.toMatch(/on-chain/i);
    await waitFor(() => expect(extractionMocks.approve).toHaveBeenCalledWith('doc-1'));
    await waitFor(() => expectReviewInvalidations(invalidate));
  });

  it('awaits approval invalidations before replacing review with the processing route', async () => {
    const invalidations = deferred<void>();
    const { invalidate } = renderPage();
    invalidate.mockReturnValue(invalidations.promise);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(await screen.findByRole('button', { name: 'Approve reviewed text' }));

    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(3));
    expect(navigationMocks.replace).not.toHaveBeenCalled();

    await act(async () => invalidations.resolve());
    await waitFor(() => expect(navigationMocks.replace).toHaveBeenCalledWith('/portal/upload/processing?id=doc-1'));
  });

  it('freezes reviewed text and blocks every other mutation while approval is pending', async () => {
    const pendingApproval = deferred<ApproveExtractionResponse>();
    extractionMocks.approve.mockReturnValue(pendingApproval.promise);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Approve reviewed text' }));

    const approveButton = await screen.findByRole('button', { name: 'Approving reviewed text…' }) as HTMLButtonElement;
    const textArea = screen.getByLabelText('Extracted text for block 2') as HTMLTextAreaElement;
    const analyzeButton = screen.getByRole('button', { name: 'Analyze semantic issues' }) as HTMLButtonElement;
    expect(approveButton.disabled).toBe(true);
    expect(textArea.disabled).toBe(true);
    expect(analyzeButton.disabled).toBe(true);
    fireEvent.click(analyzeButton);
    fireEvent.click(approveButton);
    expect(extractionMocks.analyze).not.toHaveBeenCalled();
    expect(extractionMocks.approve).toHaveBeenCalledTimes(1);

    await act(async () => pendingApproval.resolve(approval));
  });

  it('retains local edits when saving fails', async () => {
    extractionMocks.save.mockRejectedValue(new Error('Review could not be saved.'));
    renderPage();
    const textArea = await screen.findByLabelText('Extracted text for block 2') as HTMLTextAreaElement;

    fireEvent.change(textArea, { target: { value: 'Unsaved correction' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('Review could not be saved.');
    expect(textArea.value).toBe('Unsaved correction');
  });

  it('renders profile loading and extraction error states', async () => {
    let finishProfile: (value: Response) => void = () => undefined;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise<Response>((resolve) => {
      finishProfile = resolve;
    })));
    renderPage();

    expect(screen.getByText('Loading review access…')).toBeTruthy();

    extractionMocks.get.mockRejectedValue(new Error('Extraction is not ready.'));
    await act(async () => finishProfile(Response.json({ role: 'document_issuer' })));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('Extraction is not ready.');
  });
});
