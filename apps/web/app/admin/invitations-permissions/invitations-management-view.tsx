"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import GppBadIcon from "@mui/icons-material/GppBad";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Dropdown } from "../components/dropdown";
import { MockModal, exportMockRows, useMockToast } from "../components/mock-ui";
import { CreateInvitationModal } from "./create-invitation-modal";

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  magic_link?: string | null;
  organization?: string;
  permission_type?: string;
  document_name?: string;
};

type DirectoryInvitation = Invitation & {
  invitee: string;
  initials: string;
  organizationName: string;
  roleLabel: string;
  permissionLabel: string;
  statusLabel: "Pending" | "Accepted" | "Expired" | "Revoked";
  sentLabel: string;
  expiresLabel: string;
};

const activity = [
  { label: "Invitation sent — Andrea Dizon", time: "12m ago", icon: <EmailIcon fontSize="small" />, color: "text-[#0879D8]" },
  { label: "Invitation accepted — Sofia Tan", time: "25m ago", icon: <CheckCircleIcon fontSize="small" />, color: "text-[#16A34A]" },
  { label: "Permission updated — Mark Villanueva", time: "1h ago", icon: <EditIcon fontSize="small" />, color: "text-[#0879D8]" },
  { label: "Invite expired — Joanna Lim", time: "3h ago", icon: <HourglassTopIcon fontSize="small" />, color: "text-[#F97316]" },
  { label: "Access revoked — Daniel Flores", time: "5h ago", icon: <GppBadIcon fontSize="small" />, color: "text-[#EF4444]" },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getNameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function toTitle(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatus(status: string): DirectoryInvitation["statusLabel"] {
  const raw = status.toLowerCase();
  if (raw === "accepted") return "Accepted";
  if (raw === "expired") return "Expired";
  if (raw === "revoked") return "Revoked";
  return "Pending";
}

function formatRelativeDate(value: string, fallbackIndex: number) {
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

function formatExpires(invitation: Invitation, index: number) {
  const status = getStatus(invitation.status);
  if (status === "Accepted" || status === "Revoked") return "—";
  if (status === "Expired") return "expired";
  const timestamp = new Date(invitation.expires_at).getTime();
  if (Number.isNaN(timestamp)) return `in ${index + 3} days`;
  const days = Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
  return days > 0 ? `in ${days} days` : "expired";
}

function enrichInvitation(invitation: Invitation, index: number): DirectoryInvitation {
  const invitee = getNameFromEmail(invitation.email);
  return {
    ...invitation,
    invitee,
    initials: getInitials(invitee),
    organizationName: invitation.organization ?? ["Dizon & Cruz Law Office", "Panabo Legal Services", "NorthMind Contracts Office", "BrightPath Consultancy"][index % 4],
    roleLabel: invitation.role === "document_issuer" ? "Document Issuer" : toTitle(invitation.role),
    permissionLabel: invitation.permission_type ? toTitle(invitation.permission_type).replace("View Download", "Full Access").replace("View Only", "Standard Issuer").replace("Verify Only", "Verification Only") : ["Standard Issuer", "Full Access", "Restricted Upload", "Verification Only"][index % 4],
    statusLabel: getStatus(invitation.status),
    sentLabel: formatRelativeDate(invitation.created_at, index),
    expiresLabel: formatExpires(invitation, index),
  };
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: "blue" | "yellow" | "green" | "orange" | "red" | "purple" }) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#0879D8]",
    yellow: "bg-[#FFF7E6] text-[#F59E0B]",
    green: "bg-[#EAFBF1] text-[#16A34A]",
    orange: "bg-[#FFF1E8] text-[#F97316]",
    red: "bg-[#FEECEC] text-[#EF4444]",
    purple: "bg-[#F4ECFF] text-[#7C3AED]",
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

function StatusPill({ status }: { status: DirectoryInvitation["statusLabel"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-2.5 py-1 text-xs font-black",
        status === "Accepted" && "bg-[#EAFBF1] text-[#16A34A]",
        status === "Pending" && "bg-[#FFF4DF] text-[#D97706]",
        status === "Expired" && "bg-[#F1F5F9] text-[#64748B]",
        status === "Revoked" && "bg-[#FEECEC] text-[#DC2626]",
      )}
    >
      {status}
    </span>
  );
}

function ActionsMenu({ invite, onView, onResend, onEdit, onRevoke }: { invite: DirectoryInvitation; onView: () => void; onResend: () => void; onEdit: () => void; onRevoke: () => void }) {
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
      <button type="button" onClick={onView} aria-label={`View ${invite.email}`} className="rounded-lg border border-[#E4EEF9] p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <VisibilityIcon sx={{ fontSize: 17 }} />
      </button>
      <button type="button" onClick={onResend} aria-label={`Resend ${invite.email}`} className="rounded-lg border border-[#E4EEF9] p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <ReplayIcon sx={{ fontSize: 17 }} />
      </button>
      <button type="button" onClick={onEdit} aria-label={`Edit ${invite.email}`} className="rounded-lg border border-[#E4EEF9] p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <EditIcon sx={{ fontSize: 17 }} />
      </button>
      <button type="button" aria-label={`More actions for ${invite.email}`} onClick={() => setOpen((value) => !value)} className="rounded-lg border border-[#E4EEF9] p-1.5 text-[#4B6382] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <MoreVertIcon sx={{ fontSize: 17 }} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-xl shadow-[#183B6B]/10">
          <button type="button" onClick={() => { setOpen(false); onResend(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">Copy invite link</button>
          <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]">Change permissions</button>
          <button type="button" onClick={() => { setOpen(false); onRevoke(); }} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">Revoke access</button>
        </div>
      ) : null}
    </div>
  );
}

