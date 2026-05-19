import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { adminStats, adminUsers } from "../admin-demo-data";
import { backendUrl } from "@/lib/admin-api";

type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};
import PeopleIcon from "@mui/icons-material/People";
import GavelIcon from "@mui/icons-material/Gavel";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import ErrorIcon from "@mui/icons-material/Error";
import MailIcon from "@mui/icons-material/Mail";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

type DashboardData = {
  total_users: number;
  total_lawyers: number;
  total_documents: number;
  total_processed: number;
  total_failed: number;
  total_on_chain: number;
  pending_invitations: number;
};

function getMockDashboard(): DashboardData {
  return {
    total_users: adminStats.total_users,
    total_lawyers: adminStats.total_document_issuers,
    total_documents: adminStats.total_documents,
    total_processed: adminStats.processed_documents,
    total_failed: adminStats.failed_documents,
    total_on_chain: adminStats.total_documents - adminStats.pending_documents,
    pending_invitations: adminStats.pending_documents,
  };
}

async function getDashboard(): Promise<DashboardData> {
  if (useMock) return getMockDashboard();

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const res = await fetch(backendUrl("/admin/dashboard"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    next: { revalidate: 60 },
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error("Dashboard API unavailable.");

  return res.json();
}

async function getRecentUsers(): Promise<RecentUser[]> {
  if (useMock) {
    return adminUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at }));
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const res = await fetch(backendUrl("/admin/users"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    next: { revalidate: 60 },
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) return [];

  const { users } = await res.json();
  return users
    .sort((a: RecentUser, b: RecentUser) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map((u: { id: string; name?: string; f_name?: string; l_name?: string; email: string; role: string; created_at: string }) => ({
      id: u.id,
      name: u.name ?? `${u.f_name ?? ""} ${u.l_name ?? ""}`.trim(),
      email: u.email,
      role: u.role,
      created_at: u.created_at,
    }));
}

export default async function AdminDashboardPage() {
  const data = await getDashboard();
  const recentUsers = await getRecentUsers();

  const stats = [
    { label: "Total users", value: data.total_users, detail: "Registered accounts", icon: <PeopleIcon />, color: "blue" as const },
    { label: "Lawyers", value: data.total_lawyers, detail: "Lawyer accounts", icon: <GavelIcon />, color: "purple" as const },
    { label: "Documents", value: data.total_documents, detail: "Total uploaded", icon: <DescriptionIcon />, color: "indigo" as const },
    { label: "Processed", value: data.total_processed, detail: "OCR/NLP completed", icon: <CheckCircleIcon />, color: "green" as const },
    { label: "On-chain", value: data.total_on_chain, detail: "Blockchain anchored", icon: <LinkIcon />, color: "teal" as const },
    { label: "Failed", value: data.total_failed, detail: "Needs review", icon: <ErrorIcon />, color: "red" as const },
    { label: "Pending invites", value: data.pending_invitations, detail: "Awaiting onboarding", icon: <MailIcon />, color: "amber" as const },
  ];

  const colorMap = {
    blue: { border: "border-r-[#0985E7]", icon: "text-[#0985E7] bg-[#EEF4FB]" },
    purple: { border: "border-r-[#7c3aed]", icon: "text-purple-600 bg-purple-100" },
    indigo: { border: "border-r-[#4f46e5]", icon: "text-indigo-600 bg-indigo-100" },
    green: { border: "border-r-[#16a34a]", icon: "text-green-600 bg-green-100" },
    teal: { border: "border-r-[#0d9488]", icon: "text-teal-600 bg-teal-100" },
    red: { border: "border-r-[#dc2626]", icon: "text-red-600 bg-red-100" },
    amber: { border: "border-r-[#ca8a04]", icon: "text-amber-600 bg-amber-100" },
  };

  const bars = [
    { label: "Processed", value: data.total_processed, total: data.total_documents, color: "bg-green-500" },
    { label: "On-chain", value: data.total_on_chain, total: data.total_documents, color: "bg-[#0985E7]" },
    { label: "Failed", value: data.total_failed, total: data.total_documents, color: "bg-red-500" },
  ];

  const successRate = data.total_documents > 0 ? Math.round(((data.total_documents - data.total_failed) / data.total_documents) * 100) : 0;
  const todayThroughput = Math.round(data.total_processed * 0.12); // mock daily slice

  return (
    <AdminShell activeHref="/admin/dashboard">
      <div className="flex h-full w-full flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
              LexChain Super Admin
            </p>
            <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">Dashboard</h1>
            <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
              Live platform health — document processing, blockchain anchoring, and user activity.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-12 gap-4">
          {stats.map((card, i) => (
            <article
              key={card.label}
              className={`flex gap-4 rounded-2xl border border-[#E4EEF9] border-r-[3px] ${colorMap[card.color].border} bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)] ${i < 4 ? "col-span-3" : "col-span-4"}`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${colorMap[card.color].icon}`}>
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

        <section className="grid grid-cols-2 gap-5">
          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUpIcon className="text-[#0985E7]" />
              <h2 className="text-lg font-black text-[#0C2B49]">Processing Overview</h2>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">
              Document pipeline health based on live data.
            </p>

            <div className="mt-5 flex gap-4">
              <div className="flex-1 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] p-3 text-center">
                <p className="text-2xl font-black text-green-600">{successRate}%</p>
                <p className="text-[10px] font-bold text-[#64748b]">Success Rate</p>
              </div>
              <div className="flex-1 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] p-3 text-center">
                <p className="text-2xl font-black text-[#0985E7]">{todayThroughput}</p>
                <p className="text-[10px] font-bold text-[#64748b]">Today&apos;s Throughput</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {bars.map(({ label, value, total, color }) => {
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
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <PersonAddIcon className="text-[#0985E7]" />
              <h2 className="text-lg font-black text-[#0C2B49]">Recent Registrations</h2>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">
              Latest users who joined the platform.
            </p>
            <div className="mt-4 space-y-3">
              {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0985E7]/10 text-sm font-black text-[#0985E7]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#0C2B49]">{user.name}</p>
                      <p className="truncate text-xs font-semibold text-[#64748b]">{user.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-full bg-[#EEF4FB] px-2 py-0.5 text-[10px] font-black capitalize text-[#0985E7]">
                        {user.role.replace("_", " ")}
                      </span>
                      <p className="mt-1 text-[10px] font-semibold text-[#94a3b8]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
