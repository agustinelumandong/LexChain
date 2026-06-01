import { AdminShell } from "../admin-shell";
import { GeneratedReportsManagementView } from "./generated-reports-management-view";

export default async function AdminGeneratedReportsPage() {
  const { adminGeneratedReports } = await import("../admin-demo-data");

  return (
    <AdminShell activeHref="/admin/generated-reports">
      <GeneratedReportsManagementView reports={adminGeneratedReports} />
    </AdminShell>
  );
}
