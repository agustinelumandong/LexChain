// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockToastProvider } from '@/features/admin/components/mock-ui';
import { GeneratedReportsManagementView } from '@/features/admin/generated-reports/generated-reports-management-view';
import { fetchSystemUsersReport } from '@/features/office/system-users-report';
import type { Report } from '@/features/office/reports';

vi.mock('@/features/office/system-users-report', () => ({ fetchSystemUsersReport: vi.fn() }));

const View = GeneratedReportsManagementView as ComponentType<Record<string, unknown>>;
const fetchSystemUsersReportMock = vi.mocked(fetchSystemUsersReport);
const liveReport: Report = {
  reportType: 'system-users',
  from: '2026-03-01',
  to: '2026-05-31',
  columns: ['Name', 'Email', 'Role', 'Status', 'Created'],
  rows: [
    { Name: 'Maria Santos', Email: 'maria@example.com', Role: 'lawyer', Status: 'Active', Created: '2026-04-12' },
    { Name: 'Juan Reyes', Email: 'juan@example.com', Role: 'user', Status: 'Suspended', Created: '2026-05-02' },
  ],
};

function renderReports() {
  return render(
    <MockToastProvider>
      <View reports={[]} />
    </MockToastProvider>,
  );
}

beforeEach(() => {
  fetchSystemUsersReportMock.mockReset();
  fetchSystemUsersReportMock.mockResolvedValue(liveReport);
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: undefined });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: undefined });
});

describe('GeneratedReportsManagementView', () => {
  it('offers the two fixed system reports with native date fields', () => {
    renderReports();

    expect(screen.getByRole('radio', { name: 'System Users' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'System Audit' })).toBeTruthy();
    expect((screen.getByLabelText('From') as HTMLInputElement).type).toBe('date');
    expect((screen.getByLabelText('To') as HTMLInputElement).type).toBe('date');
  });

  it('keeps the embedded system builder easy to scan', () => {
    render(
      <MockToastProvider>
        <View embedded />
      </MockToastProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Choose a system report', level: 3 })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Choose a date range');
    expect(screen.getByRole('group', { name: 'From' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'To' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Choose date/ })).toHaveLength(2);
  });

  it('loads live user data into the preview without a demo label', async () => {
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(await screen.findByRole('table', { name: 'System Users preview' })).toBeTruthy();
    expect(screen.getByText('Maria Santos')).toBeTruthy();
    expect(screen.getByText('juan@example.com')).toBeTruthy();
    expect(screen.queryByText('Live report from the current system user directory; generated on request and not stored.')).toBeNull();
    expect(screen.queryByText(/generated locally from seeded data/i)).toBeNull();
    expect(fetchSystemUsersReportMock).toHaveBeenCalledWith('2026-03-01', '2026-05-31');
  });

  it('shows a loading state and prevents duplicate generation', async () => {
    let resolveReport!: (report: Report) => void;
    fetchSystemUsersReportMock.mockReturnValue(new Promise((resolve) => { resolveReport = resolve; }));
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(screen.getByRole('status').textContent).toContain('Loading System Users');
    expect((screen.getByRole('button', { name: /Generating/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchSystemUsersReportMock).toHaveBeenCalledTimes(1);
    resolveReport(liveReport);
    expect(await screen.findByRole('table', { name: 'System Users preview' })).toBeTruthy();
  });

  it('shows an empty state when the backend has no users in range', async () => {
    fetchSystemUsersReportMock.mockResolvedValue({ ...liveReport, rows: [] });
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(await screen.findByText('No users were created during this date range.')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'System Users report' })).toBeTruthy();
  });

  it('shows backend errors without rendering a stale report', async () => {
    fetchSystemUsersReportMock.mockRejectedValue(new Error('Unable to load users.'));
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Unable to load users.');
    expect(screen.queryByRole('region', { name: 'System Users report' })).toBeNull();
  });

  it('downloads the exact live rows shown in the preview', async () => {
    let downloadedFilename = '';
    let downloadedBlob: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn((blob: Blob) => { downloadedBlob = blob; return 'blob:system-report'; }) });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureFilename(this: HTMLAnchorElement) {
      downloadedFilename = this.download;
    });
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByText('juan@example.com')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    expect(downloadedFilename).toBe('system-users-2026-03-01-to-2026-05-31.csv');
    await expect(downloadedBlob?.text()).resolves.toBe('Name,Email,Role,Status,Created\r\nMaria Santos,maria@example.com,lawyer,Active,2026-04-12\r\nJuan Reyes,juan@example.com,user,Suspended,2026-05-02');
  });

  it('keeps System Audit explicitly labeled as demo data unavailable from the backend', () => {
    renderReports();

    const auditOption = screen.getByRole('radio', { name: 'System Audit' }) as HTMLInputElement;
    fireEvent.click(auditOption);
    expect(auditOption.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(screen.getByRole('table', { name: 'System Audit preview' })).toBeTruthy();
    expect(screen.getByText('System audit reporting is not available from the backend yet; these are seeded demo records.')).toBeTruthy();
    expect(fetchSystemUsersReportMock).not.toHaveBeenCalled();
  });

  it('renders the invalid date-range error instead of a report', async () => {
    fetchSystemUsersReportMock.mockRejectedValueOnce(new Error('Start date must be on or before end date.'));
    renderReports();

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-05-31' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Start date must be on or before end date.');
    expect(screen.queryByRole('region', { name: 'System Users report' })).toBeNull();
  });

  it('does not add scheduling, regeneration, archives, history, or format selection', () => {
    renderReports();

    expect(screen.queryByText(/Schedule|Regenerate|Archive|Report Library|Recent Report Activity/i)).toBeNull();
    expect(screen.queryByLabelText('Format')).toBeNull();
  });
});
