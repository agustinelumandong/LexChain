"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import ShieldIcon from "@mui/icons-material/Shield";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import TuneIcon from "@mui/icons-material/Tune";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Dropdown } from "../components/dropdown";

type RoleRow = {
  id: string;
  name: string;
  users: number;
  scope: string;
  permissions: string;
  status: "Active" | "Pending Review";
  updated: string;
  category: "admin" | "issuer" | "participant" | "verifier" | "review";
  access: "Full Access" | "Administrative" | "Issuer" | "Participant" | "Verifier" | "Review";
};

type PermissionRow = {
  id: string;
  name: string;
  group: "Documents" | "Users" | "Reports" | "Audit" | "Invitations" | "System";
  scope: string;
  assignedRoles: string;
  rule: string;
  status: "Active" | "Pending Review";
  updated: string;
};

const roles: RoleRow[] = [
  { id: "role_super_admin", name: "Super Admin", users: 2, scope: "Global", permissions: "Full Access", status: "Active", updated: "Today", category: "admin", access: "Full Access" },
  { id: "role_admin", name: "Admin", users: 16, scope: "System", permissions: "User & report management", status: "Active", updated: "2h ago", category: "admin", access: "Administrative" },
  { id: "role_issuer", name: "Document Issuer", users: 40, scope: "Owned documents", permissions: "Upload, manage, invite", status: "Active", updated: "25m ago", category: "issuer", access: "Issuer" },
  { id: "role_participant", name: "Participant", users: 96, scope: "Shared documents", permissions: "View / comment", status: "Active", updated: "1h ago", category: "participant", access: "Participant" },
  { id: "role_verifier", name: "Public Verifier", users: 12, scope: "Verification portal", permissions: "Verify only", status: "Active", updated: "3h ago", category: "verifier", access: "Verifier" },
  { id: "role_reviewer", name: "Compliance Reviewer", users: 4, scope: "Audit and reports", permissions: "Read-only compliance access", status: "Pending Review", updated: "Yesterday", category: "review", access: "Review" },
];

const permissions: PermissionRow[] = [
  { id: "perm_documents_upload", name: "Upload Documents", group: "Documents", scope: "Owned documents", assignedRoles: "Document Issuer, Admin", rule: "Create and submit records", status: "Active", updated: "15m ago" },
  { id: "perm_documents_share", name: "Invite Document Viewers", group: "Invitations", scope: "Owned documents", assignedRoles: "Document Issuer", rule: "Invite participant access", status: "Active", updated: "28m ago" },
  { id: "perm_verify_public", name: "Run Public Verification", group: "Documents", scope: "Verification portal", assignedRoles: "Public Verifier, Participant", rule: "Verify authenticity only", status: "Active", updated: "1h ago" },
  { id: "perm_reports_export", name: "Export Reports", group: "Reports", scope: "Admin reports", assignedRoles: "Super Admin, Admin", rule: "Download PDF / CSV / TXT", status: "Active", updated: "2h ago" },
  { id: "perm_audit_review", name: "Review Audit Logs", group: "Audit", scope: "Compliance logs", assignedRoles: "Super Admin, Compliance Reviewer", rule: "Read-only trace review", status: "Pending Review", updated: "Yesterday" },
  { id: "perm_roles_manage", name: "Manage Roles", group: "Users", scope: "Role directory", assignedRoles: "Super Admin", rule: "Create, edit, approve roles", status: "Active", updated: "Today" },
];

const managementTabs = [
  { label: "Roles Management", value: "roles" },
  { label: "Permission Management", value: "permissions" },
];

