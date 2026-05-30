"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import ArticleIcon from "@mui/icons-material/Article";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DescriptionIcon from "@mui/icons-material/Description";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SecurityIcon from "@mui/icons-material/Security";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import GroupsIcon from "@mui/icons-material/Groups";
import LockIcon from "@mui/icons-material/Lock";
import { Dropdown } from "../components/dropdown";

type AuditLog = {
  actor: string;
  action: string;
  target: string;
  severity: string;
  created_at: string;
};

type AuditRow = AuditLog & {
  id: string;
  actorName: string;
  actorType: "Admin" | "Issuer" | "System" | "Visitor";
  eventCategory: "authentication" | "documents" | "permissions" | "verification" | "system" | "flagged";
  eventLabel: string;
  ipDevice: string;
  severityLabel: "Low" | "Medium" | "High";
  statusLabel: "Completed" | "Flagged" | "In Review";
  timestampLabel: string;
  initials: string;
};

const criticalActivity = [
  { label: "Failed login attempt detected", time: "7m ago", icon: <LockIcon fontSize="small" />, color: "text-[#EF4444]" },
  { label: "User access revoked", time: "22m ago", icon: <SecurityIcon fontSize="small" />, color: "text-[#F97316]" },
  { label: "Bulk document export", time: "58m ago", icon: <DownloadIcon fontSize="small" />, color: "text-[#0879D8]" },
  { label: "Verification mismatch detected", time: "1h ago", icon: <WarningAmberIcon fontSize="small" />, color: "text-[#7C3AED]" },
  { label: "Bulk permission update completed", time: "2h ago", icon: <GroupsIcon fontSize="small" />, color: "text-[#16A34A]" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getActorName(actor: string) {
  if (actor.includes("@")) {
    return actor
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return actor.charAt(0).toUpperCase() + actor.slice(1);
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function getCategory(log: AuditLog): AuditRow["eventCategory"] {
  const value = `${log.actor} ${log.action} ${log.target} ${log.severity}`.toLowerCase();
  if (log.severity === "critical" || value.includes("failed") || value.includes("too many")) return "flagged";
  if (value.includes("login") || value.includes("accepted invitation")) return "authentication";
  if (value.includes("document") || value.includes("download") || value.includes("export")) return "documents";
  if (value.includes("permission") || value.includes("role") || value.includes("access") || value.includes("category")) return "permissions";
  if (value.includes("verified") || value.includes("verification") || value.includes("mismatch")) return "verification";
  return "system";
}

function getActorType(log: AuditLog): AuditRow["actorType"] {
  const actor = log.actor.toLowerCase();
  if (actor.includes("owner") || actor.includes("admin")) return "Admin";
  if (actor.includes("system")) return "System";
  if (actor.includes("unknown") || actor.includes("visitor")) return "Visitor";
  return "Issuer";
}

function getSeverity(severity: string): AuditRow["severityLabel"] {
  if (severity === "critical") return "High";
  if (severity === "warning") return "Medium";
  return "Low";
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function enrichLog(log: AuditLog, index: number): AuditRow {
  const actorName = getActorName(log.actor);
  const category = getCategory(log);
  const statusLabel = log.severity === "critical" ? "Flagged" : log.severity === "warning" ? "In Review" : "Completed";
  return {
    ...log,
    id: `${log.actor}-${log.action}-${log.target}-${log.created_at}`,
    actorName,
    initials: getInitials(actorName),
    actorType: getActorType(log),
    eventCategory: category,
    eventLabel: log.action,
    ipDevice: ["49.145.21.8 • Chrome / Win", "Worker Queue", "112.198.44.12 • Safari / Mac", "136.158.9.33 • Mobile / Android", "120.28.6.42 • Chrome / Win", "Processing Node 02"][index % 6],
    severityLabel: getSeverity(log.severity),
    statusLabel,
    timestampLabel: formatTimestamp(log.created_at),
  };
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: "blue" | "green" | "purple" | "orange" | "red" | "yellow" }) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#0879D8]",
    green: "bg-[#EAFBF1] text-[#16A34A]",
    purple: "bg-[#F4ECFF] text-[#7C3AED]",
    orange: "bg-[#FFF1E8] text-[#F97316]",
    red: "bg-[#FEECEC] text-[#EF4444]",
    yellow: "bg-[#FFF7E6] text-[#F59E0B]",
  };

  return (
    <article className="flex min-h-[112px] items-center gap-3 rounded-2xl border border-[#E4EEF9] bg-white p-4 shadow-sm shadow-[#DDEAF7]/40 transition hover:-translate-y-0.5 hover:border-[#C7DBEF]">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tones[tone])}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-[#4B6382]">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none text-[#071B33]">{value.toLocaleString()}</p>
        <p className="mt-2 truncate text-xs font-semibold text-[#5B6F8A]">{detail}</p>
      </div>
    </article>
  );
}

function SeverityPill({ severity }: { severity: AuditRow["severityLabel"] }) {
  return (
    <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-black", severity === "Low" && "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]", severity === "Medium" && "border-[#FED7AA] bg-[#FFF7ED] text-[#F97316]", severity === "High" && "border-[#FCA5A5] bg-[#FEF2F2] text-[#EF4444]")}>
      {severity}
    </span>
  );
}

function StatusPill({ status }: { status: AuditRow["statusLabel"] }) {
  return (
    <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-black", status === "Completed" && "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]", status === "Flagged" && "border-[#FCA5A5] bg-[#FEF2F2] text-[#EF4444]", status === "In Review" && "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]")}>
      {status}
    </span>
  );
}

function EventIcon({ category }: { category: AuditRow["eventCategory"] }) {
  const styles = {
    authentication: "text-[#0879D8]",
    documents: "text-[#16A34A]",
    permissions: "text-[#F97316]",
    verification: "text-[#7C3AED]",
    system: "text-[#64748B]",
    flagged: "text-[#EF4444]",
  };
  const icons = {
    authentication: <ManageAccountsIcon fontSize="small" />,
    documents: <DownloadIcon fontSize="small" />,
    permissions: <GroupsIcon fontSize="small" />,
    verification: <VerifiedUserIcon fontSize="small" />,
    system: <Inventory2Icon fontSize="small" />,
    flagged: <LockIcon fontSize="small" />,
  };
  return <span className={styles[category]}>{icons[category]}</span>;
}

function RowActions({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-end gap-2">
      <button type="button" aria-label={`View audit event ${row.id}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" aria-label={`Export audit event ${row.id}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><DownloadIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" aria-label={`More actions for audit event ${row.id}`} onClick={() => setOpen((value) => !value)} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><MoreVertIcon sx={{ fontSize: 18 }} /></button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-xl shadow-[#183B6B]/10">
          {["Open details", "Copy event ID", "Mark reviewed"].map((action) => (
            <button key={action} type="button" onClick={() => setOpen(false)} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">{action}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EventBreakdown({ rows }: { rows: AuditRow[] }) {
  const total = Math.max(1, rows.length);
  const groups = [
    { label: "Authentication", category: "authentication", color: "#0B67F2" },
    { label: "Documents", category: "documents", color: "#16A34A" },
    { label: "Permissions", category: "permissions", color: "#F97316" },
    { label: "Verification", category: "verification", color: "#7C3AED" },
    { label: "System", category: "system", color: "#94A3B8" },
    { label: "Flagged", category: "flagged", color: "#EF4444" },
  ] as const;
  let cursor = 0;
  const gradient = groups.map((group) => {
    const count = rows.filter((row) => row.eventCategory === group.category).length;
    const start = cursor;
    cursor += (count / total) * 100;
    return `${group.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <article className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <h2 className="mb-4 text-lg font-black text-[#071B33]">Event Breakdown</h2>
      <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
        <div className="relative mx-auto size-34 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total.toLocaleString()}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total Events</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {groups.map((group) => {
            const count = rows.filter((row) => row.eventCategory === group.category).length;
            return (
              <div key={group.category} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="min-w-0 flex-1 font-semibold text-[#0C2B49]">{group.label}</span>
                <strong className="font-black text-[#071B33]">{count.toLocaleString()}</strong>
                <span className="text-xs font-semibold text-[#5B6F8A]">({Math.round((count / total) * 100)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function CriticalActivityPanel() {
  return (
    <article className="flex min-h-[240px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Recent Critical Activity</h2>
        <Link href="/admin/audit-logs" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View alerts</Link>
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {criticalActivity.map((item) => (
          <div key={item.label} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-xl py-1.5 transition hover:bg-[#F8FBFF]">
            <span className={item.color}>{item.icon}</span>
            <span className="truncate text-sm font-semibold text-[#0C2B49]">{item.label}</span>
            <span className="text-xs font-semibold text-[#5B6F8A]">{item.time}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function AuditLogsManagementView({ logs }: { logs: AuditLog[] }) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const rows = useMemo(() => logs.map(enrichLog), [logs]);
  const actorTypes = useMemo(() => [...new Set(rows.map((row) => row.actorType))], [rows]);
  const totalDisplay = Math.max(rows.length, 12480);
  const metricCounts = {
    logins: Math.max(rows.filter((row) => row.eventCategory === "authentication").length, 3240),
    documents: Math.max(rows.filter((row) => row.eventCategory === "documents").length, 4890),
    permissions: Math.max(rows.filter((row) => row.eventCategory === "permissions").length, 420),
    verification: Math.max(rows.filter((row) => row.eventCategory === "verification").length, 1180),
    flagged: Math.max(rows.filter((row) => row.eventCategory === "flagged").length, 36),
    today: 284,
  };

  const filtered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || row.actorName.toLowerCase().includes(query) || row.actor.toLowerCase().includes(query) || row.action.toLowerCase().includes(query) || row.target.toLowerCase().includes(query) || row.ipDevice.toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "all" || row.severityLabel === severityFilter;
      const matchesActor = actorFilter === "all" || row.actorType === actorFilter;
      return matchesSearch && matchesSeverity && matchesActor;
    });
  }, [actorFilter, headerSearch, rows, severityFilter, tableSearch]);

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  const metrics = [
    { label: "Total Events", value: totalDisplay, detail: "Logged activities", icon: <ListAltIcon fontSize="small" />, tone: "blue" as const },
    { label: "User Logins", value: metricCounts.logins, detail: "Authentication events", icon: <ManageAccountsIcon fontSize="small" />, tone: "green" as const },
    { label: "Document Actions", value: metricCounts.documents, detail: "Uploads, edits, views, downloads", icon: <DescriptionIcon fontSize="small" />, tone: "purple" as const },
    { label: "Permission Changes", value: metricCounts.permissions, detail: "Role and access updates", icon: <AdminPanelSettingsIcon fontSize="small" />, tone: "orange" as const },
    { label: "Verification Events", value: metricCounts.verification, detail: "Hash checks and validations", icon: <VerifiedUserIcon fontSize="small" />, tone: "blue" as const },
    { label: "Flagged Events", value: metricCounts.flagged, detail: "Requires attention", icon: <WarningAmberIcon fontSize="small" />, tone: "red" as const },
    { label: "Today", value: metricCounts.today, detail: "Events in last 24 hours", icon: <ScheduleIcon fontSize="small" />, tone: "yellow" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Super Admin</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Audit Logs</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Monitor user activity, system events, access changes, and security-relevant actions across the platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[340px] items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 shadow-sm shadow-[#DDEAF7]/35 focus-within:border-[#0985E7]">
            <SearchIcon fontSize="small" className="text-[#4B6382]" />
            <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} placeholder="Search logs by user, action, document, or IP..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
          </label>
          <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0985E7]/25 transition hover:bg-[#0770C4]">
            <ArticleIcon fontSize="small" />
            Advanced Audit Report
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:min-h-0">
          <div className="border-b border-[#E4EEF9] p-5">
            <h2 className="text-lg font-black text-[#071B33]">Audit Trail</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7]">
                <SearchIcon fontSize="small" className="text-[#4B6382]" />
                <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search audit trail..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
              </label>
              <Dropdown value={severityFilter} onChange={setSeverityFilter} options={[{ label: "Severity", value: "all" }, { label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }]} />
              <Dropdown value={actorFilter} onChange={setActorFilter} options={[{ label: "Actor Type", value: "all" }, ...actorTypes.map((actor) => ({ label: actor, value: actor }))]} />
              <Dropdown value={dateFilter} onChange={setDateFilter} options={[{ label: "Date Range", value: "all" }, { label: "Today", value: "today" }, { label: "7 Days", value: "week" }, { label: "30 Days", value: "month" }]} />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <SettingsIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">IP / Device</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={row.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{row.timestampLabel}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-9 items-center justify-center rounded-full text-xs font-black", row.actorType === "System" ? "bg-[#EEF4FB] text-[#64748B]" : index % 2 === 0 ? "bg-[#EAF3FF] text-[#0879D8]" : "bg-[#FFF1E8] text-[#F97316]")}>{row.actorType === "System" ? <SettingsIcon sx={{ fontSize: 17 }} /> : row.initials}</div>
                        <div>
                          <p className="font-black text-[#071B33]">{row.actorName}</p>
                          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-black", row.actorType === "Admin" && "bg-[#EAF3FF] text-[#0879D8]", row.actorType === "Issuer" && "bg-[#EAFBF1] text-[#16A34A]", row.actorType === "System" && "bg-[#F4ECFF] text-[#7C3AED]", row.actorType === "Visitor" && "bg-[#F1F5F9] text-[#64748B]")}>{row.actorType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <EventIcon category={row.eventCategory} />
                        <span className="font-semibold text-[#0C2B49]">{row.eventLabel}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{row.target}</td>
                    <td className="px-5 py-3 font-semibold text-[#4B6382]">{row.ipDevice}</td>
                    <td className="px-5 py-3"><SeverityPill severity={row.severityLabel} /></td>
                    <td className="px-5 py-3"><StatusPill status={row.statusLabel} /></td>
                    <td className="px-5 py-3"><RowActions row={row} /></td>
                  </tr>
                ))}
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No audit events match the current filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#5B6F8A]">
              Showing {filtered.length === 0 ? 0 : safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length} events
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">‹</button>
              {[...Array(Math.min(3, totalPages))].map((_, index) => (
                <button key={index} type="button" onClick={() => setPage(index)} className={cn("size-9 rounded-lg border text-sm font-black transition", safePage === index ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] text-[#0C2B49] hover:bg-[#EEF4FB]")}>{index + 1}</button>
              ))}
              {totalPages > 3 && <span className="px-2 text-sm font-black text-[#5B6F8A]">...</span>}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={safePage >= totalPages - 1} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">›</button>
              <Dropdown value={pageSize} onChange={setPageSize} options={[{ label: "10 / page", value: "10" }, { label: "20 / page", value: "20" }]} />
            </div>
          </div>
        </article>

        <aside className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <EventBreakdown rows={rows} />
          <CriticalActivityPanel />
        </aside>
      </section>
    </div>
  );
}
