import { AdminShell } from "../admin-shell";
import { adminUsers } from "../admin-demo-data";
import { adminFetch } from "../components/admin-fetch";
import { UsersManagementView } from "./users-management-view";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

type AdminUser = {
  id: string;
  email: string;
  f_name?: string;
  l_name?: string;
  name?: string;
  role: string;
  is_active?: boolean;
  status?: string;
  created_at: string;
  uploaded_documents?: number;
  verification_attempts?: number;
  last_login_at?: string | null;
};

type UsersData = { users: AdminUser[]; total: number };

async function getUsers(): Promise<UsersData> {
  if (useMock) {
    return {
      users: adminUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        created_at: u.created_at,
        uploaded_documents: u.uploaded_documents,
        verification_attempts: u.verification_attempts,
        last_login_at: u.last_login_at,
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
