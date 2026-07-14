"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiSchema } from "@lexchain/types";
import { RequestStatus } from "../../components/request-status";
import { portalFetch } from "../../lib/portal-fetch";

type RequestList = ApiSchema<"DocumentRequestListResponse">;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function MyRequestsPage() {
  const { data, error, isLoading } = useQuery<RequestList>({ queryKey: ["portal-my-requests"], queryFn: () => portalFetch<RequestList>("/requests/my") });
  const requests = data?.requests ?? [];
  return <div className="flex max-w-3xl flex-col gap-5"><div><p className="text-xs font-black tracking-wider text-[#0985E7]">E-COPY REQUESTS</p><h1 className="mt-1 text-[28px] font-black text-[#0C2B49]">My E-copy Requests</h1><p className="mt-1 text-sm font-semibold text-[#64748b]">Track the status of e-copy requests you submitted.</p></div>
    {isLoading ? <p className="text-sm font-semibold text-[#64748b]">Loading requests…</p> : null}
    {error ? <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Unable to load requests. Please try again.</p> : null}
    {!isLoading && !error && requests.length === 0 ? <div className="rounded-[18px] border border-[#E8F0F8] bg-white p-8 text-center text-sm font-bold text-[#0C2B49]">No e-copy requests yet</div> : null}
    {requests.map((request) => <article key={request.id} className="rounded-[18px] border border-[#E8F0F8] bg-white p-5 shadow-[0_4px_12px_rgba(19,59,115,0.05)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-black text-[#0C2B49]">{request.document_name ?? `Document ${request.document_id.slice(0, 8)}`}</h2><p className="mt-1 text-sm font-semibold text-[#64748b]">Submitted {formatDate(request.created_at)}</p></div><RequestStatus status={request.status} /></div><p className="mt-3 text-sm font-semibold text-[#0C2B49]">{request.description}</p>{request.rejection_reason ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><span className="font-black">Rejection reason:</span> {request.rejection_reason}</p> : null}</article>)}
  </div>;
}
