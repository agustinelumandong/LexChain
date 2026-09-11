import { MockResourcePage } from "@/features/admin/mock-resource-page";

export default async function AdminVerificationLogsPage() {
  const { adminVerificationLogs } = await import("@/features/admin/admin-demo-data");

  return (
    <MockResourcePage resource="verification-logs" rows={adminVerificationLogs} />
  );
}
