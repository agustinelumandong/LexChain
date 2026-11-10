'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import type { ApiSchema } from '@/shared/types/index';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { CSSProperties } from 'react';

export type PdfDocumentViewerProps = {
  sourceUrl: string;
  watermarkText?: string;
  continuous?: boolean;
  pageCount?: number;
  currentPage: number;
  blocks: ApiSchema<'ExtractionBlock'>[];
  selectedBlockIndex: number | null;
  hoveredBlockIndex: number | null;
  revealRequest?: { blockIndex: number; id: number } | null;
  tamperedBlockIndexes?: ReadonlySet<number>;
  onPageChange: (pageIndex: number) => void;
  onSelectBlock: (blockIndex: number) => void;
  onHoverBlockChange: (blockIndex: number | null) => void;
  onLoadChange?: (loading: boolean) => void;
  onReachedEnd?: () => void;
};

const DEFAULT_ZOOM = 0.85;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

function ContinuousPdfPage({
  pdf,
  pageNumber,
  availableWidth,
  zoom,
  watermarkText,
  scrollRootRef,
  onPageRender,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  availableWidth: number;
  zoom: number;
  watermarkText?: string;
  scrollRootRef: { current: HTMLDivElement | null };
  onPageRender: (pdf: PDFDocumentProxy, pageNumber: number, success: boolean) => void;
}) {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageResult, setPageResult] = useState<{
    pdf: PDFDocumentProxy;
    page: PDFPageProxy;
    width: number;
    height: number;
  } | null>(null);
  const [pageText, setPageText] = useState<string | null | undefined>(undefined);
  const [nearViewport, setNearViewport] = useState(false);
  const [pageLoadFailed, setPageLoadFailed] = useState(false);
  const [failedRenderKey, setFailedRenderKey] = useState<string | null>(null);
  const page = pageResult?.pdf === pdf ? pageResult : null;
  const renderKey = `${pageNumber}:${availableWidth}:${zoom}`;

  useEffect(() => {
    let disposed = false;

    void pdf.getPage(pageNumber).then((loadedPage) => {
      if (disposed) return;
      const viewport = loadedPage.getViewport({ scale: 1 });
      setPageResult({ pdf, page: loadedPage, width: viewport.width, height: viewport.height });
      void loadedPage.getTextContent().then((content) => {
        if (!disposed) setPageText(content.items.map((item) => 'str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : '').join('').trim());
      }).catch(() => { if (!disposed) setPageText(null); });
    }).catch(() => {
      if (!disposed) { setPageLoadFailed(true); onPageRender(pdf, pageNumber, false); }
    });

    return () => {
      disposed = true;
    };
  }, [pageNumber, pdf, onPageRender]);

  useEffect(() => {
    const pageContainer = pageContainerRef.current;
    const scrollRoot = scrollRootRef.current;
    if (!pageContainer || !scrollRoot || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setNearViewport(entry?.isIntersecting ?? false);
    }, { root: scrollRoot, rootMargin: '150% 0px' });
    observer.observe(pageContainer);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!page || !canvas || !nearViewport || availableWidth <= 0) return;

    let disposed = false;
    let renderTask: RenderTask | undefined;

    void (async () => {
      try {
        const scale = availableWidth / page.width * zoom;
        const viewport = page.page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTask = page.page.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        await renderTask.promise;
        if (!disposed) onPageRender(pdf, pageNumber, true);
      } catch {
        if (!disposed) { setFailedRenderKey(renderKey); onPageRender(pdf, pageNumber, false); }
      }
    })();

    return () => {
      disposed = true;
      renderTask?.cancel();
    };
  }, [availableWidth, nearViewport, page, renderKey, zoom, onPageRender, pdf, pageNumber]);

  return (
    <div
      ref={pageContainerRef}
      role="group"
      aria-label={`PDF page ${pageNumber}`}
      className="relative mx-auto shrink-0 bg-white shadow-sm"
      style={page ? {
        width: availableWidth > 0 ? `${availableWidth * zoom}px` : '100%',
        aspectRatio: `${page.width} / ${page.height}`,
      } : { width: '100%', minHeight: '24rem' }}
    >
      {pageLoadFailed ? (
        <p role="alert" className="p-4 text-sm text-[#B42318]">Page {pageNumber} could not be loaded.</p>
      ) : failedRenderKey === renderKey ? (
        <p role="alert" className="p-4 text-sm text-[#B42318]">Page {pageNumber} could not be rendered.</p>
      ) : nearViewport ? (
        <canvas ref={canvasRef} aria-hidden="true" className="block" />
      ) : null}
      {pageText ? <p className="sr-only whitespace-pre-wrap">{pageText}</p> : pageText === '' ? <p className="p-2 text-sm text-[#4B6382]">No extractable text is available on this page. Scanned images cannot be read by a screen reader.</p> : pageText === null ? <p className="p-2 text-sm text-[#B42318]">Text could not be extracted from this page for screen readers.</p> : null}
      {watermarkText && nearViewport && !pageLoadFailed && failedRenderKey !== renderKey && <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
        <span className="select-none -rotate-[35deg] whitespace-nowrap text-[clamp(1.75rem,7vw,4.5rem)] font-black tracking-[0.12em] text-[#0C2B49]/15">{watermarkText}</span>
      </div>}
    </div>
  );
}

