import { adminGeneratedReports } from "../admin-demo-data";
import { AdminShell } from "../admin-shell";
import { GeneratedReportsManagementView } from "./generated-reports-management-view";

export default function AdminGeneratedReportsPage() {
  return (
    <AdminShell activeHref="/admin/generated-reports">
      <GeneratedReportsManagementView reports={adminGeneratedReports} />
    </AdminShell>
  );
}
