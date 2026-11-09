// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ApiSchema } from '@/shared/types/index';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PdfDocumentViewer, { normalizedBoxStyle } from '@/features/documents/components/pdf-document-viewer';

const pdfMocks = vi.hoisted(() => ({
  getDocument: vi.fn(),
  getPage: vi.fn(),
  render: vi.fn(),
  getTextContent: vi.fn(),
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
    hoveredBlockIndex: null,
    onPageChange: vi.fn(),
    onSelectBlock: vi.fn(),
    onHoverBlockChange: vi.fn(),
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
  pdfMocks.getTextContent.mockResolvedValue({ items: [{ str: 'Accessible document text' }] });
  pdfMocks.getPage.mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 1000 * scale, height: 1400 * scale }),
    render: pdfMocks.render,
    getTextContent: pdfMocks.getTextContent,
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

  it('rejects reversed bbox coordinates', () => {
    expect(normalizedBoxStyle([500, 200, 100, 800])).toBeUndefined();
  });
});

describe('PdfDocumentViewer', () => {
  it('shows loading until the PDF page has rendered and does not invent a page count', async () => {
    let finishRender!: () => void;
    pdfMocks.render.mockReturnValue({ promise: new Promise<void>((resolve) => { finishRender = resolve; }), cancel: vi.fn() });
    renderViewer({ pageCount: undefined });

    expect(screen.getByRole('status').textContent).toContain('Loading PDF');
    expect(screen.queryByText('of')).toBeNull();
    await waitFor(() => expect(pdfMocks.render).toHaveBeenCalled());
    expect(screen.getByRole('status').textContent).toContain('Loading PDF');
    finishRender();
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.getByText('of')).toBeTruthy();
  });

  it('keeps page and zoom controls in a toolbar above the scrollable PDF content', () => {
    renderViewer();

    const toolbar = screen.getByRole('toolbar', { name: 'PDF controls' });
    const pageContent = screen.getByLabelText('PDF page');
    const viewer = screen.getByRole('region', { name: 'Source PDF' });
    expect(viewer.className).toContain('md:flex-1');
    expect(viewer.className).toContain('min-h-0');
    expect(toolbar.contains(screen.getByRole('button', { name: 'Previous PDF page' }))).toBe(true);
    expect(toolbar.contains(screen.getByRole('button', { name: 'Zoom out' }))).toBe(true);
    expect(toolbar.contains(screen.getByRole('button', { name: 'Zoom in' }))).toBe(true);
    expect(toolbar.nextElementSibling).toBe(pageContent);
    expect(pageContent.className).toContain('flex-1');
    expect(pageContent.className).toContain('overflow-auto');
  });

  it('centers the PDF overlay wrapper and uses compact accessible zoom buttons', async () => {
    renderViewer();

    const canvas = screen.getByLabelText('PDF page').querySelector('canvas');
    expect(canvas).toBeTruthy();
    const overlayWrapper = canvas?.parentElement;
    expect(overlayWrapper?.className).toContain('mx-auto');
    expect(overlayWrapper?.className).toContain('w-fit');
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeTruthy();
  });

  it('renders at 85% of the fit-to-pane scale and rerenders when zoomed', async () => {
    renderViewer();

    await waitFor(() => expect(pdfMocks.render).toHaveBeenCalled());
    expect(pdfMocks.render.mock.calls.at(-1)?.[0].viewport.width).toBe(425);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    await waitFor(() => expect(pdfMocks.render).toHaveBeenCalledTimes(2));
    expect(pdfMocks.render.mock.calls.at(-1)?.[0].viewport.width).toBe(475);
  });

  it('selects editable overlays and requests the next zero-based page', async () => {
    const { onPageChange, onSelectBlock } = renderViewer();

    fireEvent.click(await screen.findByRole('button', { name: 'Select block 4' }));
    expect(onSelectBlock).toHaveBeenCalledWith(4);
    fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('uses thin default borders and temporary hover highlighting without changing selection', async () => {
    const { onHoverBlockChange } = renderViewer();
    const overlay = await screen.findByRole('button', { name: 'Select block 4' });

    expect(overlay.className).toContain('border border-blue-400');
    fireEvent.mouseEnter(overlay);
    expect(onHoverBlockChange).toHaveBeenCalledWith(4);
    fireEvent.mouseLeave(overlay);
    expect(onHoverBlockChange).toHaveBeenLastCalledWith(null);

    renderViewer({ selectedBlockIndex: 4, hoveredBlockIndex: 4 });
    expect((await screen.findAllByRole('button', { name: 'Select block 4' }))[1].className).toContain('border-2 border-blue-700');
  });

  it('marks tampered blocks with the existing red overlay', async () => {
    renderViewer({ tamperedBlockIndexes: new Set([4]) });

    expect((await screen.findByRole('button', { name: 'Select block 4' })).className)
      .toContain('border-2 border-[#B42318]');
  });

  it('marks read-only tampered blocks with a red, non-interactive region', async () => {
    renderViewer({ blocks: [{ ...blocks[0], editable: false }], tamperedBlockIndexes: new Set([4]) });

    const overlay = await screen.findByRole('region', { name: 'Changed block 4' });
    expect(overlay.className).toContain('border-2 border-[#B42318]');
    expect(screen.queryByRole('button', { name: 'Select block 4' })).toBeNull();
  });

  it('labels tampered regions without a backend block index as regions', async () => {
    renderViewer({ blocks: [{ ...blocks[0], index: -1, editable: false }], tamperedBlockIndexes: new Set([-1]) });

    expect(await screen.findByRole('region', { name: 'Changed region 1' })).toBeTruthy();
  });

  it('cross-highlights editable overlays while keyboard focused', async () => {
    const { onHoverBlockChange } = renderViewer();
    const overlay = await screen.findByRole('button', { name: 'Select block 4' });

    fireEvent.focus(overlay);
    expect(onHoverBlockChange).toHaveBeenCalledWith(4);
    fireEvent.blur(overlay);
    expect(onHoverBlockChange).toHaveBeenLastCalledWith(null);
  });

  it('omits null bboxes and renders non-editable bboxes as dashed regions', async () => {
    const { onHoverBlockChange } = renderViewer({
      blocks: [
        { ...blocks[0], bbox: null },
        { ...blocks[0], index: 5, editable: false },
      ],
    });

    const nonEditableOverlay = await screen.findByLabelText('Non-editable block 5');
    expect(nonEditableOverlay.className).toContain('border-dashed');
    fireEvent.mouseEnter(nonEditableOverlay);
    expect(onHoverBlockChange).toHaveBeenCalledWith(5);
    fireEvent.mouseLeave(nonEditableOverlay);
    expect(onHoverBlockChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole('button', { name: 'Select block 4' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Select block 5' })).toBeNull();
  });

  it('treats an omitted editable flag as editable', async () => {
    const blockWithoutEditable: Partial<ExtractionBlock> = { ...blocks[0] };
    delete blockWithoutEditable.editable;
    renderViewer({ blocks: [blockWithoutEditable as ExtractionBlock] });

    expect(await screen.findByRole('button', { name: 'Select block 4' })).toBeTruthy();
    expect(screen.queryByLabelText('Non-editable block 4')).toBeNull();
  });

  it('exposes each continuous PDF page text to screen readers', async () => {
    renderViewer({ continuous: true });
    const firstPage = await screen.findByRole('group', { name: 'PDF page 1' });
    await waitFor(() => expect(firstPage.textContent).toContain('Accessible document text'));
  });

  it('explains when a PDF page has no extractable text', async () => {
    pdfMocks.getTextContent.mockResolvedValue({ items: [] });
    renderViewer({ continuous: true });
    expect((await screen.findAllByText(/No extractable text is available on this page/)).length).toBe(2);
  });

  it('reports when extracting text for a screen reader fails', async () => {
    pdfMocks.getTextContent.mockRejectedValue(new Error('text extraction failed'));
    renderViewer({ continuous: true });
    expect((await screen.findAllByText('Text could not be extracted from this page for screen readers.')).length).toBe(2);
  });

  it('reports reaching the end only after all pages render and the user scrolls there', async () => {
    const onReachedEnd = vi.fn();
    renderViewer({ continuous: true, onReachedEnd });
    const pages = screen.getByLabelText('PDF pages');
    Object.defineProperties(pages, { clientHeight: { value: 500 }, scrollHeight: { value: 1500 }, scrollTop: { value: 0, writable: true } });
    await waitFor(() => expect(pdfMocks.render).toHaveBeenCalledTimes(2));
    expect(onReachedEnd).not.toHaveBeenCalled();
    pages.scrollTop = 1000;
    fireEvent.scroll(pages);
    await waitFor(() => expect(onReachedEnd).toHaveBeenCalledTimes(1));
  });

  it('reports a fully rendered short PDF that fits without scrolling', async () => {
    const onReachedEnd = vi.fn();
    renderViewer({ continuous: true, onReachedEnd });
    const pages = screen.getByLabelText('PDF pages');
    Object.defineProperties(pages, { clientHeight: { value: 800 }, scrollHeight: { value: 600 } });
    await waitFor(() => expect(onReachedEnd).toHaveBeenCalledTimes(1));
  });

  it('does not report the end when a page fails to render', async () => {
    const onReachedEnd = vi.fn();
    pdfMocks.render.mockImplementation(() => ({ promise: Promise.reject(new Error('render failed')), cancel: vi.fn() }));
    renderViewer({ continuous: true, onReachedEnd });
    const pages = screen.getByLabelText('PDF pages');
    Object.defineProperties(pages, { clientHeight: { value: 800 }, scrollHeight: { value: 600 } });
    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    fireEvent.scroll(pages);
    expect(onReachedEnd).not.toHaveBeenCalled();
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
