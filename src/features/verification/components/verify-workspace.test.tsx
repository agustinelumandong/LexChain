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

const replacement: ApiSchema<'TamperSegment'> = {
  type: 'replace',
  severity: 'critical',
  reason: 'The sale price increased substantially.',
  original_text: 'Price: PHP 2,750,000.00',
  current_text: 'Price: PHP 10,000,000.00',
  original_line_start: 4,
  original_line_end: 4,
  current_line_start: 4,
  current_line_end: 4,
  block_index: 3,
  original_block_index: 3,
  location: 'current',
  bbox: [100, 520, 700, 565],
  page_idx: 0,
  word_diff: [],
};

const deletion: ApiSchema<'TamperSegment'> = {
  type: 'delete',
  severity: 'major',
  reason: 'A clause was removed.',
  original_text: 'The buyer shall pay the transfer tax.',
  current_text: '',
  original_line_start: 8,
  original_line_end: 8,
  current_line_start: 0,
  current_line_end: 0,
  block_index: 8,
  original_block_index: 8,
  location: 'original',
  bbox: [120, 620, 710, 660],
  page_idx: 0,
  word_diff: [],
};

const report: ApiSchema<'TamperReport'> = {
  localized: true,
  total_changes: 2,
  critical_changes: 1,
  replaced: 1,
  inserted: 0,
  deleted: 1,
  similarity: 0.72,
  truncated: false,
  segments: [replacement, deletion],
};

const result: ApiSchema<'DocumentVerificationResponse'> = {
  document_id: 'mock-document-5',
  file_name: 'Tampered Deed of Sale.pdf',
  status: 'TAMPERED',
  is_authentic: false,
  baseline_trusted: true,
  onchain_hash: '0xmockdatahash',
  verified_at: '2026-07-20T12:00:00.000Z',
  message: 'Document content differs from the anchored hash.',
  tamper_report_status: 'AVAILABLE',
  tamper_report: report,
};

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  dynamicMocks.viewerProps = null;
});

describe('VerifyWorkspace', () => {
  it('renders backend comparison details and overlays only current-PDF coordinates', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace result={result} onRetry={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Current PDF' })).toBeTruthy();
    expect(screen.getByText('The sale price increased substantially.')).toBeTruthy();
    expect(screen.getByText(/replace · critical/)).toBeTruthy();
    expect(screen.getByText('Price: PHP 2,750,000.00')).toBeTruthy();
    expect(screen.getByText('Price: PHP 10,000,000.00')).toBeTruthy();
    expect(screen.getByText('The buyer shall pay the transfer tax.')).toBeTruthy();
    expect(screen.getByText('Removed from the current PDF')).toBeTruthy();
    expect(dynamicMocks.viewerProps).toMatchObject({
      sourceUrl: '/api/portal/documents/mock-document-5/file?filename=Tampered+Deed+of+Sale.pdf',
      blocks: [{
        index: 3,
        editable: false,
        type: 'text',
        text: replacement.current_text,
        original_text: replacement.original_text,
        bbox: replacement.bbox,
        page_idx: replacement.page_idx,
      }],
    });
    expect(Array.from(dynamicMocks.viewerProps?.tamperedBlockIndexes as ReadonlySet<number>)).toEqual([3]);
  });

  it('labels mock verification and blockchain baseline as simulated', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.stubEnv('USE_MOCK_API', 'true');
    render(<VerifyWorkspace result={result} onRetry={vi.fn()} />);

    expect(screen.getByRole('note').textContent).toContain('Mock verification is simulated');
    expect(screen.getByRole('status', { name: 'Simulated blockchain anchor status' })).toBeTruthy();
  });

  it('uses unique overlay IDs when a current segment has no extraction block index', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace
      result={{ ...result, tamper_report: { ...report, segments: [
        { ...replacement, block_index: null },
        { ...replacement, block_index: 0 },
      ] } }}
      onRetry={vi.fn()}
    />);

    expect(dynamicMocks.viewerProps).toMatchObject({
      blocks: [
        { index: -1, bbox: replacement.bbox, page_idx: replacement.page_idx },
        { index: 0, bbox: replacement.bbox, page_idx: replacement.page_idx },
      ],
    });
    expect(Array.from(dynamicMocks.viewerProps?.tamperedBlockIndexes as ReadonlySet<number>)).toEqual([-1, 0]);
  });

  it.each(['UNAVAILABLE', 'NOT_APPLICABLE'] as const)(
    'does not render fabricated differences when the report status is %s',
    (tamper_report_status) => {
      vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
      vi.stubEnv('USE_MOCK_API', 'false');
      render(<VerifyWorkspace
        result={{
          ...result,
          tamper_report_status,
          tamper_report: report,
          tamper_report_unavailable_reason: tamper_report_status === 'UNAVAILABLE' ? 'Text comparison failed.' : null,
        }}
        onRetry={vi.fn()}
      />);

      expect(screen.queryByText(replacement.current_text)).toBeNull();
      expect(dynamicMocks.viewerProps).toMatchObject({ blocks: [] });
      if (tamper_report_status === 'UNAVAILABLE') {
        expect(screen.getByText('Text comparison failed.')).toBeTruthy();
      }
      expect(screen.getByRole('heading', { name: 'Document was tampered with' })).toBeTruthy();
    },
  );

  it('warns when the backend truncated the returned change segments', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace result={{ ...result, tamper_report: { ...report, truncated: true } }} onRetry={vi.fn()} />);

    expect(screen.getByText('2 changes returned.')).toBeTruthy();
    expect(screen.getByRole('note').textContent).toContain('Only the listed segments are shown here.');
  });

  it('explains when an available report has no text comparison data', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    render(<VerifyWorkspace result={{ ...result, tamper_report: null }} onRetry={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'Current document' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Comparison details unavailable' })).toBeTruthy();
    expect(screen.getByText(/no extracted-text differences or baseline PDF/i)).toBeTruthy();
    expect(dynamicMocks.viewerProps).toMatchObject({
      sourceUrl: '/api/portal/documents/mock-document-5/file?filename=Tampered+Deed+of+Sale.pdf',
      blocks: [],
    });
  });

  it('does not link to a PDF when the document is not anchored', () => {
    vi.stubEnv('USE_MOCK_API', 'true');
    const notAnchored: ApiSchema<'DocumentVerificationResponse'> = {
      ...result,
      status: 'NOT_ANCHORED',
      baseline_trusted: false,
      tamper_report_status: 'NOT_APPLICABLE',
      tamper_report: null,
    };
    render(<VerifyWorkspace result={notAnchored} onRetry={vi.fn()} />);

    expect(screen.queryByRole('link', { name: 'Open current PDF' })).toBeNull();
    expect(screen.getByRole('note').textContent).toContain('Mock verification is simulated');
  });
});
