import { AdminShell } from "../admin-shell";
import { adminStats, adminUsers } from "../admin-demo-data";
import { adminFetch } from "../components/admin-fetch";
import { PageHeader } from "../components/page-header";
import { StatCardData } from "../components/stat-card";
import { DashboardHeaderControls, DashboardSelect } from "./dashboard-controls";
import Link from "next/link";
import type { ReactNode } from "react";
import PeopleIcon from "@mui/icons-material/People";
import GavelIcon from "@mui/icons-material/Gavel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import ErrorIcon from "@mui/icons-material/Error";
import MailIcon from "@mui/icons-material/Mail";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArticleIcon from "@mui/icons-material/Article";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FlagIcon from "@mui/icons-material/Flag";
import SecurityIcon from "@mui/icons-material/Security";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

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

type PanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type Activity = {
  title: string;
  detail: string;
  time: string;
  icon: ReactNode;
  color: string;
};

function Panel({ title, action, children, className = "" }: PanelProps) {
  return (
    <article className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-black text-[#0C2B49] 2xl:text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </article>
  );
}

function DashboardStatCard({ label, value, detail, icon, color }: StatCardData) {
  const colorMap = {
    blue: "text-[#0985E7] bg-[#EAF6FF]",
    green: "text-[#16a34a] bg-green-50",
    purple: "text-[#7c3aed] bg-[#f5f3ff]",
    yellow: "text-[#ca8a04] bg-[#fefce8]",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
    teal: "text-teal-600 bg-teal-50",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <article className="flex min-h-[104px] flex-col items-center justify-center rounded-2xl border border-[#E4EEF9] bg-white px-3 py-3 text-center shadow-sm 2xl:min-h-[112px]">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${colorMap[color]}`}>
        {icon}
      </span>
      <p className="mt-2 text-xs font-black text-[#0C2B49]">{label}</p>
      <p className="text-2xl font-black leading-8 text-[#050816]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs font-semibold leading-4 text-[#64748b]">{detail}</p>
    </article>
  );
}

function IconBadge({ icon, color }: { icon: ReactNode; color: string }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
      {icon}
    </span>
  );
}

function PlatformOverviewChart({ className = "" }: { className?: string }) {
  const points = [
    { label: "May 12", users: 210, processed: 120, anchored: 20 },
    { label: "May 13", users: 380, processed: 240, anchored: 140 },
    { label: "May 14", users: 590, processed: 430, anchored: 260 },
    { label: "May 15", users: 710, processed: 560, anchored: 350 },
    { label: "May 16", users: 960, processed: 780, anchored: 510 },
    { label: "May 17", users: 810, processed: 620, anchored: 420 },
    { label: "May 18", users: 620, processed: 440, anchored: 260 },
  ];
  const chartWidth = 720;
  const chartHeight = 218;
  const left = 54;
  const top = 22;
  const innerWidth = chartWidth - left - 24;
  const innerHeight = chartHeight - top - 42;
  const yMax = 1000;
  const x = (index: number) => left + (index / (points.length - 1)) * innerWidth;
  const y = (value: number) => top + innerHeight - (value / yMax) * innerHeight;
  const line = (key: "users" | "processed" | "anchored") =>
    points.map((point, index) => `${x(index)},${y(point[key])}`).join(" ");

  return (
    <Panel
      title="Platform Overview"
      action={<DashboardSelect ariaLabel="Platform overview range" defaultValue="7 Days" options={["24 Hours", "7 Days", "30 Days", "90 Days"]} />}
      className={className}
    >
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-[#475569]">
        {[
          ["#0b77ff", "New Users"],
          ["#16a34a", "Processed Documents"],
          ["#7c3aed", "On-chain Anchors"],
        ].map(([color, label]) => (
          <span className="flex items-center gap-2" key={label}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
      <svg
        className="mt-2 h-full min-h-0 w-full overflow-visible"
        role="img"
        aria-label="Platform overview trend chart"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {[0, 250, 500, 750, 1000].map((tick) => (
          <g key={tick}>
            <line x1={left} x2={chartWidth - 24} y1={y(tick)} y2={y(tick)} stroke="#E4EEF9" />
            <text x={18} y={y(tick) + 4} fill="#64748b" fontSize="12" fontWeight="800">
              {tick === 1000 ? "1K" : tick}
            </text>
          </g>
        ))}
        {points.map((point, index) => (
          <text key={point.label} x={x(index)} y={chartHeight - 8} textAnchor="middle" fill="#0C2B49" fontSize="12" fontWeight="800">
            {point.label.replace("May ", "May ")}
          </text>
        ))}
        <polyline points={line("users")} fill="none" stroke="#0b77ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <polyline points={line("processed")} fill="none" stroke="#16a34a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <polyline points={line("anchored")} fill="none" stroke="#7c3aed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={x(index)} cy={y(point.users)} fill="white" r="4" stroke="#0b77ff" strokeWidth="3" />
            <circle cx={x(index)} cy={y(point.processed)} fill="white" r="4" stroke="#16a34a" strokeWidth="3" />
            <circle cx={x(index)} cy={y(point.anchored)} fill="white" r="4" stroke="#7c3aed" strokeWidth="3" />
          </g>
        ))}
      </svg>
    </Panel>
  );
}

function SystemHealth({ className = "" }: { className?: string }) {
  const services = [
    { label: "OCR/NLP Engine", status: "Healthy", tone: "text-green-600", icon: <ManageSearchIcon fontSize="small" /> },
    { label: "Blockchain Anchor Service", status: "Healthy", tone: "text-green-600", icon: <SecurityIcon fontSize="small" /> },
    { label: "Invitation Service", status: "Degraded", tone: "text-amber-600", icon: <MailIcon fontSize="small" /> },
    { label: "Audit Logging", status: "Healthy", tone: "text-green-600", icon: <VerifiedIcon fontSize="small" /> },
    { label: "Verification Pipeline", status: "Healthy", tone: "text-green-600", icon: <CheckCircleIcon fontSize="small" /> },
  ];

  return (
    <Panel
      title="System Health"
      action={<Link href="/admin/audit-logs" className="text-sm font-bold text-[#0985E7]">View all</Link>}
      className={className}
    >
      <div className="mt-3 divide-y divide-[#E4EEF9]">
        {services.map((service) => (
          <div className="flex items-center gap-3 py-2" key={service.label}>
            <IconBadge icon={service.icon} color="bg-[#F5FAFF] text-[#64748b]" />
            <p className="min-w-0 flex-1 text-sm font-black text-[#0C2B49]">{service.label}</p>
            <p className={`text-sm font-black ${service.tone}`}>{service.status}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RecentActivity({ recentUsers, className = "" }: { recentUsers: RecentUser[]; className?: string }) {
  const firstUser = recentUsers[0];
  const activities: Activity[] = [
    {
      title: "New user registered",
      detail: firstUser ? `${firstUser.name} (${firstUser.email})` : "No recent registration",
      time: "2m ago",
      icon: <PersonAddIcon fontSize="small" />,
      color: "bg-[#EAF6FF] text-[#0985E7]",
    },
    { title: "Document uploaded", detail: "Contract_Review.pdf", time: "8m ago", icon: <ArticleIcon fontSize="small" />, color: "bg-[#EAF6FF] text-[#0985E7]" },
    { title: "Document processed", detail: "Contract_Review.pdf", time: "12m ago", icon: <CheckCircleIcon fontSize="small" />, color: "bg-green-50 text-green-600" },
    { title: "On-chain anchoring complete", detail: "Contract_Review.pdf", time: "15m ago", icon: <LinkIcon fontSize="small" />, color: "bg-[#f5f3ff] text-[#7c3aed]" },
    { title: "Document failed processing", detail: "Image_2025_05_18.png", time: "22m ago", icon: <WarningAmberIcon fontSize="small" />, color: "bg-red-50 text-red-600" },
    { title: "Invitation sent", detail: "sarah.miller@legalassociates.com", time: "35m ago", icon: <MailIcon fontSize="small" />, color: "bg-[#fefce8] text-[#ca8a04]" },
  ];

  return (
    <Panel
      title="Recent Activity"
      action={<Link href="/admin/audit-logs" className="text-sm font-bold text-[#0985E7]">View all</Link>}
      className={className}
    >
      <div className="dashboard-hidden-scroll mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {activities.map((activity) => (
          <div className="rounded-2xl border border-transparent bg-white/70 p-2 transition hover:border-[#E4EEF9] hover:bg-[#F8FBFF]" key={activity.title}>
            <div className="flex items-start gap-3">
            <IconBadge icon={activity.icon} color={activity.color} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#0C2B49]">{activity.title}</p>
              <p className="truncate text-xs font-semibold text-[#64748b]">{activity.detail}</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-[#64748b]">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NeedsAttention({ data, className = "" }: { data: DashboardData; className?: string }) {
  const rows = [
    { label: "Failed Documents", detail: "Require review and reprocessing", value: data.total_failed, href: "/admin/documents", icon: <WarningAmberIcon fontSize="small" />, color: "bg-red-50 text-red-600" },
    { label: "Pending Invites", detail: "Awaiting user onboarding", value: data.pending_invitations, href: "/admin/invitations-permissions", icon: <MailIcon fontSize="small" />, color: "bg-[#fefce8] text-[#ca8a04]" },
    { label: "Flagged Verification Logs", detail: "Require admin review", value: 12, href: "/admin/verification-logs", icon: <FlagIcon fontSize="small" />, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <Panel
      title="Needs Attention"
      action={<Link href="/admin/audit-logs" className="text-sm font-bold text-[#0985E7]">View all</Link>}
      className={className}
    >
      <div className="mt-3 overflow-hidden rounded-2xl border border-[#E4EEF9]">
        {rows.map((row) => (
          <Link href={row.href} className="flex items-center gap-3 border-b border-[#E4EEF9] p-2.5 last:border-b-0 hover:bg-[#F8FBFF]" key={row.label}>
            <IconBadge icon={row.icon} color={row.color} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#0C2B49]">{row.label}</p>
              <p className="text-xs font-semibold text-[#64748b]">{row.detail}</p>
            </div>
            <p className="text-sm font-black text-[#0C2B49]">{row.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function UserRoleDistribution({ data, className = "" }: { data: DashboardData; className?: string }) {
  const roles = [
    { label: "Admins", value: 5, color: "bg-[#0985E7]" },
    { label: "Lawyers", value: data.total_lawyers, color: "bg-[#22C55E]" },
    { label: "Staff", value: 20, color: "bg-[#A855F7]" },
    { label: "Standard Users", value: Math.max(0, data.total_users - data.total_lawyers - 25), color: "bg-[#9fb0c6]" },
  ];

  return (
    <Panel
      title="User / Role Distribution"
      action={<Link href="/admin/users" className="text-sm font-bold text-[#0985E7]">View all users</Link>}
      className={className}
    >
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-32 w-32 2xl:h-36 2xl:w-36">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(#0985E7_0_15deg,#22C55E_15deg_105deg,#A855F7_105deg_170deg,#9fb0c6_170deg_360deg)]" />
          <div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-white text-center">
            <p className="text-2xl font-black text-[#0C2B49]">{data.total_users}</p>
            <p className="text-xs font-bold text-[#64748b]">Total Users</p>
          </div>
        </div>
        <div className="space-y-2">
          {roles.map((role) => (
            <div className="flex items-center gap-3" key={role.label}>
              <span className={`h-3 w-3 rounded-full ${role.color}`} />
              <span className="flex-1 text-sm font-semibold text-[#64748b]">{role.label}</span>
              <span className="text-sm font-black text-[#0C2B49]">
                {role.value} ({Math.round((role.value / data.total_users) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ProcessingSummary({ data, className = "" }: { data: DashboardData; className?: string }) {
  const rows = [
    { label: "Documents Uploaded", value: data.total_documents, change: "12.5%", tone: "text-[#0985E7]", icon: <DescriptionIcon fontSize="small" />, bg: "bg-[#EAF6FF]" },
    { label: "OCR/NLP Completed", value: data.total_processed, change: "15.3%", tone: "text-green-600", icon: <CheckCircleIcon fontSize="small" />, bg: "bg-green-50" },
    { label: "On-chain Anchored", value: data.total_on_chain, change: "18.7%", tone: "text-[#7c3aed]", icon: <LinkIcon fontSize="small" />, bg: "bg-[#f5f3ff]" },
    { label: "Failed", value: data.total_failed, change: "6.3%", tone: "text-red-600", icon: <ErrorIcon fontSize="small" />, bg: "bg-red-50" },
  ];

  return (
    <Panel
      title="Processing Summary"
      action={<DashboardSelect ariaLabel="Processing summary range" defaultValue="7 Days" options={["24 Hours", "7 Days", "30 Days", "90 Days"]} />}
      className={className}
    >
      <div className="mt-3 divide-y divide-[#E4EEF9]">
        {rows.map((row) => (
          <div className="flex items-center gap-3 py-2" key={row.label}>
            <IconBadge icon={row.icon} color={`${row.bg} ${row.tone}`} />
            <p className="min-w-0 flex-1 text-sm font-semibold text-[#64748b]">{row.label}</p>
            <p className="text-sm font-black text-[#0C2B49]">{row.value.toLocaleString()}</p>
            <p className={`text-xs font-black ${row.tone}`}><TrendingUpIcon fontSize="small" /> {row.change}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

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

  return (
    <AdminShell activeHref="/admin/dashboard">
      <div className="flex h-full w-full flex-col gap-4 xl:h-[calc(100dvh-48px)] xl:min-h-0 xl:overflow-hidden">
        <PageHeader
          title="Dashboard"
          description="Live platform health — document processing, blockchain anchoring, and user activity."
          action={<DashboardHeaderControls />}
        />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {stats.map((card) => <DashboardStatCard key={card.label} {...card} />)}
        </section>

        <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-12 xl:grid-rows-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <PlatformOverviewChart className="xl:col-span-5 xl:h-full" />
          <ProcessingSummary data={data} className="xl:col-span-3 xl:h-full" />
          <SystemHealth className="xl:col-span-4 xl:h-full" />
          <NeedsAttention data={data} className="xl:col-span-4 xl:h-full" />
          <UserRoleDistribution data={data} className="xl:col-span-4 xl:h-full" />
          <RecentActivity recentUsers={recentUsers} className="xl:col-span-4 xl:h-full" />
        </section>
      </div>
    </AdminShell>
  );
}
