'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import type { ApiSchema } from '@/shared/types/index';
import { GeneratedReportsManagementView } from "@/features/admin/generated-reports";
import { PortalDropdown } from "@/features/portal/components";
import {
  createDemoReport,
  downloadDemoReport,
  type DemoReport,
  type DemoReportType,
  type PortalReportDocument,
} from '@/features/office/office-insight';
import { portalFetch } from '@/shared/api/client';
import { getPortalUiRole } from "@/features/access";

type UserProfile = ApiSchema<'UserProfileResponse'>;
type ReportScope = 'document' | 'system';

const reportOptions = [
  {
    type: 'office-document-activity',
    label: 'Document Activity',
    description: 'Documents in your office workspace during the selected dates.',
  },
  {
    type: 'office-integrity',
    label: 'Integrity',
    description: 'Seeded verification outcomes recorded during the selected dates.',
  },
] satisfies Array<{ type: DemoReportType; label: string; description: string }>;

const reportLabels: Record<DemoReportType, string> = {
  'office-document-activity': 'Document Activity',
  'office-integrity': 'Integrity',
  'system-users': 'System Users',
  'system-audit': 'System Audit',
};

const reportScopeOptions = [
  { label: 'Document reports', value: 'document' },
  { label: 'System reports', value: 'system' },
];

const reportDatePickerSlotProps = {
  textField: { size: 'small' as const, fullWidth: true, sx: { '& .MuiPickersOutlinedInput-root': { borderRadius: 3, backgroundColor: '#F8FBFF', color: '#0C2B49' } } },
  field: { clearable: true },
  popper: { disablePortal: true },
  desktopPaper: { sx: { borderRadius: 3, border: '1px solid #E4EEF9' } },
};

