import { AdminShell } from "../admin-shell";
import { GeneratedReportsManagementView } from "./generated-reports-management-view";

export default async function AdminGeneratedReportsPage() {
  return (
    <AdminShell activeHref="/admin/generated-reports">
      <GeneratedReportsManagementView />
    </AdminShell>
  );
}
