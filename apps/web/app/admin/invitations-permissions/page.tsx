import { AdminShell } from "../admin-shell";
import { adminInvitations } from "../admin-demo-data";
import { adminFetch } from "../components/admin-fetch";
import { PageHeader } from "../components/page-header";
import { StatCard, StatCardData } from "../components/stat-card";
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

type InvitationsData = { invitations: Invitation[] };

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
  return adminFetch<InvitationsData>("/admin/invitations");
}

export default async function AdminInvitationsPermissionsPage() {
  const data = await getInvitations();

  const pending = data.invitations.filter((i) => i.status === "pending").length;
  const accepted = data.invitations.filter((i) => i.status === "accepted").length;

  const stats: StatCardData[] = [
    { label: "Total", value: data.invitations.length, detail: "All invitations", icon: <MailIcon fontSize="small" />, color: "blue" },
    { label: "Pending", value: pending, detail: "Awaiting acceptance", icon: <HourglassEmptyIcon fontSize="small" />, color: "yellow" },
    { label: "Accepted", value: accepted, detail: "Users onboarded", icon: <CheckCircleIcon fontSize="small" />, color: "green" },
  ];

  return (
    <AdminShell activeHref="/admin/invitations-permissions">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader
          title="Invitations & Permissions"
          description="Manage lawyer invitations — create new invites and revoke existing ones."
          action={<CreateInvitationModal />}
        />

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((card) => <StatCard key={card.label} {...card} />)}
        </section>

        <InvitationsTable invitations={data.invitations} />
      </div>
    </AdminShell>
  );
}
