import { AdminShell } from "../admin-shell";
import { adminUsers } from "../admin-demo-data";
import { adminFetch } from "../components/admin-fetch";
import { PageHeader } from "../components/page-header";
import { StatCard, StatCardData } from "../components/stat-card";
import { UsersTable } from "./users-table";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
};

type UsersData = { users: AdminUser[]; total: number };

async function getUsers(): Promise<UsersData> {
  if (useMock) {
    return {
      users: adminUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, created_at: u.created_at })),
      total: adminUsers.length,
    };
  }
  return adminFetch<UsersData>("/admin/users");
}

export default async function AdminUsersPage() {
  const data = await getUsers();

  const active = data.users.filter((u) => u.is_active ?? u.status === "active").length;
  const admins = data.users.filter((u) => u.role === "admin" || u.role === "super_admin").length;

  const stats: StatCardData[] = [
    { label: "Total Users", value: data.total, detail: "Registered accounts", icon: <PeopleIcon fontSize="small" />, color: "blue" },
    { label: "Active Users", value: active, detail: "Currently active", icon: <CheckCircleIcon fontSize="small" />, color: "green" },
    { label: "Super Admins", value: admins, detail: "Privileged accounts", icon: <ShieldIcon fontSize="small" />, color: "purple" },
  ];

  return (
    <AdminShell activeHref="/admin/users">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader
          title="Users"
          description="Manage registered accounts, roles, and access permissions."
          action={
            <a
              href="/admin/invitations-permissions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0770c4] focus:outline-none focus:ring-2 focus:ring-[#0985E7] focus:ring-offset-2"
            >
              <PersonAddIcon fontSize="small" />
              Invite User
            </a>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((card) => <StatCard key={card.label} {...card} />)}
        </section>

        <UsersTable users={data.users} />
      </div>
    </AdminShell>
  );
}
