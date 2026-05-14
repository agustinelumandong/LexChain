import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminInvitationsPermissionsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/invitations-permissions"
      title="Invitations & Permissions"
      subtitle="Track onboarding links, whitelist grants, role invitations, and access state."
      cards={[
        { label: "Pending invites", value: "42", detail: "Users invited but not onboarded." },
        { label: "Whitelist grants", value: "1,604", detail: "Document-level access entries." },
        { label: "Revoked", value: "18", detail: "Removed access grants this month." },
      ]}
    />
  );
}
