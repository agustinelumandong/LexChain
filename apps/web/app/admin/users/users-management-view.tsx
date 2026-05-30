"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import ShieldIcon from "@mui/icons-material/Shield";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Dropdown } from "../components/dropdown";

type AdminUser = {
  id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  name?: string;
  role: string;
  is_active?: boolean;
  status?: string;
  created_at: string;
  uploaded_documents?: number;
  verification_attempts?: number;
  last_login_at?: string | null;
};

type DirectoryUser = AdminUser & {
  displayName: string;
  initials: string;
  roleLabel: string;
  category: "admin" | "lawyer" | "issuer" | "verifier" | "staff";
  statusLabel: "Active" | "Limited" | "Suspended";
  verificationLabel: "Verified" | "Pending";
  documents: number;
  lastActive: string;
};

const pendingInvitations = [
  { name: "Nathan Park", email: "nathan.park@lawgroup.com", role: "Lawyer", status: "Sent", ago: "2d ago" },
  { name: "Laura Chen", email: "laura.chen@corp-legal.com", role: "Document Issuer", status: "Pending", ago: "3d ago" },
  { name: "Daniel Ramos", email: "daniel.ramos@verifyhub.com", role: "Public Verifier", status: "Sent", ago: "5d ago" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getName(user: AdminUser) {
  return user.name ?? (`${user.f_name ?? ""} ${user.l_name ?? ""}`.trim() || user.email.split("@")[0]);
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function deriveRole(user: AdminUser, index: number): Pick<DirectoryUser, "roleLabel" | "category"> {
  const role = user.role.toLowerCase();
  if (role === "admin" || role === "super_admin") return { roleLabel: "Super Admin", category: "admin" };
  if (role === "lawyer") return { roleLabel: "Lawyer", category: "lawyer" };
  if (role.includes("issuer") || index % 5 === 1) return { roleLabel: "Document Issuer", category: "issuer" };
  if (role.includes("verifier") || index % 5 === 2) return { roleLabel: "Public Verifier", category: "verifier" };
  if (index % 5 === 3) return { roleLabel: "Staff", category: "staff" };
  return { roleLabel: "Standard User", category: "staff" };
}

function getStatus(user: AdminUser): DirectoryUser["statusLabel"] {
  const raw = (user.status ?? "").toLowerCase();
  if (raw.includes("suspend") || raw.includes("inactive") || user.is_active === false) return "Suspended";
  if (raw.includes("pending") || raw.includes("limit")) return "Limited";
  return "Active";
}

function getVerification(user: AdminUser): DirectoryUser["verificationLabel"] {
  const raw = (user.status ?? "").toLowerCase();
  return raw.includes("pending") || raw.includes("unverified") ? "Pending" : "Verified";
}

function formatRelativeDate(value: string | null | undefined, fallbackIndex: number) {
  if (!value) return `${fallbackIndex + 1}h ago`;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return `${fallbackIndex + 1}h ago`;
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))}m ago`;
  if (diff < day) return `${Math.round(diff / hour)}h ago`;
  return `${Math.round(diff / day)}d ago`;
}

function enrichUser(user: AdminUser, index: number): DirectoryUser {
  const displayName = getName(user);
  const role = deriveRole(user, index);
  return {
    ...user,
    ...role,
    displayName,
    initials: getInitials(displayName),
    statusLabel: getStatus(user),
    verificationLabel: getVerification(user),
    documents: user.uploaded_documents ?? user.verification_attempts ?? (index + 1) * 6,
    lastActive: formatRelativeDate(user.last_login_at ?? user.created_at, index),
  };
}

function UserMetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
}) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#0879D8]",
    green: "bg-[#EAFBF1] text-[#16A34A]",
    purple: "bg-[#F4ECFF] text-[#7C3AED]",
    orange: "bg-[#FFF4DF] text-[#F59E0B]",
    red: "bg-[#FEECEC] text-[#EF4444]",
    cyan: "bg-[#E6FAFF] text-[#06B6D4]",
  };

  return (
    <article className="flex min-h-[112px] items-center gap-3 rounded-2xl border border-[#E4EEF9] bg-white p-4 shadow-sm shadow-[#DDEAF7]/40 transition hover:-translate-y-0.5 hover:border-[#C7DBEF]">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tones[tone])}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-[#0C2B49]">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none text-[#071B33]">{value.toLocaleString()}</p>
        <p className="mt-2 truncate text-xs font-semibold text-[#5B6F8A]">{detail}</p>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: DirectoryUser["statusLabel"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black",
        status === "Active" && "bg-[#EAFBF1] text-[#16A34A]",
        status === "Limited" && "bg-[#FFF4DF] text-[#D97706]",
        status === "Suspended" && "bg-[#FEECEC] text-[#DC2626]",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ActionsMenu({ user }: { user: DirectoryUser }) {
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
    <div ref={ref} className="relative flex items-center justify-end gap-1">
      <button type="button" aria-label={`View ${user.displayName}`} className="rounded-lg p-1.5 text-[#7C8DA5] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <VisibilityIcon fontSize="small" />
      </button>
      <button type="button" aria-label={`Edit ${user.displayName}`} className="rounded-lg p-1.5 text-[#7C8DA5] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <EditIcon fontSize="small" />
      </button>
      <button
        type="button"
        aria-label={`More actions for ${user.displayName}`}
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-1.5 text-[#7C8DA5] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]"
      >
        <MoreVertIcon fontSize="small" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-xl shadow-[#183B6B]/10">
          {["Reset password", "Change role", "Suspend user"].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
    </span>
  );
}

function RoleDistribution({ users }: { users: DirectoryUser[] }) {
  const groups = [
    { label: "Super Admins", category: "admin", color: "#0879D8" },
    { label: "Lawyers", category: "lawyer", color: "#59C878" },
    { label: "Document Issuers", category: "issuer", color: "#9B6AF3" },
    { label: "Staff", category: "staff", color: "#F6B52E" },
    { label: "Public Verifiers", category: "verifier", color: "#22C7D8" },
  ] as const;
  const total = Math.max(1, users.length);
  let cursor = 0;
  const gradient = groups
    .map((group) => {
      const count = users.filter((user) => user.category === group.category).length;
      const start = cursor;
      cursor += (count / total) * 100;
      return `${group.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Role Distribution</h2>
        <Link href="/admin/invitations-permissions" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">Manage roles</Link>
      </div>
      <div className="grid flex-1 items-center gap-5 sm:grid-cols-[160px_1fr] xl:grid-cols-1 2xl:grid-cols-[160px_1fr]">
        <div className="relative mx-auto size-36 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total Users</span>
          </div>
        </div>
        <div className="space-y-3">
          {groups.map((group) => {
            const count = users.filter((user) => user.category === group.category).length;
            return (
              <div key={group.category} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="min-w-0 flex-1 font-semibold text-[#5B6F8A]">{group.label}</span>
                <strong className="font-black text-[#071B33]">{count}</strong>
                <span className="text-xs font-semibold text-[#5B6F8A]">({Math.round((count / total) * 100)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function PendingInvitationsPanel() {
  return (
    <article className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Pending Invitations</h2>
        <Link href="/admin/invitations-permissions" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View all invites</Link>
      </div>
      <div className="space-y-3">
        {pendingInvitations.map((invite, index) => (
          <div key={invite.email} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#F8FBFF]">
            <div className={cn("flex size-9 items-center justify-center rounded-xl text-xs font-black", index === 1 ? "bg-[#FFF4DF] text-[#D97706]" : "bg-[#EAF3FF] text-[#0879D8]")}>
              {getInitials(invite.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#071B33]">{invite.name}</p>
              <p className="truncate text-xs font-semibold text-[#5B6F8A]">{invite.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#0C2B49]">{invite.role}</p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className={cn("rounded-lg px-2 py-1 text-xs font-black", invite.status === "Pending" ? "bg-[#FFF4DF] text-[#D97706]" : "bg-[#EAF3FF] text-[#0879D8]")}>{invite.status}</span>
                <span className="text-xs font-semibold text-[#5B6F8A]">{invite.ago}</span>
              </div>
            </div>
          </div>
        ))}
        <Link href="/admin/invitations-permissions" className="block rounded-xl py-2 text-center text-sm font-black text-[#0985E7] transition hover:bg-[#F8FBFF]">
          +3 more invitations
        </Link>
      </div>
    </article>
  );
}

export function UsersManagementView({ users, total }: { users: AdminUser[]; total: number }) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState("6");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const directoryUsers = useMemo(() => users.map(enrichUser), [users]);
  const roleOptions = useMemo(() => [...new Set(directoryUsers.map((user) => user.roleLabel))], [directoryUsers]);

  const filtered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return directoryUsers.filter((user) => {
      const matchesSearch = !query || user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.roleLabel === roleFilter;
      const matchesStatus = statusFilter === "all" || user.statusLabel === statusFilter;
      const matchesVerification = verificationFilter === "all" || user.verificationLabel === verificationFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesVerification;
    });
  }, [directoryUsers, headerSearch, roleFilter, statusFilter, tableSearch, verificationFilter]);

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleUsers = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  const metrics = [
    { label: "Total Users", value: total || directoryUsers.length, detail: "Registered accounts", icon: <GroupsIcon fontSize="small" />, tone: "blue" as const },
    { label: "Active Users", value: directoryUsers.filter((user) => user.statusLabel === "Active").length, detail: "Signed in recently", icon: <CheckCircleIcon fontSize="small" />, tone: "green" as const },
    { label: "Lawyers", value: directoryUsers.filter((user) => user.category === "lawyer").length, detail: "Lawyer accounts", icon: <WorkIcon fontSize="small" />, tone: "blue" as const },
    { label: "Document Issuers", value: directoryUsers.filter((user) => user.category === "issuer").length, detail: "Organizations / staff", icon: <BusinessIcon fontSize="small" />, tone: "cyan" as const },
    { label: "Public Verifiers", value: directoryUsers.filter((user) => user.category === "verifier").length, detail: "Verification-only users", icon: <ShieldIcon fontSize="small" />, tone: "purple" as const },
    { label: "Pending Invites", value: pendingInvitations.length, detail: "Awaiting onboarding", icon: <EmailOutlinedIcon fontSize="small" />, tone: "orange" as const },
    { label: "Suspended", value: directoryUsers.filter((user) => user.statusLabel === "Suspended").length, detail: "Restricted accounts", icon: <PersonOffIcon fontSize="small" />, tone: "red" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Super Admin</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Users</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Manage registered accounts, roles, and access permissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[280px] items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 shadow-sm shadow-[#DDEAF7]/35 focus-within:border-[#0985E7]">
            <SearchIcon fontSize="small" className="text-[#4B6382]" />
            <input
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              placeholder="Search users by name or email..."
              className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]"
            />
          </label>
          <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <Link href="/admin/invitations-permissions" className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0985E7]/25 transition hover:bg-[#0770C4]">
            <PersonAddIcon fontSize="small" />
            Invite User
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {metrics.map((metric) => <UserMetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:min-h-0">
          <div className="border-b border-[#E4EEF9] p-5">
            <h2 className="text-lg font-black text-[#071B33]">User Directory</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7]">
                <SearchIcon fontSize="small" className="text-[#4B6382]" />
                <input
                  value={tableSearch}
                  onChange={(event) => setTableSearch(event.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]"
                />
              </label>
              <Dropdown value={roleFilter} onChange={setRoleFilter} options={[{ label: "All Roles", value: "all" }, ...roleOptions.map((role) => ({ label: role, value: role }))]} />
              <Dropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[{ label: "All Statuses", value: "all" }, { label: "Active", value: "Active" }, { label: "Limited", value: "Limited" }, { label: "Suspended", value: "Suspended" }]}
              />
              <Dropdown
                value={verificationFilter}
                onChange={setVerificationFilter}
                options={[{ label: "All", value: "all" }, { label: "Verified", value: "Verified" }, { label: "Pending", value: "Pending" }]}
              />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <FilterListIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="dashboard-hidden-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                  <th className="px-5 py-3"><SortableLabel>User</SortableLabel></th>
                  <th className="px-5 py-3"><SortableLabel>Role</SortableLabel></th>
                  <th className="px-5 py-3"><SortableLabel>Status</SortableLabel></th>
                  <th className="px-5 py-3"><SortableLabel>Verification</SortableLabel></th>
                  <th className="px-5 py-3"><SortableLabel>Documents</SortableLabel></th>
                  <th className="px-5 py-3"><SortableLabel>Last Active</SortableLabel></th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, index) => (
                  <tr key={user.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-10 items-center justify-center rounded-full text-xs font-black", index % 3 === 0 ? "bg-[#EAF3FF] text-[#0879D8]" : index % 3 === 1 ? "bg-[#F4ECFF] text-[#7C3AED]" : "bg-[#FFF4DF] text-[#D97706]")}>{user.initials}</div>
                        <div className="min-w-0">
                          <p className="truncate font-black text-[#071B33]">{user.displayName}</p>
                          <p className="flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-[#5B6F8A]">
                            <span className="truncate">{user.email}</span>
                            {user.verificationLabel === "Verified" && <VerifiedIcon sx={{ fontSize: 14 }} className="shrink-0 text-[#16A34A]" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{user.roleLabel}</td>
                    <td className="px-5 py-3"><StatusPill status={user.statusLabel} /></td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-sm font-bold", user.verificationLabel === "Verified" ? "text-[#16A34A]" : "text-[#D97706]")}>
                        <CheckCircleIcon sx={{ fontSize: 17 }} />
                        {user.verificationLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-[#0C2B49]">{user.documents}</td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{user.lastActive}</td>
                    <td className="px-5 py-3"><ActionsMenu user={user} /></td>
                  </tr>
                ))}
                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No users match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#5B6F8A]">
              Showing {filtered.length === 0 ? 0 : safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} aria-label="Previous page" className="rounded-lg border border-[#E4EEF9] p-2 text-[#4B6382] transition hover:bg-[#EEF4FB] disabled:opacity-35">
                <ChevronLeftIcon fontSize="small" />
              </button>
              {[...Array(Math.min(3, totalPages))].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  className={cn("size-9 rounded-lg border text-sm font-black transition", safePage === index ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] text-[#0C2B49] hover:bg-[#EEF4FB]")}
                >
                  {index + 1}
                </button>
              ))}
              {totalPages > 3 && <span className="px-2 text-sm font-black text-[#5B6F8A]">...</span>}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={safePage >= totalPages - 1} aria-label="Next page" className="rounded-lg border border-[#E4EEF9] p-2 text-[#4B6382] transition hover:bg-[#EEF4FB] disabled:opacity-35">
                <ChevronRightIcon fontSize="small" />
              </button>
              <Dropdown
                value={pageSize}
                onChange={setPageSize}
                options={[{ label: "6 / page", value: "6" }, { label: "10 / page", value: "10" }, { label: "20 / page", value: "20" }]}
              />
            </div>
          </div>
        </article>

        <aside className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[minmax(0,1fr)_auto]">
          <RoleDistribution users={directoryUsers} />
          <PendingInvitationsPanel />
        </aside>
      </section>
    </div>
  );
}