export default function OfficeReportsPage() {
  const [scope, setScope] = useState<ReportScope>('document');
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => portalFetch<UserProfile | null>('/users/'),
  });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === 'lawyer';
  const documentsQuery = useQuery<PortalReportDocument[]>({
    queryKey: ['portal-documents'],
    queryFn: () => portalFetch('/documents/'),
    enabled: isIssuer && scope === 'document',
  });
  const [reportType, setReportType] = useState<DemoReportType>('office-document-activity');
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-07-31');
  const [report, setReport] = useState<DemoReport | null>(null);
  const [error, setError] = useState('');

  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (!isIssuer) {
    return <p className="text-sm font-semibold text-[#64748b]">Reports are available to Lawyers only.</p>;
  }

  if (scope === 'document' && documentsQuery.isLoading) {
    return <div role="status" className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white"><span className="sr-only">Loading office report data…</span></div>;
  }

  function generateReport() {
    try {
      setReport(createDemoReport(reportType, from, to, documentsQuery.data ?? []));
      setError('');
    } catch (caught) {
      setReport(null);
      setError(caught instanceof Error ? caught.message : 'Could not generate this demo report.');
    }
  }

  const reportLabel = report ? reportLabels[report.reportType] : '';
  const selectedReport = reportOptions.find((option) => option.type === reportType) ?? reportOptions[0];
  const scopeSelector = (
    <label className="block text-sm font-black text-[#0C2B49]">
      Report scope
      <PortalDropdown
        ariaLabel="Report scope"
        value={scope}
        onChange={(value) => setScope(value as ReportScope)}
        options={reportScopeOptions}
      />
    </label>
  );
  const reportTypeSelector = (
    <label className="block text-sm font-black text-[#0C2B49]">
      Report type
      <PortalDropdown
        ariaLabel="Report type"
        value={reportType}
        onChange={(value) => setReportType(value as DemoReportType)}
        options={reportOptions.map((option) => ({ label: option.label, value: option.type }))}
      />
    </label>
  );
  const scopeCard = (
    <div className="rounded-2xl border border-[#E4EEF9] bg-[#F8FBFF] p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0985E7] text-xs font-black text-white">1</span>
        <div>
          <h3 className="text-sm font-black text-[#071B33]">Choose a scope</h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">Start with office activity or platform records.</p>
        </div>
      </div>
      <div className="mt-4">{scopeSelector}</div>
    </div>
  );

  const builderHeader = (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E4EEF9] bg-[#FBFDFF] px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0879D8]">
          <AssessmentOutlinedIcon fontSize="small" />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#071B33]">Build a report</h2>
          <p className="mt-1 max-w-xl text-sm font-semibold leading-6 text-[#5B6F8A]">Set the scope, report type, and dates before generating a local preview.</p>
        </div>
      </div>
      <span className="rounded-full border border-[#CFE7FC] bg-[#F1F8FF] px-3 py-1.5 text-xs font-black text-[#0C5B9C]">Local preview</span>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-6 xl:min-h-[calc(100dvh-113px)]">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Operations</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-[-0.02em] text-[#071B33]">Reports</h1>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#4B6382]">Choose a report, set a date range, and create a local CSV preview for your office.</p>
        </div>
        <span className="hidden rounded-full border border-[#D7E4F2] bg-white px-3 py-1.5 text-xs font-black text-[#5B6F8A] sm:inline-flex">Office workspace</span>
      </header>

      <section aria-label="Report controls" className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35">
        {builderHeader}
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {scope === 'document' ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {scopeCard}

                <div className="rounded-2xl border border-[#E4EEF9] bg-[#F8FBFF] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#B9DDF9] bg-white text-xs font-black text-[#0879D8]">2</span>
                    <div>
                      <h3 className="text-sm font-black text-[#071B33]">Choose a report</h3>
                      <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">{selectedReport.description}</p>
                    </div>
                  </div>
                  <div className="mt-4">{reportTypeSelector}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {scopeCard}
              <GeneratedReportsManagementView embedded />
            </>
          )}

          {scope === 'document' ? (
            <div aria-label="Report dates" className="rounded-2xl border border-[#E4EEF9] bg-[#F8FBFF] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#B9DDF9] bg-white text-xs font-black text-[#0879D8]">3</span>
                <div>
                  <h3 className="text-sm font-black text-[#071B33]">Choose a date range</h3>
                  <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">Preview activity that falls between these dates.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    format="MM/DD/YYYY"
                    value={from ? dayjs(from) : null}
                    maxDate={to ? dayjs(to) : undefined}
                    onChange={(value, context) => { if (context.validationError) return; setFrom(value?.format('YYYY-MM-DD') ?? ''); }}
                    slotProps={reportDatePickerSlotProps}
                  />
                  <DatePicker
                    label="To"
                    format="MM/DD/YYYY"
                    value={to ? dayjs(to) : null}
                    minDate={from ? dayjs(from) : undefined}
                    onChange={(value, context) => { if (context.validationError) return; setTo(value?.format('YYYY-MM-DD') ?? ''); }}
                    slotProps={reportDatePickerSlotProps}
                  />
                </LocalizationProvider>
                <button type="button" onClick={generateReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0770C4] active:translate-y-px">
                  <AssessmentOutlinedIcon fontSize="small" />
                  Generate
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {documentsQuery.isError ? (
        <p role="alert" className="rounded-[18px] border border-[#F5C6C6] bg-[#FFF7F7] p-5 text-sm font-semibold text-[#9B2C2C]">
          We could not load office report data.
        </p>
      ) : null}

      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

      {scope === 'document' && report ? (
        <section aria-label={`${reportLabel} report`} className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4EEF9] bg-[#FBFDFF] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#12A150]"><AssessmentOutlinedIcon fontSize="small" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#0879D8]">CSV preview</span>
                  <span className="rounded-full bg-[#EAF8F0] px-2.5 py-1 text-xs font-black text-[#16834B]">Ready</span>
                </div>
                <h2 className="mt-1 text-xl font-black text-[#071B33]">{reportLabel}</h2>
                <p className="mt-1 text-sm font-semibold text-[#5B6F8A]">{report.rows.length} {report.rows.length === 1 ? 'row' : 'rows'} in this preview <span aria-hidden="true">·</span> {report.from} to {report.to}</p>
              </div>
            </div>
            <button type="button" onClick={() => downloadDemoReport(report)} className="inline-flex items-center gap-2 rounded-xl border border-[#B9D6ED] bg-white px-4 py-2.5 text-sm font-black text-[#0879D8] transition hover:border-[#0985E7] hover:bg-[#F0F7FF] active:translate-y-px">
              <DownloadOutlinedIcon fontSize="small" />
              Download CSV
            </button>
          </div>

          <p className="mx-5 mt-5 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-3 py-2.5 text-sm font-bold text-[#64748b] sm:mx-6">Demo report — generated locally from seeded data and not stored.</p>

          {report.rows.length ? (
            <div className="mt-5 overflow-x-auto px-5 pb-5 sm:px-6">
              <table aria-label={`${reportLabel} preview`} className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="bg-[#F8FBFF]">
                    {report.columns.map((column) => <th key={column} className="border-b border-[#D9E5F0] p-3 font-black text-[#0C2B49]">{column}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.slice(0, 5).map((row, index) => (
                    <tr key={index} className="transition hover:bg-[#FBFDFF]">
                      {report.columns.map((column) => <td key={column} className="border-b border-[#EEF4F8] p-3 font-semibold text-[#64748b]">{String(row[column] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="px-5 py-5 text-sm font-semibold text-[#64748b] sm:px-6">No seeded rows fall within this date range.</p>}
        </section>
      ) : scope === 'document' && !error ? (
        <section role="status" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#CFE1F2] bg-white px-6 py-10 text-center shadow-sm shadow-[#DDEAF7]/25">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0879D8]"><AssessmentOutlinedIcon /></span>
          <div>
            <h2 className="text-lg font-black text-[#071B33]">Your preview will appear here</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5B6F8A]">Choose a date range to create a local CSV preview.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
