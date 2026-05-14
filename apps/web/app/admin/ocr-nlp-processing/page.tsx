import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminOcrNlpProcessingPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/ocr-nlp-processing"
      title="OCR / NLP Processing"
      subtitle="Monitor extraction queues, summary generation, key field detection, and failed jobs."
      cards={[
        { label: "Processed", value: "2,987", detail: "Completed OCR/NLP jobs." },
        { label: "Queued", value: "128", detail: "Waiting for extraction." },
        { label: "Failed", value: "17", detail: "Needs retry or manual review." },
      ]}
    />
  );
}
