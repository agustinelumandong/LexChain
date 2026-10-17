// @vitest-environment jsdom
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProcessingPage from '@/features/documents/pages/upload-processing-page';

function documentResponse(status: string, lifecycle = 'FINALIZED') {
  return Response.json({ document_id: 'doc-1', lifecycle, status });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const searchParams = Object.assign(Promise.resolve({ id: 'doc-1' }), {
    status: 'fulfilled',
    value: { id: 'doc-1' },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading route…</p>}>
        <ProcessingPage searchParams={searchParams} />
      </Suspense>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('ProcessingPage', () => {
  it('shows document loading before its lifecycle is known', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    renderPage();
    expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Loading document…');
    expect(screen.queryByText('Processing your document...')).toBeNull();
  });

  it.each([
    ['PREPARING', 'Preparing', 'queued_for_embeddings'],
    ['READY_FOR_SIGNATURE', 'Ready for signature', 'FAILED'],
    ['SIGNED', 'Signed', 'AWAITING_REVIEW'],
  ])('waits for finalization before showing OCR status (%s)', async (lifecycle, label, status) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(documentResponse(status, lifecycle))
      .mockResolvedValue(documentResponse('AWAITING_REVIEW'));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    expect(await screen.findByText(`Lifecycle: ${label}`)).toBeTruthy();
    expect(screen.getByText('OCR processing starts after the document is finalized.')).toBeTruthy();
    expect(screen.queryByText(/Current status:/)).toBeNull();
    expect(screen.queryByText('Processing failed')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(await screen.findByRole('link', { name: 'Review extracted text' }, { timeout: 3_000 })).toBeTruthy();
    expect(screen.getByText('Lifecycle: Finalized')).toBeTruthy();
  });

  it('links the live awaiting-review status to the extracted-text review route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(documentResponse('AWAITING_REVIEW')));
    renderPage();

    const link = await screen.findByRole('link', { name: 'Review extracted text' });
    expect(link.getAttribute('href')).toBe('/portal/documents/doc-1/review');
  });

  it('links review-ready documents to the extracted-text review route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(documentResponse('ready_for_review')));
    renderPage();

    const link = await screen.findByRole('link', { name: 'Review extracted text' });
    expect(link.getAttribute('href')).toBe('/portal/documents/doc-1/review');
  });

  it('does not show an invented progress bar or promise a generated summary', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(documentResponse('processing')));
    const { container } = renderPage();

    expect(await screen.findByText('Current status: Processing')).toBeTruthy();
    expect(container.querySelector('.w-2\\/3')).toBeNull();
    expect(screen.queryByText(/summary will appear here/i)).toBeNull();
  });

  it('keeps polling an unfamiliar status instead of claiming completion', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(documentResponse('queued_for_embeddings'))
      .mockResolvedValue(documentResponse('ready_for_review'));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    expect(await screen.findByText('Current status: Unknown')).toBeTruthy();
    expect(screen.queryByText('Document ready')).toBeNull();
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2), { timeout: 3_000 });
    expect(await screen.findByRole('link', { name: 'Review extracted text' })).toBeTruthy();
  });

  it('keeps a status lookup failure retryable without claiming document processing failed', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ message: 'Status service is unavailable.' }, { status: 503 }))
      .mockResolvedValue(documentResponse('processing'));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    expect(await screen.findByText('Unable to check document status')).toBeTruthy();
    expect(screen.getByText('Status service is unavailable.')).toBeTruthy();
    expect(screen.queryByText('Processing failed')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Try Again' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Retry status check' }));
    expect(await screen.findByText('Current status: Processing')).toBeTruthy();
  });

  it('links finalized processing failures to the document without upload recovery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(documentResponse('failed')));
    renderPage();

    expect(await screen.findByText('Processing failed')).toBeTruthy();
    expect(screen.getByText('Lifecycle: Finalized')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View document' }).getAttribute('href')).toBe('/portal/documents/doc-1');
    expect(screen.queryByText(/try uploading again/i)).toBeNull();
    expect(document.querySelector('a[href="/portal/upload"]')).toBeNull();
    expect(screen.queryByRole('button', { name: /finalize/i })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry status check' })).toBeNull();
  });

  it('describes a completed document without promising an optional summary', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(documentResponse('completed')));
    renderPage();

    expect(await screen.findByText('Processing is complete. Open the document to review the available details.')).toBeTruthy();
    expect(screen.queryByText(/summary/i)).toBeNull();
  });
});
