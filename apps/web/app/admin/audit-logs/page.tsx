import { adminAuditLogs } from "../admin-demo-data";
import { AdminShell } from "../admin-shell";
import { PageHeader } from "../components/page-header";
import { StatCard, StatCardData } from "../components/stat-card";
import { AuditLogsTable } from "./audit-logs-table";
import HistoryIcon from "@mui/icons-material/History";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";

export default function AdminAuditLogsPage() {
  const stats: StatCardData[] = [
    { label: "Events", value: adminAuditLogs.length, detail: "Recorded audit entries", icon: <HistoryIcon fontSize="small" />, color: "blue" },
    { label: "Warnings", value: adminAuditLogs.filter((row) => row.severity === "warning").length, detail: "Events requiring review", icon: <WarningAmberIcon fontSize="small" />, color: "yellow" },
    { label: "Critical", value: adminAuditLogs.filter((row) => row.severity === "critical").length, detail: "Immediate review", icon: <ErrorIcon fontSize="small" />, color: "red" },
  ];

  return (
    <AdminShell activeHref="/admin/audit-logs">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader
          title="Audit Logs"
          description="Review sensitive admin, document, verification, and permission events."
        />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((card) => <StatCard key={card.label} {...card} />)}
        </section>

        <AuditLogsTable logs={adminAuditLogs} />
      </div>
    </AdminShell>
  );
}
