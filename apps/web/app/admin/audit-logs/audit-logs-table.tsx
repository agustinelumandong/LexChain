"use client";

import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Dropdown } from "../components/dropdown";
import { Table } from "../components/table";

type AuditLog = {
  actor: string;
  action: string;
  target: string;
  severity: string;
  created_at: string;
};

function getSeverityBadgeClass(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-50 text-red-700";
    case "warning":
      return "bg-yellow-50 text-yellow-700";
    case "info":
      return "bg-[#EEF4FB] text-[#0985E7]";
    default:
      return "bg-[#f1f5f9] text-[#64748b]";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const severities = [...new Set(logs.map((log) => log.severity))];

  const filtered = logs
    .filter((log) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        log.actor.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.target.toLowerCase().includes(searchTerm);
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "latest" ? diff : -diff;
    });

  return (
    <article className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E4EEF9] px-6 py-4">
        <h2 className="text-lg font-black text-[#0C2B49]">All Audit Logs</h2>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-3 py-2">
            <SearchIcon fontSize="small" className="text-[#64748b]" />
            <input
              type="text"
              placeholder="Search actor, action, target..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56 bg-transparent text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#94a3b8]"
            />
          </div>
          <Dropdown
            icon={<FilterListIcon fontSize="small" className="text-[#64748b]" />}
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { label: "All Severity", value: "all" },
              ...severities.map((severity) => ({
                label: severity.charAt(0).toUpperCase() + severity.slice(1),
                value: severity,
              })),
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
      <Table
        columns={[
          { key: "actor", label: "Actor", render: (log) => <span className="font-semibold text-[#0C2B49]">{log.actor}</span> },
          { key: "action", label: "Action", render: (log) => <span className="text-[#0C2B49]">{log.action}</span> },
          { key: "target", label: "Target", render: (log) => <span className="text-[#64748b]">{log.target}</span> },
          { key: "severity", label: "Severity", render: (log) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getSeverityBadgeClass(log.severity)}`}>{log.severity}</span> },
          { key: "date", label: "Date", render: (log) => <span className="text-[#64748b] tabular-nums">{formatDate(log.created_at)}</span> },
        ]}
        data={filtered}
        keyExtractor={(log) => `${log.actor}-${log.action}-${log.target}-${log.created_at}`}
        emptyMessage="No audit logs found."
      />
    </article>
  );
}
