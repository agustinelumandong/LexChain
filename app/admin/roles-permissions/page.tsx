import { AdminShell } from "@/features/admin/admin-shell";
import { RolesPermissionsView } from "@/features/admin/roles-permissions/roles-permissions-view";

export default function AdminRolesPermissionsPage() {
  return (
    <AdminShell activeHref="/admin/roles-permissions">
      <RolesPermissionsView />
    </AdminShell>
  );
}
