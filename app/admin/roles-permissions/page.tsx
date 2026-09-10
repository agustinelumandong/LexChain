import { AdminShell } from "../admin-shell";
import { RolesPermissionsView } from "./roles-permissions-view";

export default function AdminRolesPermissionsPage() {
  return (
    <AdminShell activeHref="/admin/roles-permissions">
      <RolesPermissionsView />
    </AdminShell>
  );
}
