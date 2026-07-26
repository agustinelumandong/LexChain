import {
  adminAuditLogs,
  adminDocuments,
  adminUsers,
  adminVerificationLogs,
} from '../../admin/admin-demo-data';

export type OfficeDateRange = {
  id: '7-days' | '30-days' | '90-days';
  label: string;
};

export type OfficeInsightMetric = {
  label: string;
  value: number;
};

export type DemoReportType =
  | 'office-document-activity'
  | 'office-integrity'
  | 'system-users'
  | 'system-audit';

export type DemoReport = {
  reportType: DemoReportType;
  from: string;
  to: string;
  columns: string[];
  rows: Record<string, unknown>[];
};

const officeDateRanges: readonly OfficeDateRange[] = [
  { id: '7-days', label: 'Last 7 days' },
  { id: '30-days', label: 'Last 30 days' },
  { id: '90-days', label: 'Last 90 days' },
];

const officeInsightMetrics: readonly OfficeInsightMetric[] = [
  { label: 'Documents issued', value: 2 },
  { label: 'Documents verified', value: 1 },
  { label: 'On-chain records', value: 1 },
];

export function getOfficeDateRanges(): readonly OfficeDateRange[] {
  return officeDateRanges;
}

export function getOfficeInsightMetrics(): readonly OfficeInsightMetric[] {
  return officeInsightMetrics;
}

function datePart(value: string | null): string | undefined {
  return value?.slice(0, 10);
}

function isWithin(value: string | null, from: string, to: string): boolean {
  const date = datePart(value);
  return date !== undefined && date >= from && date <= to;
}

export function createDemoReport(
  type: DemoReportType,
  from: string,
  to: string,
): DemoReport {
  if (from > to) throw new Error('Start date must be on or before end date.');

  switch (type) {
    case 'office-document-activity':
      return {
        reportType: type,
        from,
        to,
        columns: ['Document', 'Owner', 'Category', 'Status', 'Created'],
        rows: adminDocuments
          .filter((document) => isWithin(document.created_at, from, to))
          .map((document) => ({
            Document: document.file_name,
            Owner: document.owner_name,
            Category: document.category,
            Status: document.status,
            Created: datePart(document.created_at),
          })),
      };
    case 'office-integrity':
      return {
        reportType: type,
        from,
        to,
        columns: ['Document', 'Integrity status', 'Verifier', 'Blockchain hash', 'Verified'],
        rows: adminVerificationLogs
          .filter((record) => isWithin(record.verified_at, from, to))
          .map((record) => ({
            Document: record.document_name,
            'Integrity status': record.status,
            Verifier: record.verifier,
            'Blockchain hash': record.blockchain_hash,
            Verified: datePart(record.verified_at),
          })),
      };
    case 'system-users':
      return {
        reportType: type,
        from,
        to,
        columns: ['Name', 'Email', 'Role', 'Status', 'Created'],
        rows: adminUsers
          .filter((user) => isWithin(user.created_at, from, to))
          .map((user) => ({
            Name: user.name,
            Email: user.email,
            Role: user.role,
            Status: user.status,
            Created: datePart(user.created_at),
          })),
      };
    case 'system-audit':
      return {
        reportType: type,
        from,
        to,
        columns: ['Actor', 'Action', 'Target', 'Severity', 'Created'],
        rows: adminAuditLogs
          .filter((entry) => isWithin(entry.created_at, from, to))
          .map((entry) => ({
            Actor: entry.actor,
            Action: entry.action,
            Target: entry.target,
            Severity: entry.severity,
            Created: datePart(entry.created_at),
          })),
      };
    default:
      throw new Error('Unknown report type.');
  }
}

function csvValue(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(report: DemoReport): string {
  return [
    report.columns.map(csvValue).join(','),
    ...report.rows.map((row) => report.columns.map((column) => csvValue(row[column])).join(',')),
  ].join('\r\n');
}

export function downloadDemoReport(report: DemoReport): void {
  const url = URL.createObjectURL(new Blob([toCsv(report)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportType}-${report.from}-to-${report.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
