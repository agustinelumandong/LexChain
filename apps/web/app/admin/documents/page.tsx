"use client";

import { adminDocuments } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage, formatAdminDate } from "../admin-resource-page";

export default function AdminDocumentsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/documents"
      title="Documents"
      subtitle="Review uploaded document metadata, processing state, ownership, and verification readiness."
      cards={[
        { label: "Uploaded", value: adminDocuments.length, detail: "Documents in this view." },
        { label: "Anchored", value: adminDocuments.filter((row) => row.blockchain_status === "anchored").length, detail: "Blockchain records confirmed." },
        { label: "Needs review", value: adminDocuments.filter((row) => row.status === "failed" || row.status === "tampered").length, detail: "Failed or mismatch state." },
      ]}
      columns={[
        { key: "file", label: "File", render: (row) => row.file_name },
        { key: "owner", label: "Owner", render: (row) => row.owner_name },
        { key: "category", label: "Category", render: (row) => <AdminBadge>{row.category}</AdminBadge> },
        { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> },
        { key: "processing", label: "OCR / NLP", render: (row) => `${row.ocr_status} / ${row.nlp_status}` },
        { key: "chain", label: "Chain", render: (row) => <AdminBadge>{row.blockchain_status}</AdminBadge> },
        { key: "created", label: "Created", render: (row) => formatAdminDate(row.created_at) },
      ]}
      rows={adminDocuments}
    />
  );
}
