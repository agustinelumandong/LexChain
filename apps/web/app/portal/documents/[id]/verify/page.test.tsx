// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocumentVerifyPage from './page';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'doc-1' }) }));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DocumentVerifyPage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DocumentVerifyPage', () => {
  it('auto-starts verification on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      status: 'AUTHENTIC', is_authentic: true, message: 'Document matches the anchored hash.',
    }));
    vi.stubGlobal('fetch', fetchMock);

    renderPage();
    expect(await screen.findByText('Document is authentic')).toBeTruthy();
    expect(fetchMock.mock.calls[0]?.[0]).toContain(encodeURIComponent('/documents/doc-1/verify'));
  });

  it('shows a skeleton while verification is pending', () => {
    vi.stubGlobal('fetch', () => new Promise(() => undefined));
    renderPage();
    expect(screen.getByRole('status', { name: 'Verifying document integrity' })).toBeTruthy();
  });

  it('renders the server tamper report instead of a generic warning', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'TAMPERED', is_authentic: false, message: 'Hash mismatch.', storage_url: 'https://example.test/deed.pdf', page_count: 1, blocks: [], tamper_report: { total_changes: 1, critical_changes: 1, similarity: 0.98, localized: false, segments: [{ type: 'replace', severity: 'critical', reason: 'Amount changed', original_text: 'PHP 500', current_text: 'PHP 50', original_line_start: 1, original_line_end: 1, current_line_start: 1, current_line_end: 1, block_index: null, page_idx: null, word_diff: [] }] } })));
    renderPage();
    expect(await screen.findByText('Document was tampered with')).toBeTruthy();
    expect(screen.getByText(/Amount changed/)).toBeTruthy();
    expect(screen.getByText(/text only/i)).toBeTruthy();
  });
});
