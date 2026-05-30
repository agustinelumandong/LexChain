"use client";

import { adminAnalytics } from "../admin-demo-data";
import { AdminResourcePage } from "../admin-resource-page";

export default function AdminAnalyticsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/analytics"
      title="Analytics"
      subtitle="Track usage, processing throughput, verification results, and operational trends."
      cards={[
        { label: "Metrics", value: adminAnalytics.length, detail: "Operational signals." },
        { label: "Verification", value: "95%", detail: "Success rate." },
        { label: "OCR/NLP fail", value: "3%", detail: "Current demo failure rate." },
      ]}
      columns={[
        { key: "metric", label: "Metric", render: (row) => row.label },
        { key: "value", label: "Value", render: (row) => row.value },
        { key: "detail", label: "Detail", render: (row) => row.detail },
      ]}
      rows={adminAnalytics}
    />
  );
}
