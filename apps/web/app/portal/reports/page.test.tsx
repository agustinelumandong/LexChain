// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OfficeReportsPage from './page';

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (URL as typeof URL & { createObjectURL?: unknown }).createObjectURL;
  delete (URL as typeof URL & { revokeObjectURL?: unknown }).revokeObjectURL;
});
beforeEach(() => { queryState.role = 'document_issuer'; });

describe('OfficeReportsPage', () => {
  it('offers the two fixed issuer reports with native date fields', () => {
    render(<OfficeReportsPage />);

    expect(screen.getByRole('radio', { name: 'Document Activity' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Integrity' })).toBeTruthy();
    expect((screen.getByLabelText('From') as HTMLInputElement).type).toBe('date');
    expect((screen.getByLabelText('To') as HTMLInputElement).type).toBe('date');
  });

  it('generates a compact preview and shows the disclaimer for every result', () => {
    render(<OfficeReportsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getByRole('region', { name: 'Document Activity report' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Document Activity preview' })).toBeTruthy();
    expect(screen.getByText('Lease Agreement.pdf')).toBeTruthy();
    expect(screen.queryByText('Deed of Sale - Lot 18.pdf')).toBeNull();
    expect(screen.getByText('Demo report — generated locally from seeded data and not stored.')).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: 'Integrity' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getByRole('region', { name: 'Integrity report' })).toBeTruthy();
    expect(screen.getByText('Demo report — generated locally from seeded data and not stored.')).toBeTruthy();
  });

  it('downloads CSV with the report type and dates in the filename', () => {
    let downloadedFilename = '';
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:demo-report') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureFilename() {
      downloadedFilename = this.download;
    });
    render(<OfficeReportsPage />);

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-07-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-07-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

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

    expect(screen.getByText('Office Reports are available to Document Issuers only.')).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Document Activity' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Generate' })).toBeNull();
  });
});
