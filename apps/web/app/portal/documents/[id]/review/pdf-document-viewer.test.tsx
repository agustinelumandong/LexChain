// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ApiSchema } from '@lexchain/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PdfDocumentViewer, { normalizedBoxStyle } from './pdf-document-viewer';

const pdfMocks = vi.hoisted(() => ({
  getDocument: vi.fn(),
  getPage: vi.fn(),
  render: vi.fn(),
  destroyLoadingTask: vi.fn(),
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: pdfMocks.getDocument,
}));

type ExtractionBlock = ApiSchema<'ExtractionBlock'>;

const blocks: ExtractionBlock[] = [
  {
    index: 4,
    editable: true,
    type: 'text',
    text: 'SERIES OF 2026',
    original_text: 'SERIES OF 2026',
    bbox: [100, 200, 500, 800],
    page_idx: 0,
    text_level: null,
    score: null,
    is_html: false,
    edited: false,
  },
];

class ResizeObserverMock {
  constructor(private callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback([
      { target, contentRect: { width: 500 } } as ResizeObserverEntry,
    ], this as unknown as ResizeObserver);
  }

  disconnect() {}
  unobserve() {}
}

function renderViewer(overrides: Partial<React.ComponentProps<typeof PdfDocumentViewer>> = {}) {
  const props: React.ComponentProps<typeof PdfDocumentViewer> = {
    sourceUrl: '/source.pdf',
    pageCount: 2,
    currentPage: 0,
    blocks,
    selectedBlockIndex: null,
    onPageChange: vi.fn(),
    onSelectBlock: vi.fn(),
    ...overrides,
  };

  render(<PdfDocumentViewer {...props} />);
  return props;
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.stubGlobal('devicePixelRatio', 2);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
  pdfMocks.render.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
  pdfMocks.getPage.mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 1000 * scale, height: 1400 * scale }),
    render: pdfMocks.render,
  });
  pdfMocks.getDocument.mockReturnValue({
    promise: Promise.resolve({
      numPages: 2,
      getPage: pdfMocks.getPage,
    }),
    destroy: pdfMocks.destroyLoadingTask,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('normalizedBoxStyle', () => {
  it('maps each bbox axis independently to percentages', () => {
    expect(normalizedBoxStyle(blocks[0].bbox)).toEqual({
      left: '10%',
      top: '20%',
      width: '40%',
      height: '60%',
    });
  });
});

describe('PdfDocumentViewer', () => {
  it('selects editable overlays and requests the next zero-based page', async () => {
    const { onPageChange, onSelectBlock } = renderViewer();

    fireEvent.click(await screen.findByRole('button', { name: 'Select block 4' }));
    expect(onSelectBlock).toHaveBeenCalledWith(4);
    fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('omits null bboxes and renders non-editable bboxes as dashed regions', async () => {
    renderViewer({
      blocks: [
        { ...blocks[0], bbox: null },
        { ...blocks[0], index: 5, editable: false },
      ],
    });

    expect(await screen.findByLabelText('Non-editable block 5')).toBeTruthy();
    expect(screen.getByLabelText('Non-editable block 5').className).toContain('border-dashed');
    expect(screen.queryByRole('button', { name: 'Select block 4' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Select block 5' })).toBeNull();
  });

  it('shows a source link when the PDF cannot load', async () => {
    pdfMocks.getDocument.mockReturnValue({
      promise: Promise.reject(new Error('load failed')),
      destroy: pdfMocks.destroyLoadingTask,
    });
    renderViewer();

    expect((await screen.findByRole('alert')).textContent).toBe('The source PDF could not be rendered in this browser.');
    const link = screen.getByRole('link', { name: 'Open source PDF' });
    expect(link.getAttribute('href')).toBe('/source.pdf');
    expect(link.getAttribute('target')).toBe('_blank');
  });

});
