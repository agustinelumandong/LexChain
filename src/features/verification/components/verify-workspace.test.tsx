// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
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
  metadata_status: 'NOT_ANCHORED',
  needs_restore: false,
  tamper_report_status: 'AVAILABLE',
  tamper_report: report,
};

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  dynamicMocks.viewerProps = null;
});

describe('VerifyWorkspace', () => {
  it('combines matching PDF and record results without a second success banner', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, metadata_status: 'MATCH' }} onRetry={vi.fn()} />);
    const panel = screen.getByRole('region', { name: 'Verification results' });
    expect(within(panel).getByRole('heading', { name: 'PDF unchanged' })).toBeTruthy();
    expect(within(panel).getByRole('heading', { name: 'Document details unchanged' })).toBeTruthy();
    expect(panel.className).toContain('bg-green-50');
    expect(panel.className).toContain('border-green-700');
  });

  it('does not claim authenticity when the returned fingerprints conflict', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, onchain_hash: 'abc', snapshot_hash: 'abc', current_hash: 'def' }} onRetry={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'We could not check this document' })).toBeTruthy();
    expect(screen.getByText(/conflicting verification fields/)).toBeTruthy();
    expect(screen.queryByText('All 3 cryptographic fingerprints match')).toBeNull();
    expect(screen.queryByText(/Verified authentic document/)).toBeNull();
  });
  it('shows altered record fields alongside a matching PDF without a green success panel', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, metadata_status: 'ALTERED', metadata_changes: [{ field: 'document_number', anchored: 12, current: 15 }] }} onRetry={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'PDF unchanged' })).toBeTruthy();
    expect(screen.getByText('Document details changed')).toBeTruthy();
    expect(screen.getByText('document number')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
    const panel = screen.getByRole('region', { name: 'Verification results' });
    expect(within(panel).getByText('Document details changed')).toBeTruthy();
    expect(panel.className).toContain('bg-red-50');
    expect(panel.className).toContain('border-red-700');
  });

  it('names a file name change and shows the original and current values', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, metadata_status: 'ALTERED', metadata_changes: [{ field: 'file_name', anchored: 'Old name', current: 'New name' }] }} onRetry={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'File name changed' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Verification results' }).className).toContain('bg-red-50');
    expect(screen.getByText('At finalization:')).toBeTruthy();
    expect(screen.getByText('Old name')).toBeTruthy();
    expect(screen.getByText('New name')).toBeTruthy();
  });

  it('explains when record integrity cannot be checked', () => {
    render(<VerifyWorkspace result={{ ...result, metadata_status: 'UNAVAILABLE' }} onRetry={vi.fn()} />);
    expect(screen.getByText('Document details could not be checked')).toBeTruthy();
  });

  it('uses a warning color when a matching PDF has an unavailable record check', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, metadata_status: 'UNAVAILABLE' }} onRetry={vi.fn()} />);
    expect(screen.getByRole('region', { name: 'Verification results' }).className).toContain('bg-amber-50');
  });

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
      expect(screen.getByRole('heading', { name: 'This PDF differs from the saved version' })).toBeTruthy();
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

  it('renders a plain-language legal notice stating a match does not prove legal validity (#160)', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    const authenticResult: ApiSchema<'DocumentVerificationResponse'> = {
      ...result,
      status: 'AUTHENTIC',
      is_authentic: true,
      tamper_report_status: 'NOT_APPLICABLE',
      tamper_report: null,
      tx_hash: '0x' + 'a'.repeat(64),
    };
    render(<VerifyWorkspace result={authenticResult} onRetry={vi.fn()} />);

    expect(screen.getByRole('complementary', { name: 'Legal validity notice' })).toBeTruthy();
    expect(screen.getByText(/A match alone does not prove legal validity, notarization, authority, or contract enforceability\./)).toBeTruthy();
    expect(screen.getByText('Its fingerprint matches the blockchain record.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View transaction on Base Sepolia' })).toBeTruthy();
  });

  it('renders split workspace with PDF viewer and download action for authentic documents', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    const authenticResult: ApiSchema<'DocumentVerificationResponse'> = {
      ...result,
      status: 'AUTHENTIC',
      is_authentic: true,
      onchain_hash: '0x1111111111111111111111111111111111111111',
      snapshot_hash: '0x1111111111111111111111111111111111111111',
      current_hash: '0x1111111111111111111111111111111111111111',
      tamper_report_status: 'NOT_APPLICABLE',
      tamper_report: null,
      tx_hash: '0x' + 'a'.repeat(64),
    };
    render(<VerifyWorkspace result={authenticResult} onRetry={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'Current document' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Download PDF/i })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Open current PDF' })).toBeNull();
    expect(screen.getByRole('status', { name: 'Cryptographic hash match' })).toBeTruthy();
    expect(screen.getByText('All 3 cryptographic fingerprints match')).toBeTruthy();
    expect(dynamicMocks.viewerProps).toMatchObject({
      sourceUrl: '/api/portal/documents/mock-document-5/file?filename=Tampered+Deed+of+Sale.pdf',
      blocks: [],
    });
  });

  it('explains a missing file without offering a PDF preview', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'FILE_MISSING', is_authentic: false, current_hash: null }} onRetry={vi.fn()} role="user" />);
    expect(screen.getByText('The document file is missing')).toBeTruthy();
    expect(screen.getByText(/stored document file was deleted/i)).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Current document' })).toBeNull();
  });

  it('warns when an authentic file has an untrusted snapshot', () => {
    render(<VerifyWorkspace result={{ ...result, status: 'AUTHENTIC', is_authentic: true, baseline_trusted: false }} onRetry={vi.fn()} />);
    expect(screen.getByText('This PDF matches, but the saved reference needs attention')).toBeTruthy();
    expect(screen.getByText(/stored snapshot is not trusted and still needs attention/i)).toBeTruthy();
    expect(screen.queryByRole('status', { name: 'Cryptographic hash match' })).toBeNull();
  });

  it('explains unavailable, compromised, and unconfirmed states in plain language (#160)', () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    vi.stubEnv('USE_MOCK_API', 'false');
    const unavailableResult: ApiSchema<'DocumentVerificationResponse'> = {
      ...result,
      status: 'VERIFICATION_UNAVAILABLE',
      is_authentic: false,
      tamper_report_status: 'NOT_APPLICABLE',
      tamper_report: null,
    };
    const { rerender } = render(<VerifyWorkspace result={unavailableResult} onRetry={vi.fn()} role="user" />);

    expect(screen.getByText('The document or blockchain record could not be evaluated at this time. This is not a tampering result. Please try again.')).toBeTruthy();

    const compromisedResult: ApiSchema<'DocumentVerificationResponse'> = {
      ...result,
      status: 'SNAPSHOT_COMPROMISED',
      is_authentic: false,
      baseline_trusted: false,
      tamper_report_status: 'NOT_APPLICABLE',
      tamper_report: null,
    };
    rerender(<VerifyWorkspace result={compromisedResult} onRetry={vi.fn()} role="user" />);
    expect(screen.getByText('The current file differs from the blockchain record or is missing, and the stored reference is compromised. A detailed comparison is unavailable.')).toBeTruthy();
    expect(screen.getByText("Contact your lawyer or the document owner if you have questions regarding this document's integrity.")).toBeTruthy();
  });
});
