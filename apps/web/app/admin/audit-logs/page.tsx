import { AdminShell } from "../admin-shell";
import { adminFetch } from "../components/admin-fetch";
import { AuditLogsManagementView } from "./audit-logs-management-view";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

type SystemAuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type AuditLogsData = { logs: SystemAuditLog[]; total: number };

async function getAuditLogs(): Promise<AuditLogsData> {
  if (useMock) {
    const { adminAuditLogs } = await import("../admin-demo-data");
    return {
      logs: adminAuditLogs.map((log, index) => ({
        id: `demo-${index}`,
        user_id: null,
        action: log.action,
        target_type: null,
        target_id: log.target,
        details: null,
        ip_address: null,
        user_agent: null,
        created_at: log.created_at,
      })),
      total: adminAuditLogs.length,
    };
  }

  return adminFetch<AuditLogsData>("/admin/audit-logs");
}

export default async function AdminAuditLogsPage() {
  const data = await getAuditLogs();

  return (
    <AdminShell activeHref="/admin/audit-logs">
      <AuditLogsManagementView logs={data.logs} total={data.total} />
    </AdminShell>
  );
}
