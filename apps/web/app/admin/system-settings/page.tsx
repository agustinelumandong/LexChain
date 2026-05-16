import { adminSettings } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage } from "../admin-resource-page";

export default function AdminSystemSettingsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/system-settings"
      title="System Settings"
      subtitle="Prepare platform configuration screens for web deployment, API domains, and policy toggles."
      cards={[
        { label: "Settings", value: adminSettings.length, detail: "Tracked platform settings." },
        { label: "Network", value: "Amoy", detail: "Current blockchain testnet." },
        { label: "Maintenance", value: "Off", detail: "System availability." },
      ]}
      columns={[
        { key: "setting", label: "Setting", render: (row) => row.setting },
        { key: "value", label: "Value", render: (row) => row.value },
        { key: "scope", label: "Scope", render: (row) => <AdminBadge>{row.scope}</AdminBadge> },
      ]}
      rows={adminSettings}
    />
  );
}
