"use client";

import { adminProcessingLogs } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage } from "../admin-resource-page";

export default function AdminOcrNlpProcessingPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/ocr-nlp-processing"
      title="OCR / NLP Processing"
      subtitle="Monitor extraction queues, summary generation, key field detection, and failed jobs."
      cards={[
        { label: "Jobs", value: adminProcessingLogs.length, detail: "Recent processing logs." },
        { label: "Generated", value: adminProcessingLogs.filter((row) => row.nlp_status === "generated").length, detail: "NLP output ready." },
        { label: "Needs retry", value: adminProcessingLogs.filter((row) => row.ocr_status !== "success" || row.nlp_status !== "generated").length, detail: "Requires review." },
      ]}
      columns={[
        { key: "document", label: "Document", render: (row) => row.document_name },
        { key: "ocr", label: "OCR", render: (row) => <AdminBadge>{row.ocr_status}</AdminBadge> },
        { key: "nlp", label: "NLP", render: (row) => <AdminBadge>{row.nlp_status}</AdminBadge> },
        { key: "extracted", label: "Extracted Data", render: (row) => row.extracted_data_status },
        { key: "time", label: "Time", render: (row) => row.processing_time },
        { key: "usage", label: "API Usage", render: (row) => row.api_usage },
      ]}
      rows={adminProcessingLogs}
    />
  );
}
