import { MockResourcePage } from "../mock-resource-page";

export default async function AdminVerificationLogsPage() {
  const { adminVerificationLogs } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="verification-logs" rows={adminVerificationLogs} />
  );
}
