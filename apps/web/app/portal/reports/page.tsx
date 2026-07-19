'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { getOfficeReports } from '../lib/office-insight';
import { getPortalUiRole } from '../lib/portal-role';

type UserProfile = ApiSchema<'UserProfileResponse'>;

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
  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (getPortalUiRole(profileQuery.data?.role) !== 'issuer') {
    return <p className="text-sm font-semibold text-[#64748b]">Office Reports are available to Document Issuers only.</p>;
  }

  const reports = getOfficeReports();

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0985E7]">Document Issuer workspace</p>
        <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Office Reports</h1>
        <p className="mt-1 text-sm text-[#64748b]">Preview the reports planned for this office workspace.</p>
      </header>

      <p className="rounded-[18px] border border-[#E8F0F8] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>

      <section aria-label="Available office reports" className="grid gap-4 lg:grid-cols-3">
        {reports.map((report) => (
          <article key={report.title} className="flex min-h-56 flex-col rounded-[18px] border border-[#E8F0F8] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[#0985E7]">{report.periodLabel}</p>
            <h2 className="mt-3 text-lg font-black text-[#0C2B49]">{report.title}</h2>
            <p className="mt-2 flex-1 text-sm font-semibold leading-6 text-[#64748b]">{report.description}</p>
            <button
              type="button"
              disabled={!report.downloadAvailable}
              title="Report downloads are unavailable in demo mode."
              className="mt-5 rounded-full border border-[#D7E4F2] px-4 py-2.5 text-sm font-black text-[#64748b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download unavailable in demo mode
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
