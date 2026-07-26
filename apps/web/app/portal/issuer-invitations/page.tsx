import { adminFetch } from "../../admin/components/admin-fetch";
import { InvitationsManagementView } from "../../admin/invitations-permissions/invitations-management-view";

const useMock = process.env.USE_MOCK_API === "true";

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
    const { adminInvitations } = await import("../../admin/admin-demo-data");
    return {
      invitations: adminInvitations.map((invitation, index) => ({
        id: `demo-${index}`,
        email: invitation.participant_email,
        role: "document_issuer",
        status: invitation.status,
        expires_at: invitation.sent_at,
        created_at: invitation.sent_at,
        magic_link: null,
      })),
    };
  }

  return adminFetch<InvitationsData>("/admin/invitations");
}

export default async function PortalIssuerInvitationsPage() {
  const data = await getInvitations();

  return <InvitationsManagementView invitations={data.invitations} mockMode={useMock} />;
}
