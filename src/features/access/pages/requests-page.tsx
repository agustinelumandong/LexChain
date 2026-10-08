"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiSchema } from "@/shared/types/index";
import { portalFetch } from "@/shared/api/client";
import { getPortalUiRole } from "@/features/access/portal-role";

type UserProfile = ApiSchema<"UserProfileResponse">;

export default function RequestsPage() {
  const profileQuery = useQuery<UserProfile>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile>("/users/") });
  const isIssuer = getPortalUiRole(profileQuery.data?.role) === "lawyer";

  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Checking portal access…</p>;
  if (profileQuery.isError || !isIssuer) return <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center"><h1 className="text-xl font-black text-[#0C2B49]">Document request access unavailable</h1><p className="mt-2 text-sm font-semibold text-[#64748b]">Only Document Issuers can review e-copy requests.</p></div>;

  return <div className="flex flex-col gap-5">
    <div><p className="text-xs font-black tracking-wider text-[#0985E7]">REQUEST MANAGEMENT</p><h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Document Requests</h1></div>
    <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center">
      <h2 className="text-base font-black text-[#0C2B49]">E-copy request review unavailable</h2>
      <p role="status" className="mt-2 text-sm font-semibold text-[#64748b]">Request review is not available in this portal yet.</p>
    </section>
  </div>;
}
