import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { backendUrl } from "@/lib/admin-api";

type DashboardData = {
  total_users: number;
  total_lawyers: number;
  total_documents: number;
  total_processed: number;
  total_failed: number;
  total_on_chain: number;
  pending_invitations: number;
};

async function getDashboard(): Promise<DashboardData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(backendUrl("/admin/dashboard"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboard();
  if (!data) redirect("/admin/login");

  const stats = [
    { label: "Total users", value: data.total_users, detail: "Registered accounts", icon: "◉" },
    { label: "Lawyers", value: data.total_lawyers, detail: "Lawyer accounts", icon: "▣" },
    { label: "Documents", value: data.total_documents, detail: "Total uploaded", icon: "▤" },
    { label: "Processed", value: data.total_processed, detail: "OCR/NLP completed", icon: "✓" },
    { label: "On-chain", value: data.total_on_chain, detail: "Blockchain anchored", icon: "⛓" },
    { label: "Failed", value: data.total_failed, detail: "Needs review", icon: "!" },
    { label: "Pending invites", value: data.pending_invitations, detail: "Awaiting onboarding", icon: "◆" },
  ];

  const bars = [
    { label: "Processed", value: data.total_processed, total: data.total_documents },
    { label: "On-chain", value: data.total_on_chain, total: data.total_documents },
    { label: "Failed", value: data.total_failed, total: data.total_documents },
  ];

  return (
    <AdminShell activeHref="/admin/dashboard">
      <div className="mx-auto max-w-[1180px] space-y-6">
        <header className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
            LexChain Super Admin
          </p>
          <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">Dashboard</h1>
          <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
            Live platform health — document processing, blockchain anchoring, and user activity.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <article
              key={card.label}
              className="flex gap-4 rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#0985E7]/10 text-xl font-black text-[#0985E7]">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-black text-[#0C2B49]">
                  {card.value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-bold text-[#64748b]">{card.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#0C2B49]">Processing Overview</h2>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">
              Document pipeline health based on live data.
            </p>
            <div className="mt-6 space-y-5">
              {bars.map(({ label, value, total }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm font-black">
                      <span>{label}</span>
                      <span>
                        {value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#EEF4FB]">
                      <div
                        className="h-2 rounded-full bg-[#0985E7]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl bg-[#0985E7] p-6 text-white shadow-[0_18px_48px_rgba(9,133,231,0.24)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
                Super Admin scope
              </p>
              <span className="text-2xl">◈</span>
            </div>
            <p className="mt-8 text-sm font-semibold leading-6 text-white/85">
              Monitor system activity, users, document metadata, processing status, and blockchain
              records.
            </p>
            <div className="mt-10">
              <p className="text-5xl font-black">{data.total_failed.toLocaleString()}</p>
              <p className="text-sm font-black text-white/70">failed documents need review</p>
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
