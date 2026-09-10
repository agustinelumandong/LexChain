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
import PersonOffIcon from "@mui/icons-material/PersonOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Dropdown } from "@/features/admin/components/dropdown";
import { Field, MockModal, exportMockRows, inputClassName, useMockToast } from "@/features/admin/components/mock-ui";
import { getPortalRoleLabel } from "@/features/access/portal-role";

type AdminUser = {
  id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  role: string;
  is_active?: boolean;
  created_at: string;
};

type DemoAdminUserChanges = Partial<
  Pick<AdminUser, "f_name" | "l_name" | "email" | "role" | "is_active">
>;

export function updateDemoUser(
  users: AdminUser[],
  userId: string,
  changes: DemoAdminUserChanges,
): AdminUser[] {
  return users.map((user) => user.id === userId ? { ...user, ...changes } : user);
}

type DirectoryUser = AdminUser & {
  displayName: string;
  initials: string;
  roleLabel: string;
  statusLabel: "Active" | "Suspended";
};

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getName(user: AdminUser) {
  return `${user.f_name ?? ""} ${user.l_name ?? ""}`.trim() || user.email.split("@")[0];
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

function deriveRole(user: AdminUser) {
  return getPortalRoleLabel(user.role);
}

function getStatus(user: AdminUser): DirectoryUser["statusLabel"] {
  return user.is_active === false ? "Suspended" : "Active";
}

function enrichUser(user: AdminUser): DirectoryUser {
  const displayName = getName(user);
  return {
    ...user,
    roleLabel: deriveRole(user),
    displayName,
    initials: getInitials(displayName),
    statusLabel: getStatus(user),
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
        status === "Suspended" && "bg-[#FEECEC] text-[#DC2626]",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ActionsMenu({ user, onView, onEdit, onChangeStatus }: { user: DirectoryUser; onView: () => void; onEdit: () => void; onChangeStatus: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isCurrentAccount = user.email === "admin@lexchain.local";

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-end gap-1">
      <button type="button" onClick={onView} aria-label={`View ${user.displayName}`} className="rounded-lg p-1.5 text-[#7C8DA5] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
        <VisibilityIcon fontSize="small" />
      </button>
      <button type="button" onClick={onEdit} aria-label={`Edit ${user.displayName}`} className="rounded-lg p-1.5 text-[#7C8DA5] transition hover:bg-[#EEF4FB] hover:text-[#0985E7]">
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
          {["Reset password", "Change role"].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#0C2B49] transition hover:bg-[#EEF4FB]"
            >
              {action}
            </button>
          ))}
          <button
            type="button"
            disabled={isCurrentAccount && user.statusLabel === "Active"}
            aria-label={isCurrentAccount && user.statusLabel === "Active" ? "Current account cannot be suspended" : undefined}
            onClick={() => { setOpen(false); onChangeStatus(); }}
            className={cn(
              "block w-full px-4 py-2.5 text-left text-sm font-bold transition",
              isCurrentAccount && user.statusLabel === "Active"
                ? "cursor-not-allowed text-[#94A3B8]"
                : user.statusLabel === "Active"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-700 hover:bg-green-50",
            )}
          >
            {isCurrentAccount && user.statusLabel === "Active"
              ? "Current account cannot be suspended"
              : user.statusLabel === "Active" ? "Suspend user" : "Reactivate user"}
          </button>
        </div>
      )}
    </div>
  );
}

