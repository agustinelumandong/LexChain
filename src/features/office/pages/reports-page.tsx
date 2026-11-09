'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { EmptyState } from '@/shared/components/ui';
import type { ApiSchema } from '@/shared/types/index';
import { GeneratedReportsManagementView } from "@/features/admin/generated-reports";
import { PortalDropdown } from "@/features/portal/components";
import {
  downloadReport,
  getCurrentMonthDateRange,
  type Report,
  type ReportType,
} from '@/features/office/office-insight';
import { portalFetch } from '@/shared/api/client';
import { getPortalUiRole } from "@/features/access";
import { PortalAccessError } from "@/features/access/components/portal-access-error";
import { fetchIntegrityReport } from '@/features/office/integrity-report';
import { fetchDocumentActivityReport } from '@/features/office/document-activity-report';
import { Modal } from '@/features/admin/components/modal';
import { TamperReports } from '@/features/office/components/tamper-reports';

type UserProfile = ApiSchema<'UserProfileResponse'>;
type ReportScope = 'document' | 'system' | 'open-integrity';
type BuilderStep = 'scope' | 'type' | 'dates';

const reportOptions = [
  {
    type: 'office-document-activity',
    label: 'Document Activity',
    description: 'Documents you own, created during the selected dates.',
  },
  {
    type: 'office-integrity',
    label: 'Integrity',
    description: 'Verification outcomes recorded during the selected dates (UTC).',
  },
] satisfies Array<{ type: ReportType; label: string; description: string }>;

const reportLabels: Record<ReportType, string> = {
  'office-document-activity': 'Document Activity',
  'office-integrity': 'Integrity',
  'system-users': 'System Users',
  'system-audit': 'System Audit',
};

const reportScopeOptions = [
  { label: 'Document reports', value: 'document' },
  { label: 'System reports', value: 'system' },
  { label: 'Open integrity reports', value: 'open-integrity' },
];

const reportDatePickerSlotProps = {
  textField: { size: 'small' as const, fullWidth: true, sx: { '& .MuiPickersOutlinedInput-root': { borderRadius: 3, backgroundColor: '#F8FBFF', color: '#0C2B49' } } },
  field: { clearable: true },
  popper: { disablePortal: true },
  desktopPaper: { sx: { borderRadius: 3, border: '1px solid #E4EEF9' } },
};

