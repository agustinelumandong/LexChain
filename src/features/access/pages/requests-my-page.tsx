"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiSchema } from "@/shared/types/index";
import { portalFetch } from "@/shared/api/client";
import { canAccessPortalFeature } from "@/features/access/portal-access";
import { getPortalUiRole } from "@/features/access/portal-role";

type UserProfile = ApiSchema<"UserProfileResponse">;

export default function MyRequestsPage() {
  const profileQuery = useQuery<UserProfile | null>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile | null>("/users/") });
  const isParticipant = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), "my-requests");
  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Loading your request access…</p>;
  if (!isParticipant) return <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">E-copy requests unavailable</h1><p className="mt-2 text-sm text-[#64748b]">Users can view their submitted e-copy requests.</p></section>;

  return <div className="flex max-w-3xl flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0985E7]">E-COPY REQUESTS</p><h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">My E-copy Requests</h1></div>
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
      <h2 className="text-base font-black text-[#0C2B49]">My request status unavailable</h2>
      <p role="status" className="mt-2 text-sm font-semibold text-[#64748b]">Request status is not available in this portal yet.</p>
    </section>
  </div>;
}
