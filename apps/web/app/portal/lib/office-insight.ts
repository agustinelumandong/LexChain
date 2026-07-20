export type OfficeDateRange = {
  id: '7-days' | '30-days' | '90-days';
  label: string;
};

export type OfficeInsightMetric = {
  label: string;
  value: number;
};

export type OfficeReport = {
  title: string;
  description: string;
  periodLabel: string;
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

const officeReports: readonly OfficeReport[] = [
  {
    title: 'Issuance summary',
    description: 'A local preview of documents issued during the selected period.',
    periodLabel: 'Last 30 days',
  },
  {
    title: 'Verification activity',
    description: 'A local preview of document verification activity for the office.',
    periodLabel: 'Last 30 days',
  },
  {
    title: 'On-chain record summary',
    description: 'A local preview of recorded document references for the office.',
    periodLabel: 'Last 30 days',
  },
];

export function getOfficeDateRanges(): readonly OfficeDateRange[] {
  return officeDateRanges;
}

export function getOfficeInsightMetrics(): readonly OfficeInsightMetric[] {
  return officeInsightMetrics;
}

export function getOfficeReports(): readonly OfficeReport[] {
  return officeReports;
}