const activities = [
  { label: "Super Admin permission updated — Maria Santos", time: "12m ago", icon: <ShieldIcon fontSize="small" />, color: "text-[#0879D8]" },
  { label: "Issuer role assigned — Andrea Dizon", time: "28m ago", icon: <DescriptionIcon fontSize="small" />, color: "text-[#7C3AED]" },
  { label: "Participant access expanded — Sofia Tan", time: "1h ago", icon: <GroupsIcon fontSize="small" />, color: "text-[#F97316]" },
  { label: "Verifier role created — System", time: "2h ago", icon: <VerifiedUserIcon fontSize="small" />, color: "text-[#06B6D4]" },
  { label: "Compliance Reviewer pending approval", time: "Yesterday", icon: <ScheduleIcon fontSize="small" />, color: "text-[#F59E0B]" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: "blue" | "green" | "purple" | "orange" | "cyan" | "red" }) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#0879D8]",
    green: "bg-[#EAFBF1] text-[#16A34A]",
    purple: "bg-[#F4ECFF] text-[#7C3AED]",
    orange: "bg-[#FFF1E8] text-[#F97316]",
    cyan: "bg-[#E6FAFF] text-[#06B6D4]",
    red: "bg-[#FEECEC] text-[#EF4444]",
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

function RoleIcon({ category }: { category: RoleRow["category"] }) {
  const styles = {
    admin: "bg-[#EAF3FF] text-[#0879D8]",
    issuer: "bg-[#F4ECFF] text-[#7C3AED]",
    participant: "bg-[#FFF1E8] text-[#F97316]",
    verifier: "bg-[#E6FAFF] text-[#06B6D4]",
    review: "bg-[#EEF4FB] text-[#2563EB]",
  };
  const icons = {
    admin: <ShieldIcon fontSize="small" />,
    issuer: <DescriptionIcon fontSize="small" />,
    participant: <GroupsIcon fontSize="small" />,
    verifier: <VerifiedUserIcon fontSize="small" />,
    review: <ShieldIcon fontSize="small" />,
  };
  return <span className={cn("flex size-10 items-center justify-center rounded-xl", styles[category])}>{icons[category]}</span>;
}

function StatusPill({ status }: { status: RoleRow["status"] | PermissionRow["status"] }) {
  return (
    <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-black", status === "Active" ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]" : "border-[#FED7AA] bg-[#FFF7ED] text-[#F59E0B]")}>
      {status}
    </span>
  );
}

