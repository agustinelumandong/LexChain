// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentVerifyPage from '@/features/documents/pages/documents-id-verify-page';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'doc-1' }) }));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

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
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DocumentVerifyPage', () => {
  const verification = (status: string, isAuthentic: boolean, baselineTrusted: boolean) => ({
    document_id: 'doc-1',
    status,
    is_authentic: isAuthentic,
    baseline_trusted: baselineTrusted,
    onchain_hash: 'on-chain-hash',
    snapshot_hash: 'snapshot-hash',
    current_hash: 'current-hash',
    tx_hash: 'transaction-hash',
    onchain_timestamp: 1_760_000_000,
    issued_by: null,
    finalized_at: '2026-10-07T10:00:00Z',
    verified_at: '2026-10-08T10:00:00Z',
    message: `${status} verification message.`,
  });

  it('auto-starts verification on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', true, true)));
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

  it('shows tampering as distinct from a compromised snapshot without an undocumented report', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('TAMPERED', false, true))));
    renderPage();
    expect(await screen.findByText('Document was tampered with')).toBeTruthy();
    expect(screen.getAllByText('on-chain-hash').length).toBeGreaterThan(0);
    expect(screen.getAllByText('current-hash').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull();
  });

  it('fails closed when AUTHENTIC conflicts with is_authentic=false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification('AUTHENTIC', false, true))));
    renderPage();

    expect(await screen.findByText('Integrity status unavailable')).toBeTruthy();
    expect(screen.queryByText('Document is authentic')).toBeNull();
  });

  it.each([
    ['AUTHENTIC', true, true, 'Document is authentic'],
    ['NOT_ANCHORED', false, false, 'Document is not anchored'],
    ['VERIFICATION_UNAVAILABLE', false, true, 'Integrity status unavailable'],
    ['SNAPSHOT_COMPROMISED', false, false, 'Trusted snapshot is compromised'],
  ])('preserves the %s verification verdict', async (status, authentic, baseline, heading) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(verification(status, authentic, baseline))));
    renderPage();
    expect(await screen.findByText(heading)).toBeTruthy();
  });

  it('labels a failed verification request separately from a backend tamper verdict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ detail: 'Gateway unavailable' }, { status: 503 })));
    renderPage();

    expect(await screen.findByText('Verification request failed')).toBeTruthy();
    expect(screen.queryByText('Document was tampered with')).toBeNull();
    expect(screen.queryByText('Integrity status unavailable')).toBeNull();
  });

  it('explains a 404 as a missing or unanchored document without offering a retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ detail: 'Document not found' }, { status: 404 })));
    renderPage();

    expect(await screen.findByText('Document not found or no on-chain record')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry verification' })).toBeNull();
  });
});
