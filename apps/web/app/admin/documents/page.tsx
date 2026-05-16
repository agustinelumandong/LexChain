import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminDocumentsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/documents"
      title="Documents"
      subtitle="Review uploaded document metadata, processing state, ownership, and verification readiness."
      cards={[
        { label: "Uploaded", value: "3,421", detail: "Documents registered in the repository." },
        { label: "Processed", value: "2,987", detail: "OCR and NLP completed." },
        { label: "Pending", value: "128", detail: "Queued or waiting for review." },
      ]}
    />
  );
}
