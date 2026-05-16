import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminSystemSettingsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/system-settings"
      title="System Settings"
      subtitle="Prepare platform configuration screens for web deployment, API domains, and policy toggles."
      cards={[
        { label: "Environment", value: "Demo", detail: "Current web portal mode." },
        { label: "API domain", value: "Pending", detail: "Will point to api.lexchain.app later." },
        { label: "Policies", value: "8", detail: "Security and verification settings." },
      ]}
    />
  );
}
