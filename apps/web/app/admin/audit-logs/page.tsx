import { adminAuditLogs } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage, formatAdminDate } from "../admin-resource-page";

export default function AdminAuditLogsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/audit-logs"
      title="Audit Logs"
      subtitle="Review sensitive admin, document, verification, and permission events."
      cards={[
        { label: "Events", value: adminAuditLogs.length, detail: "Recorded audit entries." },
        { label: "Warnings", value: adminAuditLogs.filter((row) => row.severity === "warning").length, detail: "Events requiring review." },
        { label: "Critical", value: adminAuditLogs.filter((row) => row.severity === "critical").length, detail: "Immediate review." },
      ]}
      columns={[
        { key: "actor", label: "Actor", render: (row) => row.actor },
        { key: "action", label: "Action", render: (row) => row.action },
        { key: "target", label: "Target", render: (row) => row.target },
        { key: "severity", label: "Severity", render: (row) => <AdminBadge>{row.severity}</AdminBadge> },
        { key: "date", label: "Date", render: (row) => formatAdminDate(row.created_at) },
      ]}
      rows={adminAuditLogs}
    />
  );
}
