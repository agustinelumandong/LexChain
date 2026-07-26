'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiSchema } from '@lexchain/types';
import Link from 'next/link';
import {
  getProcessingMonitorItems,
  getProcessingStageLabel,
  type PortalDocument,
  type ProcessingStage,
} from '../lib/processing-monitor';
import { portalFetch } from '../lib/portal-fetch';
import { getPortalUiRole } from '../lib/portal-role';

type UserProfile = ApiSchema<'UserProfileResponse'>;

const stageClasses: Record<ProcessingStage, string> = {
  queued: 'bg-[#FFF4DD] text-[#B77900]',
  processing: 'bg-[#E8F4FF] text-[#0875C9]',
  completed: 'bg-[#EAF8F0] text-[#16834B]',
  failed: 'bg-[#FFF0F0] text-[#C53030]',
};

export default function ProcessingMonitorPage() {
  const profileQuery = useQuery({
    queryKey: ['portal-profile'],
    queryFn: () => portalFetch<UserProfile | null>('/users/'),
  });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === 'issuer';
  const documentsQuery = useQuery<PortalDocument[]>({
    queryKey: ['portal-documents'],
    queryFn: () => portalFetch('/documents/'),
    enabled: isIssuer,
  });
  if (profileQuery.isLoading) return <div className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white" />;

  if (!isIssuer) {
    return <p className="text-sm font-semibold text-[#64748b]">Processing Monitor is available to Document Issuers only.</p>;
  }

  if (documentsQuery.isLoading) {
    return <div role="status" className="h-36 animate-pulse rounded-[18px] border border-[#E8F0F8] bg-white"><span className="sr-only">Loading document processing data…</span></div>;
  }

  const items = getProcessingMonitorItems(documentsQuery.data ?? []);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-black text-[#0C2B49]">Processing Monitor</h1>
        <p className="mt-1 text-sm text-[#64748b]">Track the local processing states for documents in the Document Issuer workspace.</p>
      </header>

      <p className="rounded-[18px] border border-[#E8F0F8] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#64748b]">Demo data — changes reset when this page is refreshed.</p>

      {documentsQuery.isError ? (
        <p role="alert" className="rounded-[18px] border border-[#F5C6C6] bg-[#FFF7F7] p-5 text-sm font-semibold text-[#9B2C2C]">
          We could not load document processing data.
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 text-sm font-semibold text-[#64748b]">
          No document processing records are available in this demo.
        </p>
      ) : (
        <section aria-label="Document processing stages" className="overflow-hidden rounded-[18px] border border-[#E8F0F8] bg-white">
        <div className="divide-y divide-[#E8F0F8]">
          {items.map((item) => (
            <article key={item.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={item.documentHref} className="text-base font-black text-[#0C2B49] underline decoration-[#B9DDF9] underline-offset-4 hover:text-[#0985E7]">
                    {item.documentName}
                  </Link>
                  <p className="mt-2 text-sm text-[#64748b]">{item.detail}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${stageClasses[item.stage]}`}>
                  {getProcessingStageLabel(item.stage)}
                </span>
              </div>
              {item.failureReason ? (
                <div className="mt-4">
                  <p className="rounded-xl border border-[#F5C6C6] bg-[#FFF7F7] p-3 text-sm font-semibold text-[#9B2C2C]">
                    Failure reason: {item.failureReason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                    <Link href={item.documentHref} className="text-[#0985E7] underline underline-offset-4 hover:text-[#0769B3]">Open document</Link>
                    <Link href="/portal/upload" aria-label={`Upload replacement PDF for ${item.documentName}`} className="text-[#0985E7] underline underline-offset-4 hover:text-[#0769B3]">Upload replacement PDF</Link>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        </section>
      )}
    </div>
  );
}
