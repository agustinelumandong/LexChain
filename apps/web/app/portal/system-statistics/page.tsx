import { adminStats } from "../../admin/admin-demo-data";
import { adminFetch } from "../../admin/components/admin-fetch";
import type { DashboardResponse } from "@/lib/schemas/admin";
import { SystemStatisticsView } from "./system-statistics-view";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

async function getDashboard(): Promise<DashboardResponse> {
  if (useMock) {
    return {
      total_users: adminStats.total_users,
      total_lawyers: adminStats.total_lawyers,
      total_documents: adminStats.total_documents,
      total_processed: adminStats.processed_documents,
      total_failed: adminStats.failed_documents,
      total_on_chain: adminStats.total_on_chain,
      pending_invitations: adminStats.pending_invitations,
    };
  }

  return adminFetch<DashboardResponse>("/admin/dashboard");
}

export default async function PortalSystemStatisticsPage() {
  return <SystemStatisticsView dashboard={await getDashboard()} />;
}
