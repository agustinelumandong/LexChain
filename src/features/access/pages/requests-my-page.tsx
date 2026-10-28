"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ApiSchema } from "@/shared/types/index";
import { portalFetch } from "@/shared/api/client";
import { canAccessPortalFeature } from "@/features/access/portal-access";
import { getPortalUiRole } from "@/features/access/portal-role";

type UserProfile = ApiSchema<"UserProfileResponse">;

export default function MyRequestsPage() {
  const profileQuery = useQuery<UserProfile | null>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile | null>("/users/") });
  const isParticipant = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), "my-requests");
  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#5B6F8A]">Loading your request access…</p>;
  if (profileQuery.isError) return <section role="alert" className="rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">Could not verify portal access</h1><p className="mt-2 text-sm text-[#5B6F8A]">{profileQuery.error instanceof Error ? profileQuery.error.message : "Try loading your access again."}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void profileQuery.refetch()} className="rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49]">Retry access check</button><Link href="/portal/documents" className="rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white">Back to Documents</Link></div></section>;
  if (!isParticipant) return <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">E-copy requests unavailable</h1><p className="mt-2 text-sm text-[#5B6F8A]">This page is for document participants.</p><Link href="/portal/documents" className="mt-4 inline-flex rounded-full border border-[#D7E4F2] px-4 py-2 text-sm font-bold text-[#0C2B49]">Back to Documents</Link></section>;

  return <div className="flex max-w-3xl flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0067B3]">E-COPY REQUESTS</p><h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">My E-copy Requests</h1></div>
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
      <h2 className="text-base font-black text-[#0C2B49]">Request tracking is not available yet</h2>
      <p role="status" className="mt-2 text-sm font-semibold text-[#5B6F8A]">Request status will appear here when e-copy requests are supported.</p>
      <Link href="/portal/documents" className="mt-4 inline-flex rounded-full bg-[#0067B3] px-4 py-2 text-sm font-bold text-white">Browse shared documents</Link>
    </section>
  </div>;
}