function RoleDistribution({ users }: { users: DirectoryUser[] }) {
  const colors = ["#0879D8", "#59C878", "#9B6AF3", "#F6B52E", "#22C7D8"];
  const groups = [...new Set(users.map((user) => user.roleLabel))].map((label, index) => ({
    label,
    color: colors[index % colors.length],
  }));
  const total = Math.max(1, users.length);
  let cursor = 0;
  const gradient = groups
    .map((group) => {
      const count = users.filter((user) => user.roleLabel === group.label).length;
      const start = cursor;
      cursor += (count / total) * 100;
      return `${group.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <h2 className="mb-4 text-lg font-black text-[#071B33]">Role Distribution</h2>
      <div className="grid flex-1 items-center gap-5 sm:grid-cols-[160px_1fr] xl:grid-cols-1 2xl:grid-cols-[160px_1fr]">
        <div className="relative mx-auto size-36 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <strong className="text-2xl font-black text-[#071B33]">{total}</strong>
            <span className="text-xs font-semibold text-[#6B7E95]">Total Users</span>
          </div>
        </div>
        <div className="space-y-3">
          {groups.map((group) => {
            const count = users.filter((user) => user.roleLabel === group.label).length;
            return (
              <div key={group.label} className="flex items-center gap-3 text-sm">
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

function RecentlyCreatedAccounts({ users }: { users: DirectoryUser[] }) {
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <article className="flex min-h-[260px] flex-col rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-sm shadow-[#DDEAF7]/35">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-black text-[#071B33]">Recently Created Accounts</h2>
        <span className="text-xs font-black text-[#5B6F8A]">{recentUsers.length} latest</span>
      </div>
      <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {recentUsers.map((user, index) => (
          <div key={user.id} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#F8FBFF]">
            <div className={cn("flex size-10 items-center justify-center rounded-xl text-xs font-black", index % 3 === 0 ? "bg-[#EAF3FF] text-[#0879D8]" : index % 3 === 1 ? "bg-[#F4ECFF] text-[#7C3AED]" : "bg-[#FFF4DF] text-[#D97706]")}>
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#071B33]">{user.displayName}</p>
              <p className="truncate text-xs font-semibold text-[#5B6F8A]">{user.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#EEF4FB] px-2 py-0.5 text-[10px] font-black text-[#0879D8]">{user.roleLabel}</span>
                <StatusPill status={user.statusLabel} />
              </div>
            </div>
            <p className="text-right text-xs font-bold text-[#4B6382]">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {recentUsers.length === 0 ? (
          <p className="text-sm font-semibold text-[#5B6F8A]">No accounts returned by the API.</p>
        ) : null}
      </div>
    </article>
  );
}

export function UsersManagementView({ users, total }: { users: AdminUser[]; total: number }) {
  const { showToast } = useMockToast();
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState("6");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "suspend" | null>(null);
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const [userDraft, setUserDraft] = useState<AdminUser | null>(null);
  const [userRows, setUserRows] = useState(users);

  const directoryUsers = useMemo(() => userRows.map(enrichUser), [userRows]);
  const roleOptions = useMemo(() => [...new Set(directoryUsers.map((user) => user.roleLabel))], [directoryUsers]);

  const filtered = useMemo(() => {
    const query = `${headerSearch} ${tableSearch}`.trim().toLowerCase();
    return directoryUsers.filter((user) => {
      const matchesSearch = !query || user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.roleLabel === roleFilter;
      const matchesStatus = statusFilter === "all" || user.statusLabel === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [directoryUsers, headerSearch, roleFilter, statusFilter, tableSearch]);

  const perPage = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleUsers = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  const metrics = [
    { label: "Total Users", value: total || directoryUsers.length, detail: "Registered accounts", icon: <GroupsIcon fontSize="small" />, tone: "blue" as const },
    { label: "Active Users", value: directoryUsers.filter((user) => user.statusLabel === "Active").length, detail: "is_active true", icon: <CheckCircleIcon fontSize="small" />, tone: "green" as const },
    { label: "Suspended Users", value: directoryUsers.filter((user) => user.statusLabel === "Suspended").length, detail: "is_active false", icon: <PersonOffIcon fontSize="small" />, tone: "red" as const },
    { label: "Lawyers", value: directoryUsers.filter((user) => user.roleLabel === "Document Issuer").length, detail: "role field", icon: <WorkIcon fontSize="small" />, tone: "blue" as const },
  ];

  return (
    <div className="flex min-h-[calc(100vh-48px)] w-full flex-col gap-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0879D8]">LexChain Operations</p>
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
          <button type="button" onClick={() => { setMoreFiltersOpen((value) => !value); showToast({ title: "Filters toggled", detail: "Use the table filters below to refine users.", tone: "info" }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <FilterListIcon fontSize="small" />
            Filter
          </button>
          <button type="button" onClick={() => { exportMockRows("lexchain-users", filtered, "csv"); showToast({ title: "Users exported", detail: `${filtered.length} users downloaded.` }); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-white px-4 py-3 text-sm font-black text-[#0C2B49] shadow-sm shadow-[#DDEAF7]/35 transition hover:border-[#0985E7]">
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <Link href="/portal/issuer-invitations" className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#0985E7]/25 transition hover:bg-[#0770C4]">
            <PersonAddIcon fontSize="small" />
            Invite User
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                options={[{ label: "All Statuses", value: "all" }, { label: "Active", value: "Active" }, { label: "Suspended", value: "Suspended" }]}
              />
              <button type="button" onClick={() => setMoreFiltersOpen((value) => !value)} className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition", moreFiltersOpen ? "border-[#0985E7] bg-[#EAF3FF] text-[#0879D8]" : "border-[#E4EEF9] bg-white text-[#0C2B49] hover:border-[#0985E7]")}>
                <FilterListIcon fontSize="small" />
                More Filters
              </button>
            </div>
          </div>

          <div className="admin-table-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-[#D9E5F0] bg-[#F8FBFF] text-left text-xs font-black uppercase tracking-[0.08em] text-[#4B6382]">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
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
                          <p className="truncate text-xs font-semibold text-[#5B6F8A]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{user.roleLabel}</td>
                    <td className="px-5 py-3"><StatusPill status={user.statusLabel} /></td>
                    <td className="px-5 py-3 font-semibold text-[#0C2B49]">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <ActionsMenu
                        user={user}
                        onView={() => { setSelectedUser(user); setUserDraft(null); setModalMode("view"); }}
                        onEdit={() => { setSelectedUser(user); setUserDraft(user); setModalMode("edit"); }}
                        onChangeStatus={() => { setSelectedUser(user); setUserDraft(user); setModalMode("suspend"); }}
                      />
                    </td>
                  </tr>
                ))}
                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm font-semibold text-[#5B6F8A]">No users match the current filters.</td>
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
          <RecentlyCreatedAccounts users={directoryUsers} />
        </aside>
      </section>
      <MockModal
        open={modalMode === "view"}
        onClose={() => setModalMode(null)}
        title={selectedUser?.displayName ?? "User details"}
        description="User profile details from the System Management directory."
        footer={<button type="button" onClick={() => setModalMode(null)} className="w-full rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white">Done</button>}
      >
        {selectedUser ? (
          <div className="space-y-3 text-sm font-semibold text-[#4B6382]">
            <p><strong className="text-[#071B33]">Email:</strong> {selectedUser.email}</p>
            <p><strong className="text-[#071B33]">Role:</strong> {selectedUser.roleLabel}</p>
            <p><strong className="text-[#071B33]">Status:</strong> {selectedUser.statusLabel}</p>
            <p><strong className="text-[#071B33]">Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
          </div>
        ) : null}
      </MockModal>
      <MockModal
        open={modalMode === "edit"}
        onClose={() => setModalMode(null)}
        title="Edit User"
        description="Update this account for the current demo session."
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalMode(null)} className="flex-1 rounded-xl border border-[#E4EEF9] px-5 py-3 text-sm font-black text-[#0C2B49]">Cancel</button>
            <button type="button" onClick={() => {
              if (!userDraft || !selectedUser) return;
              setUserRows((currentUsers) => updateDemoUser(currentUsers, selectedUser.id, {
                f_name: userDraft.f_name,
                l_name: userDraft.l_name,
                email: userDraft.email,
                role: userDraft.role,
              }));
              showToast({ title: "Demo account updated", detail: "Demo mode — changes reset when this page is refreshed." });
              setModalMode(null);
            }} className="flex-1 rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white">Save</button>
          </div>
        }
      >
        {userDraft ? (
          <div className="grid gap-4">
            <Field label="First name"><input className={inputClassName} value={userDraft.f_name ?? ""} onChange={(event) => setUserDraft((draft) => draft ? { ...draft, f_name: event.target.value } : draft)} /></Field>
            <Field label="Last name"><input className={inputClassName} value={userDraft.l_name ?? ""} onChange={(event) => setUserDraft((draft) => draft ? { ...draft, l_name: event.target.value } : draft)} /></Field>
            <Field label="Email"><input className={inputClassName} value={userDraft.email} onChange={(event) => setUserDraft((draft) => draft ? { ...draft, email: event.target.value } : draft)} /></Field>
            <Field label="Role"><select className={inputClassName} value={userDraft.role} onChange={(event) => setUserDraft((draft) => draft ? { ...draft, role: event.target.value } : draft)}><option value="lawyer">Lawyer</option><option value="user">User</option></select></Field>
            <p className="text-xs font-semibold text-[#5B6F8A]">Demo mode — changes reset when this page is refreshed.</p>
          </div>
        ) : null}
      </MockModal>
      <MockModal
        open={modalMode === "suspend"}
        onClose={() => setModalMode(null)}
        title={`${selectedUser?.statusLabel === "Active" ? "Suspend" : "Reactivate"} ${selectedUser?.displayName ?? "user"}?`}
        description="Update this account status for the current demo session."
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalMode(null)} className="flex-1 rounded-xl border border-[#E4EEF9] px-5 py-3 text-sm font-black text-[#0C2B49]">Cancel</button>
            <button type="button" onClick={() => {
              if (!selectedUser) return;
              setUserRows((currentUsers) => updateDemoUser(currentUsers, selectedUser.id, {
                is_active: selectedUser.statusLabel !== "Active",
              }));
              showToast({ title: "Demo account updated", detail: "Demo mode — changes reset when this page is refreshed." });
              setModalMode(null);
            }} className={cn(
              "flex-1 rounded-xl px-5 py-3 text-sm font-black text-white",
              selectedUser?.statusLabel === "Active" ? "bg-red-600" : "bg-green-700",
            )}>{selectedUser?.statusLabel === "Active" ? "Suspend" : "Reactivate"}</button>
          </div>
        }
      >
        <div className="space-y-3 text-sm font-semibold text-[#5B6F8A]">
          <p>{selectedUser?.statusLabel === "Active" ? "This account will be marked as suspended." : "This account will be marked as active."}</p>
          <p className="text-xs">Demo mode — changes reset when this page is refreshed.</p>
        </div>
      </MockModal>
    </div>
  );
}