export default function OfficeReportsPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [reportActions, setReportActions] = useState<HTMLDivElement | null>(null);
  const [systemControls, setSystemControls] = useState<HTMLDivElement | null>(null);
  const [scope, setScope] = useState<ReportScope>('document');
  const [step, setStep] = useState<BuilderStep>('scope');
  const [displayedReport, setDisplayedReport] = useState<ReportScope | null>(null);
  const [hasOpenedIntegrity, setHasOpenedIntegrity] = useState(false);
  const [integrityGenerateRequest, setIntegrityGenerateRequest] = useState(0);
  const [hasOpenedSystem, setHasOpenedSystem] = useState(false);
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => portalFetch<UserProfile | null>('/users/'),
  });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === 'lawyer';
  const [reportType, setReportType] = useState<ReportType>('office-document-activity');
  const [from, setFrom] = useState(() => getCurrentMonthDateRange(new Date()).from);
  const [to, setTo] = useState(() => getCurrentMonthDateRange(new Date()).to);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [systemPending, setSystemPending] = useState(false);
  const [summary, setSummary] = useState<ApiSchema<'IntegrityReportSummary'> | null>(null);
  const [fromDateInvalid, setFromDateInvalid] = useState(false);
  const [toDateInvalid, setToDateInvalid] = useState(false);

  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (profileQuery.isError && !profileQuery.data) return <PortalAccessError error={profileQuery.error} isRetrying={profileQuery.isFetching} onRetry={() => void profileQuery.refetch()} />;

  if (!isIssuer) {
    return <p className="text-sm font-semibold text-[#5B6F8A]">Reports are available to Lawyers only.</p>;
  }

  async function generateReport() {
    setPending(true);
    setError('');
    try {
      if (reportType === 'office-integrity') {
        const result = await fetchIntegrityReport(from, to);
        setSummary(result.summary);
        setReport({ reportType, from, to, columns: ['Document', 'Status', 'Verified (UTC)'], rows: result.rows.map((row) => ({ Document: row.file_name ?? '', Status: row.status === 'RECORD_ALTERED' ? 'Record altered' : row.status, 'Verified (UTC)': row.verified_at })) });
      } else {
        setReport(await fetchDocumentActivityReport(from, to));
      }
      setError('');
      setDisplayedReport('document');
      setIsBuilderOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not generate this report.');
    } finally {
      setPending(false);
    }
  }

  const reportLabel = report ? reportLabels[report.reportType] : '';
  const lifecycleCounts = report?.reportType === 'office-document-activity'
    ? report.rows.reduce<Map<string, number>>((counts, row) => {
      const lifecycle = String(row.Lifecycle ?? 'Unavailable');
      counts.set(lifecycle, (counts.get(lifecycle) ?? 0) + 1);
      return counts;
    }, new Map())
    : new Map<string, number>();
  const selectedReport = reportOptions.find((option) => option.type === reportType) ?? reportOptions[0];
  const scopeSelector = (
    <label className="block text-sm font-black text-[#0C2B49]">
      Report scope
      <PortalDropdown
        ariaLabel="Report scope"
        disabled={pending}
        value={scope}
        onChange={(value) => { setScope(value as ReportScope); setError(''); }}
        options={reportScopeOptions}
      />
    </label>
  );
  const reportTypeSelector = (
    <label className="block text-sm font-black text-[#0C2B49]">
      Report type
      <PortalDropdown
        ariaLabel="Report type"
        disabled={pending}
        value={reportType}
        onChange={(value) => { setReportType(value as ReportType); setError(''); }}
        options={reportOptions.map((option) => ({ label: option.label, value: option.type }))}
      />
    </label>
  );
  return (
    <div className="flex w-full flex-col gap-6 xl:min-h-[calc(100dvh-113px)]">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0067B3]">LexChain Operations</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-[-0.02em] text-[#071B33]">Reports</h1>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#4B6382]">Choose a report, set a date range, and create a CSV preview for your office.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <div ref={setReportActions} />
        <button type="button" onClick={() => { setStep('scope'); setIsBuilderOpen(true); }} className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#005F9E]">
          <AssessmentOutlinedIcon fontSize="small" />
          Generate report
        </button>
        </div>
      </header>

      {hasOpenedIntegrity ? <div hidden={displayedReport !== 'open-integrity'}><TamperReports generateRequest={integrityGenerateRequest} actionTarget={displayedReport === 'open-integrity' ? reportActions : null} /></div> : null}

      <Modal open={isBuilderOpen} onClose={() => { if (!pending && !systemPending) setIsBuilderOpen(false); }} title="Generate report" size="wide">
        <div className={`flex flex-col gap-4 p-1 ${step === 'dates' ? 'max-h-[70dvh] overflow-y-auto' : ''}`}>
          {step === 'scope' ? scopeSelector : null}
          {step === 'type' && scope === 'document' ? (
            <div>
              {reportTypeSelector}
              <p className="mt-2 text-sm font-semibold leading-5 text-[#5B6F8A]">{selectedReport.description}</p>
            </div>
          ) : null}
          {scope === 'system' && step !== 'scope' ? <div ref={setSystemControls} /> : null}

          {scope === 'document' && step === 'dates' ? (
            <div aria-label="Report dates">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#071B33]">Choose a date range</h3>
                  <p className="mt-1 text-sm font-semibold leading-5 text-[#5B6F8A]">{reportType === 'office-document-activity' ? 'Creation dates are inclusive, using UTC calendar days.' : 'Preview activity that falls between these dates.'}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    disabled={pending}
                    format="MM/DD/YYYY"
                    value={from ? dayjs(from) : null}
                    maxDate={to ? dayjs(to) : undefined}
                    onError={(reason) => setFromDateInvalid(Boolean(reason))}
                    onChange={(value, context) => { setError(''); if (!context.validationError) setFrom(value?.format('YYYY-MM-DD') ?? ''); }}
                    slotProps={reportDatePickerSlotProps}
                  />
                  <DatePicker
                    label="To"
                    disabled={pending}
                    format="MM/DD/YYYY"
                    value={to ? dayjs(to) : null}
                    minDate={from ? dayjs(from) : undefined}
                    onError={(reason) => setToDateInvalid(Boolean(reason))}
                    onChange={(value, context) => { setError(''); if (!context.validationError) setTo(value?.format('YYYY-MM-DD') ?? ''); }}
                    slotProps={reportDatePickerSlotProps}
                  />
                </LocalizationProvider>
                <div className="flex items-center justify-between gap-3">
                <button type="button" disabled={pending} onClick={() => setStep('type')} className="rounded-xl border border-[#B9D6ED] px-5 py-3 text-sm font-black text-[#0067B3] disabled:opacity-60">Back</button>
                <button type="button" onClick={() => void generateReport()} disabled={pending || fromDateInvalid || toDateInvalid} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#005F9E] active:translate-y-px disabled:opacity-60">
                  <AssessmentOutlinedIcon fontSize="small" />
                  {pending ? 'Generating…' : 'Generate'}
                </button>
                </div>
              </div>
              {fromDateInvalid || toDateInvalid ? <p role="alert" className="mt-2 text-sm font-semibold text-red-700">Enter valid dates with the start on or before the end.</p> : null}
            </div>
          ) : null}
          {step !== 'dates' ? <div className="flex justify-between gap-3">
            {step === 'type' ? <button type="button" disabled={pending || systemPending} onClick={() => setStep('scope')} className="rounded-xl border border-[#B9D6ED] px-5 py-3 text-sm font-black text-[#0067B3] disabled:opacity-60">Back</button> : <span />}
            <button type="button" onClick={() => {
              if (step === 'type') setStep('dates');
              else if (scope === 'open-integrity') { setHasOpenedIntegrity(true); setIntegrityGenerateRequest((request) => request + 1); setDisplayedReport('open-integrity'); setIsBuilderOpen(false); }
              else { if (scope === 'system') setHasOpenedSystem(true); setStep('type'); }
            }} className="rounded-xl bg-[#0067B3] px-5 py-3 text-sm font-black text-white hover:bg-[#005F9E]">{step === 'scope' && scope === 'open-integrity' ? 'Generate integrity reports' : 'Next'}</button>
          </div> : null}
          {error && scope === 'document' ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        </div>
      </Modal>

      {hasOpenedSystem ? <div hidden={displayedReport !== 'system'}><GeneratedReportsManagementView embedded controlsTarget={systemControls} step={step === 'scope' ? undefined : step} onBack={() => setStep('type')} onPendingChange={setSystemPending} onGenerated={() => { setDisplayedReport('system'); setIsBuilderOpen(false); }} /></div> : null}

      {pending ? <section role="status" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#CFE1F2] bg-white px-6 py-10 text-center shadow-sm shadow-[#DDEAF7]/25"><span className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0067B3]"><AssessmentOutlinedIcon aria-hidden="true" /></span><div><h2 className="text-lg font-black text-[#071B33]">Generating preview…</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#5B6F8A]">Loading report data…</p></div></section> : null}


      {displayedReport === 'document' && report ? (
        <section aria-label={`${reportLabel} report`} className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4EEF9] bg-[#FBFDFF] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#166534]"><AssessmentOutlinedIcon fontSize="small" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#0067B3]">CSV preview</span>
                  <span className="rounded-full bg-[#EAF8F0] px-2.5 py-1 text-xs font-black text-[#166534]">Ready</span>
                </div>
                <h2 className="mt-1 text-xl font-black text-[#071B33]">{reportLabel}</h2>
                <p className="mt-1 text-sm font-semibold text-[#5B6F8A]">{report.rows.length} {report.rows.length === 1 ? 'row' : 'rows'} in this report <span aria-hidden="true">·</span> {report.from} to {report.to}{report.reportType === 'office-integrity' ? ' (UTC)' : ' (UTC, inclusive)'}</p>
              </div>
            </div>
            <button type="button" onClick={() => downloadReport(report)} className="inline-flex items-center gap-2 rounded-xl border border-[#B9D6ED] bg-white px-4 py-2.5 text-sm font-black text-[#0067B3] transition hover:border-[#0067B3] hover:bg-[#F0F7FF] active:translate-y-px">
              <DownloadOutlinedIcon fontSize="small" />
              Download CSV
            </button>
          </div>

          {report.reportType === 'office-integrity' && summary ? <p className="mx-5 mt-5 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-3 py-2.5 text-sm font-bold text-[#5B6F8A] sm:mx-6">Total: {summary.total} · Authentic: {summary.authentic} · Tampered: {summary.tampered} {summary.file_missing !== undefined && <>· Missing files: {summary.file_missing} </>}{summary.record_altered !== undefined && <>· Altered records: {summary.record_altered} </>}· Snapshot compromised: {summary.snapshot_compromised} · Not anchored: {summary.not_anchored} · Unavailable: {summary.verification_unavailable}</p> : <div className="mx-5 mt-5 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-3 py-2.5 text-sm font-bold text-[#5B6F8A] sm:mx-6"><p>Scope: documents owned by you. Total documents: {report.rows.length}.</p>{Array.from(lifecycleCounts, ([lifecycle, count]) => <p key={lifecycle}>{lifecycle}: {count}</p>)}</div>}

          {report.rows.length ? (
            <div className="mt-5 overflow-x-auto px-5 pb-5 sm:px-6">
              <table aria-label={`${reportLabel} preview`} className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#F8FBFF] text-xs uppercase tracking-[0.06em] text-[#5B6F8A]">
                  <tr>
                    {report.columns.map((column) => <th key={column} className="border-b border-[#D9E5F0] px-4 py-3 font-black">{column}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(report.reportType === 'office-document-activity' ? report.rows : report.rows.slice(0, 5)).map((row, index) => (
                    <tr key={index} className="transition hover:bg-[#FBFDFF]">
                      {report.columns.map((column) => <td key={column} className="border-b border-[#EEF4F8] px-4 py-3 font-semibold text-[#0C2B49]">{String(row[column] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={<AssessmentOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />}
                title="No rows in this report"
                description={report.reportType === 'office-document-activity' ? 'No owned documents were created in this date range.' : 'No rows fall within this date range.'}
              />
            </div>
          )}
        </section>
      ) : displayedReport === null && !pending ? (
        <section role="status" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#CFE1F2] bg-white px-6 py-10 text-center shadow-sm shadow-[#DDEAF7]/25">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0067B3]"><AssessmentOutlinedIcon /></span>
          <div>
            <h2 className="text-lg font-black text-[#071B33]">Your preview will appear here</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5B6F8A]">Choose a date range to create a CSV preview.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
