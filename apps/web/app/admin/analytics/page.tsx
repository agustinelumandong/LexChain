import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/analytics"
      title="Analytics"
      subtitle="Track usage, processing throughput, verification results, and operational trends."
      cards={[
        { label: "Queries", value: "8,930", detail: "Search and ask-document activity." },
        { label: "Verifications", value: "5,604", detail: "Public and internal verification attempts." },
        { label: "OCR accuracy", value: "91%", detail: "Current demo processing health." },
      ]}
    />
  );
}
