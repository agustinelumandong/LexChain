"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ApiSchema } from "@lexchain/types";
import { portalFetch } from "../lib/portal-fetch";
import { canAccessPortalFeature } from "../lib/portal-access";
import { getPortalUiRole } from "../lib/portal-role";

type Invitation = ApiSchema<"DocumentInvitationResponse">;
type UserProfile = ApiSchema<"UserProfileResponse">;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

async function updateInvitation(documentId: string, action: "accept" | "reject") {
  const response = await fetch(`/api/portal/proxy-post?path=${encodeURIComponent(`/documents/${documentId}/parties/${action}`)}`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error(`Unable to ${action} invitation`);
}

export default function InvitationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const profileQuery = useQuery<UserProfile | null>({ queryKey: ["portal-profile"], queryFn: () => portalFetch<UserProfile | null>("/users/") });
  const isParticipant = canAccessPortalFeature(getPortalUiRole(profileQuery.data?.role), "invitations");
  const { data: invitations = [], error, isLoading } = useQuery<Invitation[]>({
    queryKey: ["portal-invitations"],
    queryFn: () => portalFetch<Invitation[]>("/documents/invitations"),
    enabled: isParticipant,
  });

  async function handleInvitation(invitation: Invitation, action: "accept" | "reject") {
    if (!isParticipant) return;
    setBusyId(invitation.id);
    setActionError(null);
    try {
      await updateInvitation(invitation.document_id, action);
      await queryClient.invalidateQueries({ queryKey: ["portal-invitations"] });
      if (action === "accept") router.replace(`/portal/documents/${invitation.document_id}`);
    } catch {
      setActionError(`Unable to ${action} this invitation. Please try again.`);
    } finally {
      setBusyId(null);
    }
  }

  if (profileQuery.isPending) return <p className="text-sm font-semibold text-[#64748b]">Loading your invitation access…</p>;
  if (!isParticipant) return <section className="rounded-[18px] border border-[#E8F0F8] bg-white p-6"><h1 className="text-xl font-black text-[#0C2B49]">Invitations unavailable</h1><p className="mt-2 text-sm text-[#64748b]">Document Participants can manage shared document invitations.</p></section>;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-xs font-black tracking-wider text-[#0985E7]">SHARED DOCUMENTS</p>
        <h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">Invitations</h1>
        <p className="mt-1 text-sm font-semibold text-[#64748b]">Accept or reject document access invitations.</p>
      </div>
      {isLoading ? <p className="text-sm font-semibold text-[#64748b]">Loading invitations…</p> : null}
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Unable to load invitations. Please try again.</p> : null}
      {actionError ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{actionError}</p> : null}
      {!isLoading && !error && invitations.length === 0 ? <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center text-sm font-bold text-[#0C2B49]">No pending invitations</div> : null}
      {invitations.map((invitation) => {
        const isBusy = busyId === invitation.id;
        return <article key={invitation.id} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-black text-[#0C2B49]">{invitation.document_title}</h2><p className="mt-1 text-sm font-semibold text-[#64748b]">Sent {formatDate(invitation.created_at)}</p></div><span className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-xs font-black text-[#0985E7]">{invitation.role}</span></div>
          <div className="mt-4 flex gap-3"><button type="button" disabled={isBusy} onClick={() => void handleInvitation(invitation, "reject")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-60">{isBusy ? "Working…" : "Reject"}</button><button type="button" disabled={isBusy} onClick={() => void handleInvitation(invitation, "accept")} className="rounded-full bg-[#0985E7] px-4 py-2 text-sm font-black text-white disabled:opacity-60">{isBusy ? "Working…" : "Accept"}</button></div>
        </article>;
      })}
    </div>
  );
}
