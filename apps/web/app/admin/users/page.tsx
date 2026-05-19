import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { adminUsers } from "../admin-demo-data";
import { backendUrl } from "@/lib/admin-api";
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

type UsersData = {
  users: AdminUser[];
  total: number;
};

async function getUsers(): Promise<UsersData> {
  if (useMock) {
    return {
      users: adminUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      })),
      total: adminUsers.length,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const res = await fetch(backendUrl("/admin/users"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    next: { revalidate: 60 },
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error("Users API unavailable.");

  return res.json();
}

export default async function AdminUsersPage() {
  const data = await getUsers();

  const active = data.users.filter((u) => u.is_active ?? u.status === "active").length;
  const admins = data.users.filter((u) => u.role === "admin" || u.role === "super_admin").length;

  const stats = [
    { label: "Total Users", value: data.total, detail: "Registered accounts", icon: <PeopleIcon fontSize="small" />, color: "blue" as const },
    { label: "Active Users", value: active, detail: "Currently active", icon: <CheckCircleIcon fontSize="small" />, color: "green" as const },
    { label: "Super Admins", value: admins, detail: "Privileged accounts", icon: <ShieldIcon fontSize="small" />, color: "purple" as const },
  ];

  const colorMap = {
    blue: { border: "border-r-[#0985E7]", icon: "text-[#0985E7] bg-[#EEF4FB]" },
    green: { border: "border-r-[#16a34a]", icon: "text-[#16a34a] bg-[#f0fdf4]" },
    purple: { border: "border-r-[#7c3aed]", icon: "text-[#7c3aed] bg-[#f5f3ff]" },
  };

  return (
    <AdminShell activeHref="/admin/users">
      <div className="flex h-full w-full flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
              LexChain Super Admin
            </p>
            <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">Users</h1>
            <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
              Manage registered accounts, roles, and access permissions.
            </p>
          </div>
          <a
            href="/admin/invitations-permissions"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0985E7] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0770c4] focus:outline-none focus:ring-2 focus:ring-[#0985E7] focus:ring-offset-2"
          >
            <PersonAddIcon fontSize="small" />
            Invite User
          </a>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((card) => (
            <article
              key={card.label}
              className={`rounded-2xl border border-[#E4EEF9] border-r-[3px] ${colorMap[card.color].border} bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)]`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[card.color].icon}`}>
                  {card.icon}
                </span>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
                  {card.label}
                </p>
              </div>
              <p className="mt-3 text-3xl font-black text-[#0C2B49]">
                {card.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-bold text-[#64748b]">{card.detail}</p>
            </article>
          ))}
        </section>

        <UsersTable users={data.users} />
      </div>
    </AdminShell>
  );
}
