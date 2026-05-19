import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { adminInvitations } from "../admin-demo-data";
import { backendUrl } from "@/lib/admin-api";
import { createInvitation, revokeInvitation } from "../actions";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  magic_link?: string | null;
};

type InvitationsData = {
  invitations: Invitation[];
};

async function getInvitations(): Promise<InvitationsData> {
  if (useMock) {
    return {
      invitations: adminInvitations.map((inv, i) => ({
        id: `demo-${i}`,
        email: inv.participant_email,
        role: "lawyer",
        status: inv.status,
        expires_at: inv.sent_at,
        created_at: inv.sent_at,
        magic_link: null,
      })),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const res = await fetch(backendUrl("/admin/invitations"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error("Invitations API unavailable.");

  return res.json();
}

export default async function AdminInvitationsPermissionsPage() {
  const data = await getInvitations();

  const pending = data.invitations.filter((i) => i.status === "pending").length;
  const accepted = data.invitations.filter((i) => i.status === "accepted").length;

  return (
    <AdminShell activeHref="/admin/invitations-permissions">
      <div className="mx-auto space-y-6">
        <header className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
            LexChain Super Admin
          </p>
          <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">
            Invitations & Permissions
          </h1>
          <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
            Manage lawyer invitations — create new invites and revoke existing ones.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total", value: data.invitations.length, detail: "All invitations" },
            { label: "Pending", value: pending, detail: "Awaiting acceptance" },
            { label: "Accepted", value: accepted, detail: "Users onboarded" },
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

        {/* Create Invitation Form */}
        <article className="rounded-2xl border border-[#E4EEF9] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0C2B49]">Create Invitation</h2>
          <p className="mt-1 text-sm font-semibold text-[#64748b]">
            Send a magic-link invitation to a lawyer to join the platform.
          </p>
          <form action={createInvitation} className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-[0.1em] text-[#64748b] mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="lawyer@example.com"
                className="w-full rounded-lg border border-[#E4EEF9] px-4 py-2.5 text-sm text-[#0C2B49] placeholder:text-[#94a3b8] focus:border-[#0985E7] focus:outline-none focus:ring-1 focus:ring-[#0985E7]"
              />
            </div>
            <div className="w-[160px]">
              <label htmlFor="role" className="block text-xs font-black uppercase tracking-[0.1em] text-[#64748b] mb-1.5">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-lg border border-[#E4EEF9] px-4 py-2.5 text-sm text-[#0C2B49] focus:border-[#0985E7] focus:outline-none focus:ring-1 focus:ring-[#0985E7]"
              >
                <option value="lawyer">Lawyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#0985E7] px-6 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#0770c4] transition-colors"
            >
              Send Invitation
            </button>
          </form>
        </article>

        {/* Invitations Table */}
        <article className="overflow-hidden rounded-2xl border border-[#E4EEF9] bg-white">
          <div className="border-b border-[#E4EEF9] px-6 py-4">
            <h2 className="text-lg font-black text-[#0C2B49]">All Invitations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EEF9] bg-[#F8FBFF]">
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
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.invitations.map((inv, i) => (
                  <tr key={inv.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FBFF]"}>
                    <td className="px-6 py-3.5 font-semibold text-[#0C2B49]">{inv.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-xs font-black capitalize text-[#0985E7]">
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          inv.status === "accepted"
                            ? "bg-green-50 text-green-700"
                            : inv.status === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#64748b]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-[#64748b]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5">
                      {inv.status === "pending" && (
                        <form action={revokeInvitation} className="inline">
                          <input type="hidden" name="invitation_id" value={inv.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Revoke
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
                {data.invitations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#64748b]">
                      No invitations found.
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