function RowActions({ name }: { name: string }) {
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
      <button type="button" aria-label={`View ${name}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" aria-label={`Edit ${name}`} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><EditIcon sx={{ fontSize: 18 }} /></button>
      <button type="button" aria-label={`More actions for ${name}`} onClick={() => setOpen((value) => !value)} className="rounded-lg p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"><MoreVertIcon sx={{ fontSize: 18 }} /></button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-xl shadow-[#183B6B]/10">
          {["Duplicate role", "Review members", "Archive role"].map((action) => (
            <button key={action} type="button" onClick={() => setOpen(false)} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">{action}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PermissionDistribution({ rows }: { rows: RoleRow[] }) {
  const groups = [
    { label: "Full Access", access: "Full Access", color: "#0B67F2" },
    { label: "Administrative", access: "Administrative", color: "#16A34A" },
    { label: "Issuer", access: "Issuer", color: "#7C3AED" },
    { label: "Participant", access: "Participant", color: "#F97316" },
    { label: "Verifier", access: "Verifier", color: "#06B6D4" },
    { label: "Review", access: "Review", color: "#4F66D8" },
  ] as const;
  const total = Math.max(1, rows.length);
  let cursor = 0;
  const gradient = groups.map((group) => {
    const count = rows.filter((row) => row.access === group.access).length;
    const start = cursor;
    cursor += (count / total) * 100;
    return `${group.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <article className="flex min-h-[240px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Permission Distribution</h2>
        <InfoOutlinedIcon fontSize="small" className="text-[#7C8DA5]" />
      </div>
      <div className="admin-table-scroll grid min-h-0 flex-1 items-center gap-5 overflow-auto pr-1 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
        <div className="relative mx-auto size-34 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Active Roles</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {groups.map((group) => {
            const count = rows.filter((row) => row.access === group.access).length;
            return (
              <div key={group.access} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="min-w-0 flex-1 font-semibold text-[#0C2B49]">{group.label}</span>
                <strong className="font-black text-[#071B33]">{count}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function RecentRoleActivity() {
  return (
    <article className="flex min-h-[240px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Recent Role Activity</h2>
        <Link href="/admin/audit-logs" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View logs</Link>
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {activities.map((item) => (
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

export function RolesPermissionsView() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [activeView, setActiveView] = useState<"roles" | "permissions">("roles");
  const [accessFilter, setAccessFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const accessOptions = useMemo(() => [...new Set(roles.map((role) => role.access))], []);
  const roleFiltered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesSearch = !query || role.name.toLowerCase().includes(query) || role.permissions.toLowerCase().includes(query) || role.scope.toLowerCase().includes(query);
      const matchesAccess = accessFilter === "all" || role.access === accessFilter;
      const matchesStatus = statusFilter === "all" || role.status === statusFilter;
      const matchesGroup = groupFilter === "all" || role.category === groupFilter;
      return matchesSearch && matchesAccess && matchesStatus && matchesGroup;
    });
  }, [accessFilter, groupFilter, headerSearch, statusFilter, tableSearch]);

  const permissionFiltered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return permissions.filter((permission) => {
      const matchesSearch = !query || permission.name.toLowerCase().includes(query) || permission.group.toLowerCase().includes(query) || permission.scope.toLowerCase().includes(query) || permission.assignedRoles.toLowerCase().includes(query) || permission.rule.toLowerCase().includes(query);
      const matchesAccess = accessFilter === "all" || permission.assignedRoles.includes(accessFilter) || permission.group === accessFilter;
      const matchesStatus = statusFilter === "all" || permission.status === statusFilter;
      const matchesGroup = groupFilter === "all" || permission.group.toLowerCase() === groupFilter;
      return matchesSearch && matchesAccess && matchesStatus && matchesGroup;
    });
  }, [accessFilter, groupFilter, headerSearch, statusFilter, tableSearch]);

  const visibleCount = activeView === "roles" ? roleFiltered.length : permissionFiltered.length;

  const metrics = [
    { label: "Total Roles", value: roles.length, detail: "System-defined roles", icon: <ShieldIcon fontSize="small" />, tone: "blue" as const },
    { label: "Admins", value: 18, detail: "Administrative accounts", icon: <ManageAccountsIcon fontSize="small" />, tone: "green" as const },
    { label: "Document Issuers", value: 40, detail: "Active issuer accounts", icon: <DescriptionIcon fontSize="small" />, tone: "purple" as const },
    { label: "Participants", value: 96, detail: "Shared-access users", icon: <GroupsIcon fontSize="small" />, tone: "orange" as const },
    { label: "Public Verifiers", value: 12, detail: "Verification-only accounts", icon: <VerifiedUserIcon fontSize="small" />, tone: "cyan" as const },
    { label: "Custom Permissions", value: 24, detail: "Granular access rules", icon: <TuneIcon fontSize="small" />, tone: "blue" as const },
    { label: "Pending Changes", value: 9, detail: "Awaiting approval", icon: <ScheduleIcon fontSize="small" />, tone: "red" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5 xl:h-[calc(100vh-48px)] xl:overflow-hidden">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Super Admin</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">User Roles & Permissions</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Manage role assignments, access scopes, and permission policies across the platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[330px] items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 shadow-sm shadow-[#DDEAF7]/35 focus-within:border-[#0985E7]">
            <SearchIcon fontSize="small" className="text-[#4B6382]" />
            <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} placeholder="Search roles, users, or permissions..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
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
            <AddIcon fontSize="small" />
            Create Role
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:min-h-0">
          <div className="border-b border-[#E4EEF9] p-5">
            <div className="overflow-x-auto pb-1">
              <div className="inline-flex min-w-max gap-4 border-b border-[#E4EEF9]">
                {managementTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveView(tab.value as "roles" | "permissions");
                      setAccessFilter("all");
                      setStatusFilter("all");
                      setGroupFilter("all");
                    }}
                    className={cn("border-b-2 px-2 pb-3 text-sm font-black transition", activeView === tab.value ? "border-[#0985E7] text-[#0985E7]" : "border-transparent text-[#4B6382] hover:text-[#0985E7]")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7]">
                <SearchIcon fontSize="small" className="text-[#4B6382]" />
                <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder={activeView === "roles" ? "Search role definitions..." : "Search permission rules..."} className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
              </label>
              <Dropdown
                value={accessFilter}
                onChange={setAccessFilter}
                options={activeView === "roles"
                  ? [{ label: "Access Level", value: "all" }, ...accessOptions.map((access) => ({ label: access, value: access }))]
                  : [{ label: "Access Level", value: "all" }, { label: "Documents", value: "Documents" }, { label: "Users", value: "Users" }, { label: "Reports", value: "Reports" }, { label: "Audit", value: "Audit" }, { label: "Invitations", value: "Invitations" }]}
              />
              <Dropdown value={statusFilter} onChange={setStatusFilter} options={[{ label: "Status", value: "all" }, { label: "Active", value: "Active" }, { label: "Pending Review", value: "Pending Review" }]} />
              <Dropdown
                value={groupFilter}
                onChange={setGroupFilter}
                options={activeView === "roles"
                  ? [{ label: "Permission Group", value: "all" }, { label: "Admin", value: "admin" }, { label: "Issuer", value: "issuer" }, { label: "Participant", value: "participant" }, { label: "Verifier", value: "verifier" }, { label: "Review", value: "review" }]
                  : [{ label: "Permission Group", value: "all" }, { label: "Documents", value: "documents" }, { label: "Users", value: "users" }, { label: "Reports", value: "reports" }, { label: "Audit", value: "audit" }, { label: "Invitations", value: "invitations" }, { label: "System", value: "system" }]}
              />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <TuneIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            {activeView === "roles" ? (
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Assigned Users</th>
                    <th className="px-5 py-3">Access Scope</th>
                    <th className="px-5 py-3">Core Permissions</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleFiltered.map((role) => (
                    <tr key={role.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <RoleIcon category={role.category} />
                          <span className="font-black text-[#071B33]">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{role.users}</td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{role.scope}</td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{role.permissions}</td>
                      <td className="px-5 py-3"><StatusPill status={role.status} /></td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{role.updated}</td>
                      <td className="px-5 py-3"><RowActions name={role.name} /></td>
                    </tr>
                  ))}
                  {roleFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No roles match the current filters.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                    <th className="px-5 py-3">Permission</th>
                    <th className="px-5 py-3">Group</th>
                    <th className="px-5 py-3">Access Scope</th>
                    <th className="px-5 py-3">Assigned Roles</th>
                    <th className="px-5 py-3">Rule</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionFiltered.map((permission) => (
                    <tr key={permission.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0879D8]"><TuneIcon fontSize="small" /></span>
                          <span className="font-black text-[#071B33]">{permission.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{permission.group}</td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{permission.scope}</td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{permission.assignedRoles}</td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{permission.rule}</td>
                      <td className="px-5 py-3"><StatusPill status={permission.status} /></td>
                      <td className="px-5 py-3 font-semibold text-[#0C2B49]">{permission.updated}</td>
                      <td className="px-5 py-3"><RowActions name={permission.name} /></td>
                    </tr>
                  ))}
                  {permissionFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No permissions match the current filters.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#5B6F8A]">Showing 1-{visibleCount} of {visibleCount} {activeView === "roles" ? "roles" : "permissions"}</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] opacity-35">‹</button>
              <button type="button" className="size-9 rounded-lg border border-[#0985E7] bg-[#EAF3FF] text-sm font-black text-[#0879D8]">1</button>
              <button type="button" disabled className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] opacity-35">›</button>
            </div>
          </div>
        </article>

        <aside className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <PermissionDistribution rows={roles} />
          <RecentRoleActivity />
        </aside>
      </section>
    </div>
  );
}
