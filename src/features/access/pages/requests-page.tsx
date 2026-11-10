"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ApiSchema } from "@/shared/types/index";
import { portalFetch } from "@/shared/api/client";
import { getPortalUiRole } from "@/features/access/portal-role";
import { EcopyRequests } from '@/features/access/components/ecopy-requests';
import { PortalAccessError } from '@/features/access/components/portal-access-error';
import { PageLoadingSkeleton } from '@/shared/components/ui/page-loading-skeleton';

type UserProfile = ApiSchema<"UserProfileResponse">;

export default function RequestsPage() {
  const profileQuery = useQuery<UserProfile>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile>("/users/") });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === "lawyer";

  if (profileQuery.isPending) return <PageLoadingSkeleton label="Checking portal access…" eyebrow rowClassName="h-32" />;
  if (profileQuery.isError) return <PortalAccessError error={profileQuery.error} isRetrying={profileQuery.isFetching} onRetry={() => void profileQuery.refetch()} />;
  if (!isIssuer) return <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center"><h1 className="text-xl font-black text-[#0C2B49]">Document request access unavailable</h1><p className="mt-2 text-sm font-semibold text-[#5B6F8A]">Only Lawyers can open this page.</p><Link href="/portal/documents" className="mt-4 inline-flex rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49]">Back to Documents</Link></section>;

  return <div className="flex w-full flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0067B3]">REQUEST MANAGEMENT</p><h1 className="mt-1 text-3xl font-black text-[#0C2B49]">Document Requests</h1><p className="mt-2 text-sm text-[#5B6F8A]">Review e-copy requests and delivery status.</p></div>
    <EcopyRequests mode="review" />
  </div>;
}
