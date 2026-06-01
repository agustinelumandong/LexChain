import { AdminShell } from "../admin-shell";
import { adminFetch } from "../components/admin-fetch";
import { InvitationsManagementView } from "./invitations-management-view";

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
    const { adminInvitations } = await import("../admin-demo-data");
    return {
      invitations: adminInvitations.map((inv, i) => ({
        id: `demo-${i}`,
        email: inv.participant_email,
        role: "document_issuer",
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

  return (
    <AdminShell activeHref="/admin/invitations-permissions">
      <InvitationsManagementView invitations={data.invitations} mockMode={useMock} />
    </AdminShell>
  );
}
