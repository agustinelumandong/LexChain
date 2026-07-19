'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import { getOfficeDateRanges, getOfficeInsightMetrics } from '../lib/office-insight';
import { getPortalUiRole } from '../lib/portal-role';

type UserProfile = ApiSchema<'UserProfileResponse'>;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api/portal/proxy?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json() as Promise<T>;
}

export default function OfficeAnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('30-days');
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => getJson<UserProfile | null>('/users/'),
  });
  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (getPortalUiRole(profileQuery.data?.role) !== 'issuer') {
    return <p className="text-sm font-semibold text-[#64748b]">Office Analytics is available to Document Issuers only.</p>;
  }

  const dateRanges = getOfficeDateRanges();
  const metrics = getOfficeInsightMetrics();

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0985E7]">Document Issuer workspace</p>
        <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Office Analytics</h1>
        <p className="mt-1 text-sm text-[#64748b]">Review local office activity snapshots without changing any records.</p>
      </header>

      <p className="rounded-[18px] border border-[#E8F0F8] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>

      <section aria-label="Analytics date range" className="flex flex-wrap gap-2">
        {dateRanges.map((range) => (
          <button
            key={range.id}
            type="button"
            aria-pressed={selectedRange === range.id}
            onClick={() => setSelectedRange(range.id)}
            className={[
              'rounded-full border px-4 py-2 text-sm font-black transition',
              selectedRange === range.id
                ? 'border-[#0985E7] bg-[#0985E7] text-white'
                : 'border-[#D7E4F2] bg-white text-[#0C2B49] hover:border-[#0985E7]',
            ].join(' ')}
          >
            {range.label}
          </button>
        ))}
      </section>

      <section aria-label="Office analytics" className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
            <p className="text-sm font-bold text-[#64748b]">{metric.label}</p>
            <p className="mt-3 text-3xl font-black text-[#0C2B49]">{metric.value}</p>
          </article>
        ))}
      </section>

      <section aria-label="Analytics empty state" role="status" className="rounded-[18px] border border-dashed border-[#CFE1F2] bg-white p-6 text-center">
        <h2 className="text-base font-black text-[#0C2B49]">No office activity yet</h2>
        <p className="mt-2 text-sm font-semibold text-[#64748b]">No office activity is available for this demo period.</p>
      </section>
    </div>
  );
}
