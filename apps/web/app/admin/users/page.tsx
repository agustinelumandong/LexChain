import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { adminUsers } from "../admin-demo-data";
import { backendUrl } from "@/lib/admin-api";

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

function formatRole(role: string) {
  return role === "admin" ? "super_admin" : role;
}

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
    cache: "no-store",
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error("Users API unavailable.");

  return res.json();
}

export default async function AdminUsersPage() {
  const data = await getUsers();

  const active = data.users.filter((u) => u.is_active ?? u.status === "active").length;
  const admins = data.users.filter((u) => u.role === "admin" || u.role === "super_admin").length;

  return (
    <AdminShell activeHref="/admin/users">
      <div className="mx-auto space-y-6">
        <header className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
            LexChain Super Admin
          </p>
          <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">Users</h1>
          <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
            All registered user accounts, roles, and activity state.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total", value: data.total, detail: "Registered accounts" },
            { label: "Active", value: active, detail: "Currently active" },
            { label: "Super admins", value: admins, detail: "Privileged accounts" },
          ].map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-[#E4EEF9] bg-white p-5 shadow-[0_1px_3px_rgba(12,43,73,0.03)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-[#0C2B49]">
                {card.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-bold text-[#64748b]">{card.detail}</p>
            </article>
          ))}
        </section>

        <article className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white">
          <div className="border-b border-[#E4EEF9] px-6 py-4">
            <h2 className="text-lg font-black text-[#0C2B49]">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EEF9] bg-[#F8FBFF]">
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user, i) => (
                  <tr
                    key={user.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#F8FBFF]"}
                  >
                    <td className="px-6 py-3.5 font-semibold text-[#0C2B49]">
                      {user.name ?? `${user.f_name ?? ""} ${user.l_name ?? ""}`.trim()}
                    </td>
                    <td className="px-6 py-3.5 text-[#64748b]">{user.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-xs font-black capitalize text-[#0985E7]">
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          user.is_active
                          ?? user.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.is_active ?? user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#64748b]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#64748b]">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
