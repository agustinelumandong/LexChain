import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminDocumentIssuersPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/document-issuers"
      title="Document Issuers"
      subtitle="Monitor offices, law firms, and organizations that issue or notarize records."
      cards={[
        { label: "Issuers", value: "86", detail: "Registered organizations." },
        { label: "Verified", value: "79", detail: "Issuer profiles confirmed." },
        { label: "Needs review", value: "7", detail: "Issuer setup incomplete." },
      ]}
    />
  );
}
