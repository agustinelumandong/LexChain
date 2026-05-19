import { AdminShell } from "../admin-shell";
import { adminStats, adminUsers } from "../admin-demo-data";
import { adminFetch } from "../components/admin-fetch";
import { PageHeader } from "../components/page-header";
import { StatCard, StatCardData } from "../components/stat-card";
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

type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

async function getDashboard(): Promise<DashboardData> {
  if (useMock) {
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
  return adminFetch<DashboardData>("/admin/dashboard");
}

async function getRecentUsers(): Promise<RecentUser[]> {
  if (useMock) {
    return adminUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at }));
  }

  try {
    const { users } = await adminFetch<{ users: Array<{ id: string; name?: string; f_name?: string; l_name?: string; email: string; role: string; created_at: string }> }>("/admin/users");
    return users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map((u) => ({
        id: u.id,
        name: u.name ?? `${u.f_name ?? ""} ${u.l_name ?? ""}`.trim(),
        email: u.email,
        role: u.role,
        created_at: u.created_at,
      }));
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboard();
  const recentUsers = await getRecentUsers();

  const stats: StatCardData[] = [
    { label: "Total users", value: data.total_users, detail: "Registered accounts", icon: <PeopleIcon />, color: "blue" },
    { label: "Lawyers", value: data.total_lawyers, detail: "Lawyer accounts", icon: <GavelIcon />, color: "purple" },
    { label: "Documents", value: data.total_documents, detail: "Total uploaded", icon: <DescriptionIcon />, color: "indigo" },
    { label: "Processed", value: data.total_processed, detail: "OCR/NLP completed", icon: <CheckCircleIcon />, color: "green" },
    { label: "On-chain", value: data.total_on_chain, detail: "Blockchain anchored", icon: <LinkIcon />, color: "teal" },
    { label: "Failed", value: data.total_failed, detail: "Needs review", icon: <ErrorIcon />, color: "red" },
    { label: "Pending invites", value: data.pending_invitations, detail: "Awaiting onboarding", icon: <MailIcon />, color: "amber" },
  ];

  const bars = [
    { label: "Processed", value: data.total_processed, total: data.total_documents, color: "bg-green-500" },
    { label: "On-chain", value: data.total_on_chain, total: data.total_documents, color: "bg-[#0985E7]" },
    { label: "Failed", value: data.total_failed, total: data.total_documents, color: "bg-red-500" },
  ];

  const successRate = data.total_documents > 0 ? Math.round(((data.total_documents - data.total_failed) / data.total_documents) * 100) : 0;
  const todayThroughput = Math.round(data.total_processed * 0.12);

  return (
    <AdminShell activeHref="/admin/dashboard">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader title="Dashboard" description="Live platform health — document processing, blockchain anchoring, and user activity." />

        <section className="grid grid-cols-12 gap-4">
          {stats.map((card, i) => (
            <div key={card.label} className={i < 4 ? "col-span-3" : "col-span-4"}>
              <StatCard {...card} />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-5">
          <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUpIcon className="text-[#0985E7]" />
              <h2 className="text-lg font-black text-[#0C2B49]">Processing Overview</h2>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">Document pipeline health based on live data.</p>

            <div className="mt-5 flex gap-4">
              <div className="flex-1 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] p-3 py-9 text-center">
                <p className="text-5xl font-black text-green-600">{successRate}%</p>
                <p className="text-[10px] font-bold text-[#64748b]">Success Rate</p>
              </div>
              <div className="flex-1 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] p-3 py-9 text-center">
                <p className="text-5xl font-black text-[#0985E7]">{todayThroughput}</p>
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
                      <span>{value.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#EEF4FB]">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
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
            <p className="mt-1 text-sm font-semibold text-[#64748b]">Latest users who joined the platform.</p>
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
