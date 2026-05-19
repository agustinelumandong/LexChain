import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import { adminInvitations } from "../admin-demo-data";
import { backendUrl } from "@/lib/admin-api";
import { CreateInvitationModal } from "./create-invitation-modal";
import { InvitationsTable } from "./invitations-table";
import MailIcon from "@mui/icons-material/Mail";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
    next: { revalidate: 60 },
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error("Invitations API unavailable.");

  return res.json();
}

export default async function AdminInvitationsPermissionsPage() {
  const data = await getInvitations();

  const pending = data.invitations.filter((i) => i.status === "pending").length;
  const accepted = data.invitations.filter((i) => i.status === "accepted").length;

  const stats = [
    { label: "Total", value: data.invitations.length, detail: "All invitations", icon: <MailIcon fontSize="small" />, color: "blue" as const },
    { label: "Pending", value: pending, detail: "Awaiting acceptance", icon: <HourglassEmptyIcon fontSize="small" />, color: "yellow" as const },
    { label: "Accepted", value: accepted, detail: "Users onboarded", icon: <CheckCircleIcon fontSize="small" />, color: "green" as const },
  ];

  const colorMap = {
    blue: { border: "border-r-[#0985E7]", icon: "text-[#0985E7] bg-[#EEF4FB]" },
    yellow: { border: "border-r-[#ca8a04]", icon: "text-[#ca8a04] bg-[#fefce8]" },
    green: { border: "border-r-[#16a34a]", icon: "text-[#16a34a] bg-[#f0fdf4]" },
  };

  return (
    <AdminShell activeHref="/admin/invitations-permissions">
      <div className="flex h-full w-full flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0985E7]">
              LexChain Super Admin
            </p>
            <h1 className="text-[32px] font-black leading-[38px] text-[#0C2B49]">
              Invitations & Permissions
            </h1>
            <p className="max-w-3xl text-sm font-semibold leading-5 text-[#64748b]">
              Manage lawyer invitations — create new invites and revoke existing ones.
            </p>
          </div>
          <CreateInvitationModal />
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

        <InvitationsTable invitations={data.invitations} />
      </div>
    </AdminShell>
  );
}
