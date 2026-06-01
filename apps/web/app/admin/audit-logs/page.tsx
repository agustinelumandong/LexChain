import { adminAuditLogs } from "../admin-demo-data";
import { AdminShell } from "../admin-shell";
import { AuditLogsManagementView } from "./audit-logs-management-view";

export default function AdminAuditLogsPage() {
  return (
    <AdminShell activeHref="/admin/audit-logs">
      <AuditLogsManagementView logs={adminAuditLogs} />
    </AdminShell>
  );
}
