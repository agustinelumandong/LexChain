import type { DashboardResponse } from "@/lib/schemas/admin";

export function SystemStatisticsView({ dashboard }: { dashboard: DashboardResponse }) {
  const statistics = [
    ["Registered Users", dashboard.total_users],
    ["Document Issuers", dashboard.total_lawyers],
    ["Documents", dashboard.total_documents],
    ["Processed Documents", dashboard.total_processed],
    ["On-Chain Records", dashboard.total_on_chain],
    ["Failed Documents", dashboard.total_failed],
    ["Pending Invitations", dashboard.pending_invitations],
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-[#0C2B49]">System Statistics</h1>
        <p className="mt-1 text-sm font-semibold text-[#64748b]">
          Current platform totals from the admin dashboard service.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map(([label, value]) => (
          <article
            aria-label={label}
            className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm"
            key={label}
          >
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#0C2B49]">{value.toLocaleString()}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
