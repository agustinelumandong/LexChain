"use client";

import { useState, useRef, useEffect } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Dropdown } from "@/features/admin/components/dropdown";
import { Badge, Card, DataTable, SearchInput } from "@/shared/components/ui";

type AdminUser = {
  id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  role: string;
  is_active?: boolean;
  created_at: string;
};

function formatRole(role: string) {
  switch (role) {
    case "admin": return "Admin";
    case "lawyer": return "Lawyer";
    case "user": return "User";
    default: return role;
  }
}

function getUserStatus(user: AdminUser) {
  return user.is_active !== false;
}

function ActionsMenu({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`User actions for ${userId}`}
        className="cursor-pointer rounded-lg p-1.5 text-[#64748b] transition hover:bg-[#EEF4FB] hover:text-[#0C2B49]"
      >
        <MoreHorizIcon fontSize="small" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-[#E4EEF9] bg-white shadow-lg">
          {["View", "Edit", "Deactivate"].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full cursor-pointer px-4 py-2.5 text-left text-sm font-semibold text-[#0C2B49] transition hover:bg-[#EEF4FB]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const roles = [...new Set(users.map((u) => formatRole(u.role)))];

  const filtered = users
    .filter((user) => {
      const name = `${user.f_name ?? ""} ${user.l_name ?? ""}`.trim().toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || formatRole(user.role) === roleFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? getUserStatus(user) : !getUserStatus(user));
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "latest" ? diff : -diff;
    });

  return (
    <Card padded={false} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E4EEF9] px-6 py-4">
        <h2 className="text-lg font-black text-[#0C2B49]">All Users</h2>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <SearchInput
            aria-label="Search users"
            placeholder="Search name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-48"
          />
          <Dropdown
            icon={<FilterListIcon fontSize="small" className="text-[#64748b]" />}
            value={roleFilter}
            onChange={setRoleFilter}
            options={[{ label: "All Roles", value: "all" }, ...roles.map((r) => ({ label: r, value: r }))]}
          />
          <Dropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
          <Dropdown
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { label: "Latest", value: "latest" },
              { label: "Oldest", value: "oldest" },
            ]}
          />
        </div>
      </div>
      <DataTable
        ariaLabel="Users"
        columns={[
          { key: "name", label: "Name", render: (user) => <span className="font-semibold text-[#0C2B49]">{`${user.f_name ?? ""} ${user.l_name ?? ""}`.trim() || user.email}</span> },
          { key: "email", label: "Email", render: (user) => <span className="text-[#64748b]">{user.email}</span> },
          { key: "role", label: "Role", render: (user) => <Badge>{formatRole(user.role)}</Badge> },
          { key: "status", label: "Status", render: (user) => <Badge variant={getUserStatus(user) ? "success" : "danger"}>{getUserStatus(user) ? "Active" : "Inactive"}</Badge> },
          { key: "joined", label: "Joined", render: (user) => <span className="text-[#64748b] tabular-nums">{new Date(user.created_at).toLocaleDateString()}</span> },
          { key: "actions", label: "", render: (user) => <ActionsMenu userId={user.id} /> },
        ]}
        data={filtered}
        keyExtractor={(user) => user.id}
        emptyMessage="No users found."
      />
    </Card>
  );
}