type PanStart = {
  pointerId: number;
  x: number;
  y: number;
  scrollLeft: number;
  scrollTop: number;
};

export function normalizedBoxStyle(bbox?: number[] | null): CSSProperties | undefined {
  if (
    !bbox
    || bbox.length !== 4
    || bbox.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)
  ) return undefined;

  const [x0, y0, x1, y1] = bbox;
  if (x1 <= x0 || y1 <= y0) return undefined;

  return {
    left: `${x0 / 10}%`,
    top: `${y0 / 10}%`,
    width: `${(x1 - x0) / 10}%`,
    height: `${(y1 - y0) / 10}%`,
  };
}

function scrollOverlayIntoView(wrapper: HTMLElement, overlay: HTMLElement) {
  // A hidden pane (phone layout) measures zero and has nothing to scroll.
  if (wrapper.clientHeight <= 0) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();
  const isInView = overlayRect.top >= wrapperRect.top
    && overlayRect.bottom <= wrapperRect.top + wrapper.clientHeight
    && overlayRect.left >= wrapperRect.left
    && overlayRect.right <= wrapperRect.left + wrapper.clientWidth;
  if (isInView) return;

  wrapper.scrollTo({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    left: Math.max(0, overlayRect.left - wrapperRect.left + wrapper.scrollLeft + overlayRect.width / 2 - wrapper.clientWidth / 2),
    top: Math.max(0, overlayRect.top - wrapperRect.top + wrapper.scrollTop + overlayRect.height / 2 - wrapper.clientHeight / 2),
  });
}

