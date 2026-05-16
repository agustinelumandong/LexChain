import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminAuditLogsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/audit-logs"
      title="Audit Logs"
      subtitle="Review sensitive admin, document, verification, and permission events."
      cards={[
        { label: "Events", value: "14,203", detail: "Recorded platform audit entries." },
        { label: "Warnings", value: "31", detail: "Events requiring review." },
        { label: "Exports", value: "6", detail: "Audit exports generated this month." },
      ]}
    />
  );
}
