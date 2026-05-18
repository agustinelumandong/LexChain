import { adminInvitations } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage, formatAdminDate } from "../admin-resource-page";

export default function AdminInvitationsPermissionsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/invitations-permissions"
      title="Invitations & Permissions"
      subtitle="Track onboarding links, whitelist grants, role invitations, and access state."
      notice="Document issuers invite participants per document. Super Admin monitors logs and can revoke abusive access as an emergency control."
      cards={[
        { label: "Invites", value: adminInvitations.length, detail: "Tracked invite events." },
        { label: "Accepted", value: adminInvitations.filter((row) => row.status === "accepted").length, detail: "Users onboarded." },
        { label: "Pending/expired", value: adminInvitations.filter((row) => row.status !== "accepted").length, detail: "Needs follow-up." },
      ]}
      columns={[
        { key: "document", label: "Document", render: (row) => row.document_name },
        { key: "issuer", label: "Issuer", render: (row) => row.issuer },
        { key: "email", label: "Participant", render: (row) => row.participant_email },
        { key: "permission", label: "Permission", render: (row) => <AdminBadge>{row.permission_type}</AdminBadge> },
        { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> },
        { key: "sent", label: "Sent", render: (row) => formatAdminDate(row.sent_at) },
      ]}
      rows={adminInvitations}
    />
  );
}
