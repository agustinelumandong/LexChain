"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ApiSchema } from "@/shared/types/index";
import { portalFetch } from "@/shared/api/client";
import { canAccessPortalFeature } from "@/features/access/portal-access";
import { getPortalUiRole } from "@/features/access/portal-role";
import { EcopyRequests } from '@/features/access/components/ecopy-requests';
import { PortalAccessError } from '@/features/access/components/portal-access-error';

type UserProfile = ApiSchema<"UserProfileResponse">;

export default function MyRequestsPage() {
  const profileQuery = useQuery<UserProfile | null>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile | null>("/users/") });
  const isParticipant = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), "my-requests");
  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#5B6F8A]">Loading your request access…</p>;
  if (profileQuery.isError) return <PortalAccessError error={profileQuery.error} isRetrying={profileQuery.isFetching} onRetry={() => void profileQuery.refetch()} />;
  if (!isParticipant) return <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">E-copy requests unavailable</h1><p className="mt-2 text-sm text-[#5B6F8A]">Your portal role cannot access this page.</p><Link href="/portal/documents" className="mt-4 inline-flex rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49]">Back to Documents</Link></section>;

  return <div className="flex w-full flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0067B3]">E-COPY REQUESTS</p><h1 className="mt-1 text-3xl font-black text-[#0C2B49]">My E-copy Requests</h1><p className="mt-2 text-sm text-[#5B6F8A]">Track your requests and download approved copies.</p></div>
    <EcopyRequests mode="mine" />
  </div>;
}
