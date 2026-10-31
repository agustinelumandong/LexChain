"use client";

import { useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Dropdown } from "@/features/admin/components/dropdown";
import { Badge, Card, DataTable, SearchInput } from "@/shared/components/ui";

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export function InvitationsTable({ invitations }: { invitations: Invitation[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const filtered = invitations
    .filter((inv) => {
      const matchesSearch = inv.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "latest" ? diff : -diff;
    });

  return (
    <Card padded={false} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E4EEF9] px-6 py-4">
        <h2 className="text-lg font-black text-[#0C2B49]">All Invitations</h2>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <SearchInput
            aria-label="Search invitations"
            placeholder="Search email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-48"
          />
          <Dropdown
            icon={<FilterListIcon fontSize="small" className="text-[#5B6F8A]" />}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Revoked", value: "revoked" },
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
        ariaLabel="Invitations"
        columns={[
          { key: "email", label: "Email", render: (inv) => <span className="font-semibold text-[#0C2B49]">{inv.email}</span> },
          { key: "role", label: "Role", render: (inv) => <Badge>{inv.role}</Badge> },
          { key: "status", label: "Status", render: (inv) => <Badge variant={inv.status === "accepted" ? "success" : inv.status === "pending" ? "warning" : "danger"}>{inv.status}</Badge> },
          { key: "created", label: "Created", render: (inv) => <span className="text-[#5B6F8A]">{new Date(inv.created_at).toLocaleDateString()}</span> },
          { key: "expires", label: "Expires", render: (inv) => <span className="text-[#5B6F8A]">{new Date(inv.expires_at).toLocaleDateString()}</span> },
        ]}
        data={filtered}
        keyExtractor={(inv) => inv.id}
        emptyMessage="No invitations found."
      />
    </Card>
  );
}
