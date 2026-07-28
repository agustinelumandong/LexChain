// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ApiSchema } from '@lexchain/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReviewWorkspace from './review-workspace';

const dynamicMocks = vi.hoisted(() => ({
  viewerProps: null as Record<string, unknown> | null,
}));

vi.mock('next/dynamic', () => ({
  default: () => function MockPdfDocumentViewer(props: Record<string, unknown>) {
    dynamicMocks.viewerProps = props;
    return <div>Source PDF viewer</div>;
  },
}));

type ExtractionReview = ApiSchema<'ExtractionReviewResponse'>;

const review: ExtractionReview = {
  document_id: 'doc-1',
  extraction_id: 'extraction-1',
  status: 'ready_for_review',
  file_name: 'Deed.pdf',
  storage_url: '/deed.pdf',
  engine: 'LexChain OCR',
  page_count: 2,
  confidence_avg: 0.88,
  blocks: [
    {
      index: 0,
      editable: true,
      type: 'text',
      text: 'DEED OF ABSOLUTE SALE',
      original_text: 'DEED OF ABSOLUTE SALE',
      bbox: [80, 90, 920, 180],
      page_idx: 0,
      text_level: 1,
      score: 0.97,
      is_html: false,
      edited: false,
    },
    {
      index: 1,
      editable: true,
      type: 'text',
      text: 'Original body',
      original_text: 'Original OCR body',
      bbox: [80, 200, 920, 500],
      page_idx: 1,
      text_level: null,
      score: 0.72,
      is_html: false,
      edited: false,
    },
    {
      index: 2,
      editable: false,
      type: 'image',
      text: '',
      original_text: '',
      bbox: [650, 700, 900, 900],
      page_idx: 1,
      text_level: null,
      score: null,
      is_html: false,
      edited: false,
    },
  ],
  flags: [],
  flag_count: 0,
  high_severity_count: 0,
  edited_block_count: 0,
  is_reviewed: false,
  reviewed_by: null,
  reviewed_at: null,
};

function renderWorkspace(overrides: Partial<React.ComponentProps<typeof ReviewWorkspace>> = {}) {
  const props: React.ComponentProps<typeof ReviewWorkspace> = {
    review,
    actionError: null,
    isSaving: false,
    isAnalyzing: false,
    isApproving: false,
    onSave: vi.fn().mockResolvedValue(review),
    onAnalyze: vi.fn().mockResolvedValue(review),
    onApprove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  return { ...props, ...render(<ReviewWorkspace {...props} />) };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  dynamicMocks.viewerProps = null;
});

describe('ReviewWorkspace', () => {
  it('starts in Compare and preserves the original-versus-reviewed Raw cards', () => {
    const { container } = renderWorkspace();

    expect(screen.getByRole('tab', { name: 'Compare' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('DEED OF ABSOLUTE SALE')).toBeTruthy();
    expect(screen.getByLabelText('Reviewed text for block 1')).toBeTruthy();
    expect(screen.queryByLabelText('Reviewed text for block 2')).toBeNull();
    expect(Array.from(container.querySelectorAll('[data-block-index]'), (block) => block.getAttribute('data-block-index'))).toEqual(['0', '1', '2']);

    fireEvent.click(screen.getByRole('tab', { name: 'Raw' }));
    expect(screen.getByRole('heading', { name: 'Block 0' })).toBeTruthy();
    expect(screen.getAllByText('Original OCR text')).toHaveLength(3);
  });

  it('renders the source viewer beside one continuous review surface with a mobile pane switch', () => {
    renderWorkspace();

    expect(screen.getByText('Source PDF viewer')).toBeTruthy();
    expect(dynamicMocks.viewerProps).toMatchObject({
      sourceUrl: '/deed.pdf',
      pageCount: 2,
      currentPage: 0,
      selectedBlockIndex: null,
    });
    expect(screen.getByRole('button', { name: 'Review pane' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Source pane' }));
    expect(screen.getByRole('button', { name: 'Source pane' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps drafts across tabs and saves only changed editable blocks', async () => {
    const { onSave } = renderWorkspace();

    fireEvent.change(screen.getByLabelText('Reviewed text for block 1'), {
      target: { value: 'Corrected body' },
    });
    expect((screen.getByRole('button', { name: 'Analyze semantic issues' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Approve reviewed text' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Raw' }));
    expect((screen.getByLabelText('Reviewed text for block 1') as HTMLTextAreaElement).value).toBe('Corrected body');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith([{ index: 1, text: 'Corrected body' }]));
  });

  it('retains failed drafts and clears them only after a successful save', async () => {
    const acceptedSave = deferred<ExtractionReview>();
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('save failed'))
      .mockReturnValueOnce(acceptedSave.promise);
    renderWorkspace({ onSave });

    fireEvent.change(screen.getByLabelText('Reviewed text for block 1'), {
      target: { value: 'Corrected body' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Save changes before analysis or approval.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Save changes before analysis or approval.')).toBeTruthy();

    await act(async () => acceptedSave.resolve(review));
    await waitFor(() => expect(screen.queryByText('Save changes before analysis or approval.')).toBeNull());
  });

  it('keeps newer text dirty when an earlier save resolves', async () => {
    const pendingSave = deferred<ExtractionReview>();
    const onSave = vi.fn().mockReturnValue(pendingSave.promise);
    renderWorkspace({ onSave });

    fireEvent.change(screen.getByLabelText('Reviewed text for block 1'), {
      target: { value: 'First correction' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledWith([{ index: 1, text: 'First correction' }]);
    fireEvent.change(screen.getByLabelText('Reviewed text for block 1'), {
      target: { value: 'Newer correction' },
    });

    await act(async () => pendingSave.resolve(review));

    expect((screen.getByLabelText('Reviewed text for block 1') as HTMLTextAreaElement).value).toBe('Newer correction');
    expect(screen.getByText('Save changes before analysis or approval.')).toBeTruthy();
  });

  it('sanitizes tables in Compare and keeps their source editable in Raw', async () => {
    const tableSource = '<table><tbody><tr><td onclick="alert(1)">Amount</td></tr></tbody></table><script>alert(1)</script>';
    const tableBlock: ApiSchema<'ExtractionBlock'> = {
      ...review.blocks[1],
      index: 3,
      text: tableSource,
      original_text: tableSource,
      is_html: true,
    };
    const { container } = renderWorkspace({
      review: { ...review, blocks: [...review.blocks, tableBlock] },
    });

    expect(await screen.findByText('Amount')).toBeTruthy();
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('td')?.getAttribute('onclick')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Edit table in Raw view' }));
    expect(screen.getByRole('tab', { name: 'Raw' }).getAttribute('aria-selected')).toBe('true');
    expect((screen.getByLabelText('Reviewed text for block 3') as HTMLTextAreaElement).value).toBe(tableSource);
  });

  it('blocks every mutation while one is pending and freezes approved text', () => {
    const { rerender, ...props } = renderWorkspace({ isAnalyzing: true });

    expect((screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Analyzing semantic issues…' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Approve reviewed text' }) as HTMLButtonElement).disabled).toBe(true);

    rerender(<ReviewWorkspace {...props} isAnalyzing={false} review={{ ...review, is_reviewed: true }} />);
    expect((screen.getByLabelText('Reviewed text for block 1') as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Analyze semantic issues' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Reviewed text is approved and frozen.')).toBeTruthy();
  });
});
