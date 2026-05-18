import { adminIssuers } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage } from "../admin-resource-page";

export default function AdminDocumentIssuersPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/document-issuers"
      title="Document Issuers"
      subtitle="Monitor offices, law firms, and organizations that issue or notarize records."
      cards={[
        { label: "Issuers", value: adminIssuers.length, detail: "Registered organizations." },
        { label: "Active", value: adminIssuers.filter((row) => row.status === "active").length, detail: "Issuer profiles active." },
        { label: "Needs review", value: adminIssuers.filter((row) => row.status === "under_review").length, detail: "Issuer setup incomplete." },
      ]}
      columns={[
        { key: "name", label: "Issuer", render: (row) => row.name },
        { key: "email", label: "Contact", render: (row) => row.contact_email },
        { key: "type", label: "Type", render: (row) => <AdminBadge>{row.organization_type}</AdminBadge> },
        { key: "users", label: "Users", render: (row) => row.active_users },
        { key: "docs", label: "Documents", render: (row) => row.documents_uploaded },
        { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> },
      ]}
      rows={adminIssuers}
    />
  );
}
