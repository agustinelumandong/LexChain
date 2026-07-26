import { adminFetch } from "../../admin/components/admin-fetch";
import { UsersManagementView } from "../../admin/users/users-management-view";

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
    const { adminUsers } = await import("../../admin/admin-demo-data");
    return {
      users: adminUsers.map((user) => ({
        id: user.id,
        f_name: user.name.split(" ")[0] ?? "",
        l_name: user.name.split(" ").slice(1).join(" "),
        email: user.email,
        role: user.role,
        is_active: user.status === "active",
        created_at: user.created_at,
      })),
      total: adminUsers.length,
    };
  }

  return adminFetch<UsersData>("/admin/users");
}

export default async function PortalUsersPage() {
  const data = await getUsers();

  return <UsersManagementView users={data.users} total={data.total} />;
}
