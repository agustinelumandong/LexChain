import { AdminShell } from "../admin-shell";
import { adminFetch } from "../components/admin-fetch";
import { UsersManagementView } from "./users-management-view";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

type AdminUser = {
  id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  role: string;
  is_active?: boolean;
  created_at: string;
};

type UsersData = { users: AdminUser[]; total: number };

async function getUsers(): Promise<UsersData> {
  if (useMock) {
    const { adminUsers } = await import("../admin-demo-data");
    return {
      users: adminUsers.map((u) => ({
        id: u.id,
        f_name: u.name.split(" ")[0] ?? "",
        l_name: u.name.split(" ").slice(1).join(" "),
        email: u.email,
        role: u.role,
        is_active: u.status === "active",
        created_at: u.created_at,
      })),
      total: adminUsers.length,
    };
  }
  return adminFetch<UsersData>("/admin/users");
}

export default async function AdminUsersPage() {
  const data = await getUsers();

  return (
    <AdminShell activeHref="/admin/users">
      <UsersManagementView users={data.users} total={data.total} />
    </AdminShell>
  );
}
