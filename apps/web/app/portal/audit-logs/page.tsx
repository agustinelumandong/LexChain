import { adminFetch } from "../../admin/components/admin-fetch";
import { AuditLogsManagementView } from "../../admin/audit-logs/audit-logs-management-view";

const useMock = process.env.USE_MOCK_API === "true";

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
    const { adminAuditLogs } = await import("../../admin/admin-demo-data");
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

export default async function PortalAuditLogsPage() {
  const data = await getAuditLogs();

  return <AuditLogsManagementView logs={data.logs} total={data.total} />;
}