function StatusDistribution({ invitations }: { invitations: DirectoryInvitation[] }) {
  const groups = [
    { label: "Accepted", status: "Accepted", color: "#41B96B" },
    { label: "Pending", status: "Pending", color: "#F6B52E" },
    { label: "Expired", status: "Expired", color: "#F97316" },
    { label: "Revoked", status: "Revoked", color: "#EF4444" },
  ] as const;
  const total = Math.max(1, invitations.length);
  let cursor = 0;
  const gradient = groups.map((group) => {
    const count = invitations.filter((invite) => invite.statusLabel === group.status).length;
    const start = cursor;
    cursor += (count / total) * 100;
    return `${group.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <article className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Invitation Status</h2>
        <button type="button" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View all</button>
      </div>
      <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
        <div className="relative mx-auto size-34 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total Invites</span>
          </div>
        </div>
        <div className="space-y-3">
          {groups.map((group) => {
            const count = invitations.filter((invite) => invite.statusLabel === group.status).length;
            return (
              <div key={group.status} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="min-w-0 flex-1 font-semibold text-[#4B6382]">{group.label}</span>
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

function ActivityPanel() {
  return (
    <article className="flex min-h-[240px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Recent Invitation Activity</h2>
        <Link href="/admin/audit-logs" className="text-xs font-black text-[#0985E7] hover:text-[#0767B9]">View logs</Link>
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {activity.map((item) => (
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

export function InvitationsManagementView({ invitations }: { invitations: Invitation[] }) {
  const { showToast } = useMockToast();
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [permissionFilter, setPermissionFilter] = useState("all");
  const [pageSize, setPageSize] = useState("10");
  const [page, setPage] = useState(0);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<DirectoryInvitation | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "revoke" | null>(null);

  const directoryInvites = useMemo(() => invitations.map(enrichInvitation), [invitations]);
  const roleOptions = useMemo(() => [...new Set(directoryInvites.map((invite) => invite.roleLabel))], [directoryInvites]);
  const permissionOptions = useMemo(() => [...new Set(directoryInvites.map((invite) => invite.permissionLabel))], [directoryInvites]);

  const filtered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return directoryInvites.filter((invite) => {
      const matchesSearch = !query || invite.email.toLowerCase().includes(query) || invite.organizationName.toLowerCase().includes(query) || invite.invitee.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || invite.statusLabel === statusFilter;
      const matchesRole = roleFilter === "all" || invite.roleLabel === roleFilter;
      const matchesPermission = permissionFilter === "all" || invite.permissionLabel === permissionFilter;
      return matchesSearch && matchesStatus && matchesRole && matchesPermission;
    });
  }, [directoryInvites, headerSearch, permissionFilter, roleFilter, statusFilter, tableSearch]);

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleInvites = filtered.slice(safePage * perPage, (safePage + 1) * perPage);
  const pendingCount = directoryInvites.filter((invite) => invite.statusLabel === "Pending").length;

  const metrics = [
    { label: "Total Invites", value: directoryInvites.length, detail: "All invitation records", icon: <EmailIcon fontSize="small" />, tone: "blue" as const },
    { label: "Pending", value: pendingCount, detail: "Awaiting acceptance", icon: <AccessTimeIcon fontSize="small" />, tone: "yellow" as const },
    { label: "Accepted", value: directoryInvites.filter((invite) => invite.statusLabel === "Accepted").length, detail: "Activated accounts", icon: <CheckCircleIcon fontSize="small" />, tone: "green" as const },
    { label: "Expired", value: directoryInvites.filter((invite) => invite.statusLabel === "Expired").length, detail: "Resend required", icon: <HourglassTopIcon fontSize="small" />, tone: "orange" as const },
    { label: "Revoked", value: directoryInvites.filter((invite) => invite.statusLabel === "Revoked").length, detail: "Access withdrawn", icon: <GppBadIcon fontSize="small" />, tone: "red" as const },
    { label: "Document Issuers", value: Math.max(0, directoryInvites.length - pendingCount), detail: "Active issuer accounts", icon: <PermIdentityIcon fontSize="small" />, tone: "purple" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Super Admin</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#071B33]">Invitations & Permissions</h1>
          <p className="mt-1 text-sm font-semibold text-[#4B6382]">Manage document issuer invitations — create new invites, assign permissions, and revoke access.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[300px] items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 shadow-sm shadow-[#DDEAF7]/35 focus-within:border-[#0985E7]">
            <SearchIcon fontSize="small" className="text-[#4B6382]" />
            <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} placeholder="Search by email or organization..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
          </label>
          <button type="button" onClick={() => { setMoreFiltersOpen((value) => !value); showToast({ title: "Filters toggled", detail: "Use the invitation filters below.", tone: "info" }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
          <button type="button" onClick={() => { exportMockRows("lexchain-invitations", filtered, "csv"); showToast({ title: "Invitations exported", detail: `${filtered.length} invitations downloaded.` }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <CreateInvitationModal
            label="New Invitation"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0985E7]/25 transition hover:bg-[#0770C4]"
          />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white shadow-sm shadow-[#DDEAF7]/35 xl:min-h-0">
          <div className="border-b border-[#E4EEF9] p-5">
            <h2 className="text-lg font-black text-[#071B33]">Invitation Directory</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-2.5 focus-within:border-[#0985E7]">
                <SearchIcon fontSize="small" className="text-[#4B6382]" />
                <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search invitations..." className="w-full bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#9AAAC0]" />
              </label>
              <Dropdown value={roleFilter} onChange={setRoleFilter} options={[{ label: "Role", value: "all" }, ...roleOptions.map((role) => ({ label: role, value: role }))]} />
              <Dropdown value={statusFilter} onChange={setStatusFilter} options={[{ label: "Status", value: "all" }, { label: "Pending", value: "Pending" }, { label: "Accepted", value: "Accepted" }, { label: "Expired", value: "Expired" }, { label: "Revoked", value: "Revoked" }]} />
              <Dropdown value={permissionFilter} onChange={setPermissionFilter} options={[{ label: "Permission Set", value: "all" }, ...permissionOptions.map((permission) => ({ label: permission, value: permission }))]} />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("ml-auto inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <TuneIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                  <th className="px-5 py-3">Invitee</th>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Permission Set</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Sent</th>
                  <th className="px-5 py-3">Expires</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvites.map((invite, index) => (
                  <tr key={invite.id} className="h-[68px] border-b border-[#F1F5F9] transition hover:bg-[#F8FBFF]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-10 items-center justify-center rounded-full text-xs font-black", index % 4 === 0 ? "bg-[#EAF3FF] text-[#0879D8]" : index % 4 === 1 ? "bg-[#EAFBF1] text-[#16A34A]" : index % 4 === 2 ? "bg-[#F4ECFF] text-[#7C3AED]" : "bg-[#FFF1E8] text-[#F97316]")}>{invite.initials}</div>
                        <div className="min-w-0">
                          <p className="truncate font-black text-[#071B33]">{invite.invitee}</p>
                          <p className="truncate text-xs font-semibold text-[#5B6F8A]">{invite.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-[#0C2B49]">{invite.organizationName}</td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{invite.roleLabel}</td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{invite.permissionLabel}</td>
                    <td className="px-5 py-3"><StatusPill status={invite.statusLabel} /></td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{invite.sentLabel}</td>
                    <td className={cn("px-5 py-3 font-semibold", invite.expiresLabel === "expired" ? "text-[#EF4444]" : "text-[#0C2B49]")}>{invite.expiresLabel}</td>
                    <td className="px-5 py-3">
                      <ActionsMenu
                        invite={invite}
                        onView={() => { setSelectedInvite(invite); setModalMode("view"); }}
                        onResend={() => showToast({ title: "Invitation link copied", detail: invite.email })}
                        onEdit={() => showToast({ title: "Backend endpoint needed", detail: `Permission was not changed for ${invite.email}.`, tone: "info" })}
                        onRevoke={() => { setSelectedInvite(invite); setModalMode("revoke"); }}
                      />
                    </td>
                  </tr>
                ))}
                {visibleInvites.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No invitations match the current filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E4EEF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#5B6F8A]">
              Showing {filtered.length === 0 ? 0 : safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length} invitations
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">‹</button>
              {[...Array(Math.min(3, totalPages))].map((_, index) => (
                <button key={index} type="button" onClick={() => setPage(index)} className={cn("size-9 rounded-lg border text-sm font-black transition", safePage === index ? "border-[#0985E7] bg-[#0985E7] text-white" : "border-[#E4EEF9] text-[#0C2B49] hover:bg-[#EEF4FB]")}>{index + 1}</button>
              ))}
              {totalPages > 3 && <span className="px-2 text-sm font-black text-[#5B6F8A]">...</span>}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={safePage >= totalPages - 1} className="rounded-lg border border-[#E4EEF9] px-3 py-2 text-sm font-black text-[#0C2B49] transition hover:bg-[#EEF4FB] disabled:opacity-35">›</button>
              <Dropdown value={pageSize} onChange={setPageSize} options={[{ label: "10 / page", value: "10" }, { label: "20 / page", value: "20" }]} />
            </div>
          </div>
        </article>

        <aside className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <StatusDistribution invitations={directoryInvites} />
          <ActivityPanel />
        </aside>
      </section>
      <MockModal open={modalMode === "view"} onClose={() => setModalMode(null)} title={selectedInvite?.invitee ?? "Invitation details"} description="Invitation details from the backend response." footer={<button type="button" onClick={() => setModalMode(null)} className="w-full rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white">Done</button>}>
        {selectedInvite ? <div className="space-y-3 text-sm font-semibold text-[#4B6382]"><p><strong className="text-[#071B33]">Email:</strong> {selectedInvite.email}</p><p><strong className="text-[#071B33]">Organization:</strong> {selectedInvite.organizationName}</p><p><strong className="text-[#071B33]">Permission:</strong> {selectedInvite.permissionLabel}</p><p><strong className="text-[#071B33]">Status:</strong> {selectedInvite.statusLabel}</p></div> : null}
      </MockModal>
      <MockModal open={modalMode === "revoke"} onClose={() => setModalMode(null)} title={`Revoke ${selectedInvite?.email ?? "invitation"}?`} description="This sends a revoke request to the invitations backend." footer={<div className="flex gap-3"><button type="button" onClick={() => setModalMode(null)} className="flex-1 rounded-xl border border-[#E4EEF9] px-5 py-3 text-sm font-black text-[#0C2B49]">Cancel</button><button type="button" onClick={async () => { if (!selectedInvite) return; const response = await fetch(`/api/admin/invitations/${encodeURIComponent(selectedInvite.id)}`, { method: "DELETE" }); if (!response.ok) { showToast({ title: "Revoke failed", detail: selectedInvite.email, tone: "error" }); return; } showToast({ title: "Invitation revoked", detail: selectedInvite.email, tone: "warning" }); setModalMode(null); window.location.reload(); }} className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">Revoke</button></div>}>
        <p className="text-sm font-semibold text-[#5B6F8A]">After revoke succeeds, this page reloads from the backend response.</p>
      </MockModal>
    </div>
  );
}
