import { AdminShell } from "../admin-shell";
import { adminStats, adminUsers } from "../admin-demo-data";
import {
  PipelineBarChart,
  StatusDonutChart,
  ThroughputAreaChart,
} from "../components/charts";
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
      total_lawyers: adminStats.total_lawyers,
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

  const pipelineData = [
    { label: "Processed", value: data.total_processed, color: "#22C55E" },
    { label: "On-chain", value: data.total_on_chain, color: "#0985E7" },
    { label: "Failed", value: data.total_failed, color: "#EF4444" },
  ];

  const successRate = data.total_documents > 0 ? Math.round(((data.total_documents - data.total_failed) / data.total_documents) * 100) : 0;
  const pendingDocuments = Math.max(0, data.total_documents - data.total_processed - data.total_failed);
  const statusData = [
    { label: "Processed", value: data.total_processed, color: "#22C55E" },
    { label: "Pending", value: pendingDocuments, color: "#F59E0B" },
    { label: "Failed", value: data.total_failed, color: "#EF4444" },
  ];
  const trendData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, index) => {
    const progress = (index + 1) / 6;

    return {
      label,
      processed: Math.round(data.total_processed * (0.52 + progress * 0.48)),
      anchored: Math.round(data.total_on_chain * (0.46 + progress * 0.54)),
    };
  });

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

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <PipelineBarChart data={pipelineData} total={data.total_documents} />
          <StatusDonutChart
            centerLabel="Success rate"
            centerValue={`${successRate}%`}
            data={statusData}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <ThroughputAreaChart data={trendData} />
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
