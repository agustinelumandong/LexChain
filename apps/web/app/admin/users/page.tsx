import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminUsersPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/users"
      title="Users"
      subtitle="Monitor registered user accounts, roles, access state, and platform activity."
      cards={[
        { label: "Registered", value: "1,248", detail: "Total active accounts." },
        { label: "Admins", value: "14", detail: "Privileged management accounts." },
        { label: "Pending invites", value: "42", detail: "Users not yet onboarded." },
      ]}
    />
  );
}
