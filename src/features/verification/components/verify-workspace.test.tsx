// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import type { ApiSchema } from '@/shared/types/index';
import VerifyWorkspace from '@/features/verification/components/verify-workspace';
import { afterEach, describe, expect, it, vi } from 'vitest';

const dynamicMocks = vi.hoisted(() => ({ viewerProps: null as Record<string, unknown> | null }));

vi.mock('next/dynamic', () => ({
  default: () => function MockPdfDocumentViewer(props: Record<string, unknown>) {
    dynamicMocks.viewerProps = props;
    return <div role="region" aria-label="Mock PDF preview" />;
  },
}));

const priceBlock: ApiSchema<'ExtractionBlock'> = {
  index: 3,
  editable: true,
  type: 'text',
  text: 'Price: PHP 10,000,000.00',
  original_text: 'Price: PHP 2,750,000.00',
  bbox: [100, 520, 700, 565],
  page_idx: 0,
  text_level: null,
  score: 0.94,
  is_html: false,
  edited: false,
};

const result = {
  document_id: 'mock-document-5',
  file_name: 'Tampered Deed of Sale.pdf',
  status: 'TAMPERED',
  is_authentic: false,
  baseline_trusted: true,
  onchain_hash: '0xmockdatahash',
  verified_at: '2026-07-20T12:00:00.000Z',
  message: 'Document content differs from the anchored hash.',
  tamper_report: { total_changes: 1, critical_changes: 1, segments: [priceBlock] },
} as ApiSchema<'DocumentVerificationResponse'> & {
  tamper_report: { total_changes: number; critical_changes: number; segments: ApiSchema<'ExtractionBlock'>[] };
};

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  dynamicMocks.viewerProps = null;
});

describe('VerifyWorkspace', () => {
  it('shows the changed PDF region only in mock mode', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace result={result} onRetry={vi.fn()} />);

    expect(screen.getByText('Changed area in PDF')).toBeTruthy();
    expect(screen.getByText(/Blockchain baseline confirmed/)).toBeTruthy();
    expect(screen.getByText('Price: PHP 2,750,000.00')).toBeTruthy();
    expect(screen.getByText('Price: PHP 10,000,000.00')).toBeTruthy();
    expect(dynamicMocks.viewerProps).toMatchObject({
      sourceUrl: '/api/portal/documents/mock-document-5/file?filename=Tampered+Deed+of+Sale.pdf',
      blocks: [priceBlock],
    });
    expect((dynamicMocks.viewerProps?.tamperedBlockIndexes as ReadonlySet<number>).has(3)).toBe(true);
  });

  it('does not render mock tamper previews outside mock mode', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace result={result} onRetry={vi.fn()} />);

    expect(screen.queryByText('Changed area in PDF')).toBeNull();
    expect(dynamicMocks.viewerProps).toBeNull();
  });

  it('does not link to a PDF when the document is not anchored', () => {
    vi.stubEnv('USE_MOCK_API', 'true');
    const notAnchored = { ...result, status: 'NOT_ANCHORED', tamper_report: null };
    render(<VerifyWorkspace result={notAnchored} onRetry={vi.fn()} />);

    expect(screen.queryByRole('link', { name: 'Open current PDF' })).toBeNull();
    expect(screen.getByRole('note').textContent).toContain('Mock verification is simulated');
  });
});
