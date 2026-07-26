'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import {
  createDemoReport,
  downloadDemoReport,
  type DemoReport,
  type DemoReportType,
} from '../lib/office-insight';
import { getPortalUiRole } from '../lib/portal-role';

type UserProfile = ApiSchema<'UserProfileResponse'>;

const reportOptions = [
  {
    type: 'office-document-activity',
    label: 'Document Activity',
    description: 'Documents created by offices during the selected dates.',
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

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json() as Promise<T>;
}

export default function OfficeReportsPage() {
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => getJson<UserProfile | null>('/users/'),
  });
  const [reportType, setReportType] = useState<DemoReportType>('office-document-activity');
  const [from, setFrom] = useState('2026-05-01');
  const [to, setTo] = useState('2026-05-31');
  const [report, setReport] = useState<DemoReport | null>(null);
  const [error, setError] = useState('');

  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (getPortalUiRole(profileQuery.data?.role) !== 'issuer') {
    return <p className="text-sm font-semibold text-[#64748b]">Office Reports are available to Document Issuers only.</p>;
  }

  function generateReport() {
    try {
      setReport(createDemoReport(reportType, from, to));
      setError('');
    } catch (caught) {
      setReport(null);
      setError(caught instanceof Error ? caught.message : 'Could not generate this demo report.');
    }
  }

  const reportLabel = report ? reportLabels[report.reportType] : '';

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0985E7]">Document Issuer workspace</p>
        <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Office Reports</h1>
        <p className="mt-1 text-sm text-[#64748b]">Generate one of the fixed office reports from seeded demo data.</p>
      </header>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Report type</legend>
        {reportOptions.map((option) => (
          <label key={option.type} className="flex cursor-pointer gap-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5 has-checked:border-[#0985E7] has-checked:bg-[#F8FBFF]">
            <input
              type="radio"
              name="office-report-type"
              value={option.type}
              checked={reportType === option.type}
              onChange={() => setReportType(option.type)}
              aria-label={option.label}
              className="mt-1 accent-[#0985E7]"
            />
            <span>
              <strong className="block text-base font-black text-[#0C2B49]">{option.label}</strong>
              <span className="mt-1 block text-sm font-semibold leading-6 text-[#64748b]">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <section aria-label="Report dates" className="grid gap-3 rounded-[18px] border border-[#E8F0F8] bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-black text-[#0C2B49]">
          From
          <input required type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#D9E5F0] px-3 py-2.5 font-semibold" />
        </label>
        <label className="text-sm font-black text-[#0C2B49]">
          To
          <input required type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#D9E5F0] px-3 py-2.5 font-semibold" />
        </label>
        <button type="button" onClick={generateReport} className="rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white hover:bg-[#0770C4]">Generate</button>
      </section>

      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

      {report ? (
        <section aria-label={`${reportLabel} report`} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[#0985E7]">{report.from} to {report.to}</p>
              <h2 className="mt-1 text-xl font-black text-[#0C2B49]">{reportLabel}</h2>
            </div>
            <button type="button" onClick={() => downloadDemoReport(report)} className="rounded-xl border border-[#D9E5F0] px-4 py-2.5 text-sm font-black text-[#0C2B49] hover:border-[#0985E7]">Download CSV</button>
          </div>

          <p className="mt-4 rounded-xl bg-[#F8FBFF] px-3 py-2 text-xs font-bold text-[#64748b]">Demo report — generated locally from seeded data and not stored.</p>

          {report.rows.length ? (
            <div className="mt-4 overflow-x-auto">
              <table aria-label={`${reportLabel} preview`} className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF]">
                    {report.columns.map((column) => <th key={column} className="px-3 py-2.5 font-black text-[#0C2B49]">{column}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-[#EEF4F8]">
                      {report.columns.map((column) => <td key={column} className="px-3 py-2.5 font-semibold text-[#64748b]">{String(row[column] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="mt-4 text-sm font-semibold text-[#64748b]">No seeded rows fall within this date range.</p>}
        </section>
      ) : null}
    </div>
  );
}
