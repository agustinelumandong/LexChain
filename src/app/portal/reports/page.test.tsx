// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OfficeReportsPage from '@/features/office/pages/reports-page';

const queryState = vi.hoisted(() => ({
  role: 'document_issuer',
  documents: [{
    document_id: 'mock-document-1',
    file_name: 'Lease Agreement.pdf',
    status: 'anchored',
    labels: ['lease'],
    created_at: '2026-07-10T09:00:00.000Z',
    updated_at: '2026-07-10T09:05:00.000Z',
    on_chain: true,
    integrity_state: 'match',
    document_hash: 'abc123',
    finalized_at: '2026-07-10T09:05:00.000Z',
    finalized_by: 'mock-document-issuer',
  }],
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: string[] }) => options.queryKey[0] === 'portal-profile'
    ? { data: { role: queryState.role }, isLoading: false }
    : { data: queryState.documents, isLoading: false, isError: false },
}));
vi.mock('@/shared/api/client', () => ({
  portalFetch: vi.fn(async (path: string) => path === '/documents/tamper-reports' ? { total: 0, reports: [] } : [{ id: 'mock-document-1', file_name: 'Lease Agreement.pdf', lifecycle: 'FINALIZED', status: 'anchored', is_owner: true, created_at: '2026-07-10T09:00:00.000Z' }]),
}));
vi.mock('@/features/office/integrity-report', () => ({
  fetchIntegrityReport: vi.fn(async () => ({ summary: { total: 2, authentic: 1, tampered: 0, file_missing: 2, snapshot_compromised: 0, not_anchored: 0, verification_unavailable: 0, record_altered: 1 }, rows: [{ file_name: 'Lease Agreement.pdf', status: 'AUTHENTIC', verified_at: '2026-07-10T09:00:00Z' }, { file_name: 'Changed record.pdf', status: 'RECORD_ALTERED', verified_at: '2026-07-10T09:00:00Z' }] })),
}));

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: undefined });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: undefined });
});
beforeEach(() => {
  queryState.role = 'document_issuer';
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-07-31T12:00:00Z') });
});

describe('ReportsPage', () => {
  it('opens report setup in a dialog and closes it after generation', async () => {
    render(<OfficeReportsPage />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    expect(screen.getByRole('dialog', { name: 'Generate report' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a system report preview visible after closing the dialog', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report scope' }));
    fireEvent.click(screen.getByRole('option', { name: 'System reports' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report type' }));
    fireEvent.click(screen.getByRole('option', { name: 'System Audit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'System Audit report' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes with Escape and restores focus to the report button', () => {
    render(<OfficeReportsPage />);
    const trigger = screen.getByRole('button', { name: 'Generate report' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('walks through scope, type and dates and lets the user go back', () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    expect(screen.getByRole('combobox', { name: 'Report scope' })).toBeTruthy();
    expect(screen.queryByRole('combobox', { name: 'Report type' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report type' }));
    fireEvent.click(screen.getByRole('option', { name: 'Integrity' }));
    expect(screen.queryByRole('group', { name: 'From' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('group', { name: 'From' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'To' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: 'Report type' }).textContent).toContain('Integrity');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: 'Report scope' }).textContent).toContain('Document reports');
  });

  it('shows only open integrity reports without asking for dates', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report scope' }));
    fireEvent.click(screen.getByRole('option', { name: 'Open integrity reports' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate integrity reports' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('region', { name: 'Open integrity reports' })).toBeTruthy();
    expect(await screen.findByText('No open integrity reports')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refresh reports' })).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'From' })).toBeNull();
    expect(screen.queryByText('Your preview will appear here')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report scope' }));
    fireEvent.click(screen.getByRole('option', { name: 'Document reports' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Open integrity reports' })).toBeNull();
  });

  it('keeps the current preview when report setup is cancelled', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report scope' }));
    fireEvent.click(screen.getByRole('option', { name: 'Open integrity reports' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Open integrity reports' })).toBeNull();
  });

  it('uses the portal report shell and elevated cards', () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));

    const heading = screen.getByRole('heading', { name: 'Reports', level: 1 });
    const view = heading.closest('header')?.parentElement;
    const controls = screen.getByRole('dialog', { name: 'Generate report' });

    expect(view?.className).toContain('xl:min-h-[calc(100dvh-113px)]');
    expect(controls.className).toContain('rounded-2xl');
    expect(controls.getAttribute('aria-modal')).toBe('true');
  });

  it('guides the user from report setup into a finished preview state', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));

    expect(screen.getByRole('heading', { name: 'Generate report', level: 2 })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Your preview will appear here');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(await screen.findByText('CSV preview')).toBeTruthy();
    expect(screen.getByText(/in this report/i)).toBeTruthy();
  });

  it('shows the owned document report and the live integrity summary', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Document Activity preview' })).toBeTruthy();
    expect(screen.getByText('Lease Agreement.pdf')).toBeTruthy();
    expect(screen.queryByText('Deed of Sale - Lot 18.pdf')).toBeNull();
    expect(screen.getByText(/Scope: documents owned by you/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Report type' }));
    fireEvent.click(screen.getByRole('option', { name: 'Integrity' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('region', { name: 'Integrity report' })).toBeTruthy();
    expect(screen.getByText(/Total: 2 · Authentic: 1/)).toBeTruthy();
    expect(screen.getByText(/Missing files: 2/)).toBeTruthy();
    expect(screen.getByText(/Altered records: 1/)).toBeTruthy();
    expect(within(screen.getByRole('table', { name: 'Integrity preview' })).getByText('Record altered')).toBeTruthy();
  });

  it('requires both report dates before generating', async () => {
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'From' })).getByTitle('Clear'));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Select both a start and end date.');
    expect(screen.queryByRole('region', { name: 'Document Activity report' })).toBeNull();
  });

  it('downloads CSV with the report type and dates in the filename', async () => {
    let downloadedFilename = '';
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:demo-report') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureFilename(this: HTMLAnchorElement) {
      downloadedFilename = this.download;
    });
    render(<OfficeReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Download CSV' }));

    expect(downloadedFilename).toBe('office-document-activity-2026-07-01-to-2026-07-31.csv');
  });

  it('removes generic report controls', () => {
    render(<OfficeReportsPage />);

    expect(screen.queryByText(/Schedule|Regenerate|Archive/i)).toBeNull();
    expect(screen.queryByLabelText('Format')).toBeNull();
  });

  it('denies participants before rendering local report data', () => {
    queryState.role = 'document_participant';
    render(<OfficeReportsPage />);

    expect(screen.getByText('Reports are available to Lawyers only.')).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Document Activity' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Generate' })).toBeNull();
  });
});