export default function PdfDocumentViewer({
  sourceUrl,
  watermarkText,
  continuous = false,
  pageCount,
  currentPage,
  blocks,
  selectedBlockIndex,
  hoveredBlockIndex,
  revealRequest,
  tamperedBlockIndexes,
  onPageChange,
  onSelectBlock,
  onHoverBlockChange,
  onLoadChange,
  onReachedEnd,
}: PdfDocumentViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panStart = useRef<PanStart | null>(null);
  const handledRevealRequest = useRef<PdfDocumentViewerProps['revealRequest']>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [loadResult, setLoadResult] = useState<{
    sourceUrl: string;
    pdf: PDFDocumentProxy | null;
    failed: boolean;
  }>({ sourceUrl, pdf: null, failed: false });
  const renderKey = `${sourceUrl}:${currentPage}:${zoom}`;
  const [failedRenderKey, setFailedRenderKey] = useState<string | null>(null);
  const [renderedKey, setRenderedKey] = useState<string | null>(null);
  const pdf = loadResult.sourceUrl === sourceUrl ? loadResult.pdf : null;
  const displayedPageCount = pageCount ?? pdf?.numPages ?? 1;
  const renderFailed = loadResult.sourceUrl === sourceUrl && loadResult.failed
    || failedRenderKey === renderKey;
  const canPan = !continuous && zoom > DEFAULT_ZOOM;
  const [renderedPages, setRenderedPages] = useState<{ pdf: PDFDocumentProxy; pages: Set<number> } | null>(null);
  const reportedEnd = useRef<PDFDocumentProxy | null>(null);
  const recordPageRender = useCallback((renderedPdf: PDFDocumentProxy, pageNumber: number, success: boolean) => {
    setRenderedPages((previous) => {
      const pages = previous?.pdf === renderedPdf ? new Set(previous.pages) : new Set<number>();
      if (pages.has(pageNumber) === success) return previous?.pdf === renderedPdf ? previous : { pdf: renderedPdf, pages };
      if (success) pages.add(pageNumber); else pages.delete(pageNumber);
      return { pdf: renderedPdf, pages };
    });
  }, []);
  const checkReachedEnd = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!continuous || !onReachedEnd || !pdf || reportedEnd.current === pdf || renderedPages?.pdf !== pdf || renderedPages.pages.size !== pdf.numPages || !wrapper || wrapper.clientHeight <= 0 || wrapper.scrollHeight <= 0) return;
    if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 1) {
      reportedEnd.current = pdf;
      onReachedEnd();
    }
  }, [continuous, onReachedEnd, pdf, renderedPages]);
  useEffect(() => { checkReachedEnd(); }, [checkReachedEnd]);


  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canPan || event.pointerType === 'touch' || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return;

    panStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const start = panStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    event.currentTarget.scrollLeft = start.scrollLeft - (event.clientX - start.x);
    event.currentTarget.scrollTop = start.scrollTop - (event.clientY - start.y);
  }

  function stopPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (panStart.current?.pointerId !== event.pointerId) return;

    panStart.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry?.contentRect.width ?? 0);
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;
    let loadingTask: PDFDocumentLoadingTask | undefined;

    void (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
        loadingTask = pdfjs.getDocument(sourceUrl);
        const loadedPdf = await loadingTask.promise;

        if (disposed) return;
        setLoadResult({ sourceUrl, pdf: loadedPdf, failed: false });
        onLoadChange?.(false);
      } catch {
        if (!disposed) setLoadResult({ sourceUrl, pdf: null, failed: true });
        onLoadChange?.(false);
      }
    })();

    return () => {
      disposed = true;
      void loadingTask?.destroy();
    };
  }, [sourceUrl, onLoadChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!pdf || !canvas || availableWidth <= 0) return;

    let disposed = false;
    let renderTask: RenderTask | undefined;

    void (async () => {
      try {
        const page = await pdf.getPage(currentPage + 1);
        if (disposed) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: availableWidth / unscaledViewport.width * zoom });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTask = page.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        await renderTask.promise;
        if (!disposed) setRenderedKey(renderKey);
      } catch {
        if (!disposed) setFailedRenderKey(renderKey);
      }
    })();

    return () => {
      disposed = true;
      renderTask?.cancel();
    };
  }, [availableWidth, currentPage, pdf, renderKey, zoom]);

  useEffect(() => {
    // Waits for the page to render so a block on another page is measured at its final position.
    if (!revealRequest || renderedKey !== renderKey || handledRevealRequest.current === revealRequest) return;
    handledRevealRequest.current = revealRequest;

    const wrapper = wrapperRef.current;
    const overlay = wrapper?.querySelector<HTMLElement>(`[data-block-overlay="${revealRequest.blockIndex}"]`);
    if (wrapper && overlay) scrollOverlayIntoView(wrapper, overlay);
  }, [renderKey, renderedKey, revealRequest]);

  const pdfRevealPulse = (blockIndex: number) => revealRequest?.blockIndex === blockIndex && (
    <span
      key={revealRequest.id}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-1.5 block rounded-sm opacity-0 ring-4 ring-blue-600/70 motion-safe:animate-[pdf-block-reveal_0.7s_ease-in-out_3]"
    />
  );

  const pageBlocks = blocks.flatMap((block) => {
    if (block.page_idx !== currentPage) return [];
    const style = normalizedBoxStyle(block.bbox);
    return style ? [{ block, style }] : [];
  });

  return (
    <section aria-label="Source PDF" className="flex min-h-0 flex-1 flex-col md:flex-1">
      <div role="toolbar" aria-label="PDF controls" className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#D7E4F2] bg-[#F1F7FC] px-2 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-[#0C2B49] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0067B3]"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
          >
            <ZoomOutOutlinedIcon aria-hidden="true" sx={{ fontSize: 19 }} />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-[#0C2B49] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0067B3]"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
          >
            <ZoomInOutlinedIcon aria-hidden="true" sx={{ fontSize: 19 }} />
          </button>
        </div>
        {continuous ? (
          <span className="border-l border-[#D7E4F2] pl-3 text-xs font-semibold text-[#4B6382]">
            {pdf ? `${pdf.numPages} ${pdf.numPages === 1 ? 'page' : 'pages'}` : 'Loading pages…'}
          </span>
        ) : !pdf && pageCount == null ? (
          <span className="border-l border-[#D7E4F2] pl-3 text-xs font-semibold text-[#4B6382]">{renderFailed ? 'Pages unavailable' : 'Loading pages…'}</span>
        ) : (
          <div className="flex items-center gap-1 border-l border-[#D7E4F2] pl-2">
            <button
              type="button"
              aria-label="Previous PDF page"
              disabled={currentPage <= 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex min-h-9 items-center gap-0.5 rounded-md px-2 text-xs font-semibold text-[#0C2B49] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0067B3]"
            >
              <ChevronLeftIcon aria-hidden="true" sx={{ fontSize: 17 }} />Previous
            </button>
            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[#D7E4F2] bg-white px-2 text-xs text-[#4B6382]">
              <span>Page</span>
              <span className="min-w-6 rounded-sm border border-[#D7E4F2] px-1.5 py-0.5 text-center font-semibold text-[#0C2B49]">{currentPage + 1}</span>
              <span>of</span>
              <span className="font-semibold text-[#0C2B49]">{displayedPageCount}</span>
            </div>
            <button
              type="button"
              aria-label="Next PDF page"
              disabled={currentPage >= displayedPageCount - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex min-h-9 items-center gap-0.5 rounded-md px-2 text-xs font-semibold text-[#0C2B49] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0067B3]"
            >
              Next<ChevronRightIcon aria-hidden="true" sx={{ fontSize: 17 }} />
            </button>
          </div>
        )}
      </div>

      {continuous ? (
        <>
          {renderFailed && <div>
            <p role="alert">The source PDF could not be rendered in this browser.</p>
            <a href={sourceUrl} target="_blank" rel="noreferrer">Open source PDF</a>
          </div>}
          <div
            ref={wrapperRef}
            aria-label="PDF pages"
            tabIndex={0}
            onScroll={checkReachedEnd}
            aria-hidden={renderFailed || undefined}
            className={`pdf-scroll-area min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${renderFailed ? 'hidden' : ''}`}
          >
            {pdf && <div className="overflow-x-auto overflow-y-hidden">
              <div className="mx-auto flex min-w-full w-max flex-col items-center gap-4 px-2 py-2">
                {Array.from({ length: pdf.numPages }, (_, index) => (
                  <ContinuousPdfPage
                    key={`${sourceUrl}:${index + 1}`}
                    pdf={pdf}
                    pageNumber={index + 1}
                    availableWidth={availableWidth}
                    zoom={zoom}
                    watermarkText={watermarkText}
                    scrollRootRef={wrapperRef}
                    onPageRender={recordPageRender}
                  />
                ))}
              </div>
            </div>}
          </div>
        </>
      ) : (
        <>
          {renderFailed ? (
            <div>
              <p role="alert">The source PDF could not be rendered in this browser.</p>
              <a href={sourceUrl} target="_blank" rel="noreferrer">Open source PDF</a>
            </div>
          ) : null}
          <div
            ref={wrapperRef}
            aria-label="PDF page"
            aria-hidden={renderFailed || undefined}
            className={`pdf-scroll-area min-h-0 flex-1 overflow-auto overscroll-contain ${canPan ? isPanning ? 'cursor-grabbing select-none' : 'cursor-grab' : ''} ${renderFailed ? 'hidden' : ''}`}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
          >
            {!renderFailed && renderedKey !== renderKey && (
              <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm font-semibold text-[#4B6382]">
                <span aria-hidden="true" className="size-7 animate-spin rounded-full border-2 border-[#CFE7FC] border-t-[#0067B3] motion-reduce:animate-none" />
                Loading PDF…
              </div>
            )}
            {pdf && pageCount != null && pdf.numPages !== pageCount ? (
              <p role="status">
                PDF page count ({pdf.numPages}) differs from the review record ({pageCount}).
              </p>
            ) : null}
            <div className="relative mx-auto w-fit">
              <canvas ref={canvasRef} className="block" />
              {watermarkText && <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
                <span className="select-none -rotate-[35deg] whitespace-nowrap text-[clamp(1.75rem,7vw,4.5rem)] font-black tracking-[0.12em] text-[#0C2B49]/15">{watermarkText}</span>
              </div>}
              {pageBlocks.map(({ block, style }, pageBlockIndex) => block.editable !== false || tamperedBlockIndexes?.has(block.index) ? (
              <button
                key={`${block.index}-${pageBlockIndex}`}
                type="button"
                aria-label={block.editable === false
                  ? block.index < 0 ? `Changed region ${Math.abs(block.index)}` : `Changed block ${block.index}`
                  : `Select block ${block.index}`}
                data-block-overlay={block.index}
                className={`absolute ${
                  tamperedBlockIndexes?.has(block.index)
                    ? selectedBlockIndex === block.index
                      ? 'z-10 border-2 border-[#B42318] bg-[#B42318]/35 ring-2 ring-[#B42318]/50'
                      : 'border-2 border-[#B42318] bg-[#B42318]/20'
                    : selectedBlockIndex === block.index
                    ? 'border-2 border-blue-700 bg-blue-500/20'
                    : hoveredBlockIndex === block.index
                      ? 'border-2 border-sky-500 bg-sky-400/30'
                      : 'border border-blue-400/30 bg-blue-400/2'
                }`}
                style={style}
                onClick={() => onSelectBlock(block.index)}
                onMouseEnter={() => onHoverBlockChange(block.index)}
                onMouseLeave={() => onHoverBlockChange(null)}
                onFocus={() => onHoverBlockChange(block.index)}
                onBlur={() => onHoverBlockChange(null)}
              >
                {pdfRevealPulse(block.index)}
              </button>
            ) : (
              <div
                key={`${block.index}-${pageBlockIndex}`}
                role="region"
                data-block-overlay={block.index}
                aria-label={`Non-editable block ${block.index}`}
                className={`absolute ${hoveredBlockIndex === block.index
                  ? 'border-2 border-amber-600 bg-amber-400/35'
                  : 'border border-dashed border-amber-500 bg-amber-300/10'}`}
                style={style}
                onMouseEnter={() => onHoverBlockChange(block.index)}
                onMouseLeave={() => onHoverBlockChange(null)}
              >
                {pdfRevealPulse(block.index)}
              </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
