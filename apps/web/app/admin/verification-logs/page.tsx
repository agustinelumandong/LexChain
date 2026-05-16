import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminVerificationLogsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/verification-logs"
      title="Verification Logs"
      subtitle="Review uploaded PDF checks, public verifier attempts, status results, and confidence scores."
      cards={[
        { label: "Attempts", value: "5,604", detail: "Total verification requests." },
        { label: "Matches", value: "4,912", detail: "Verified document matches." },
        { label: "Mismatches", value: "9", detail: "Potential tamper alerts." },
      ]}
    />
  );
}
