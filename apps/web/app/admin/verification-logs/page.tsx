import { adminVerificationLogs } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage, formatAdminDate } from "../admin-resource-page";

export default function AdminVerificationLogsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/verification-logs"
      title="Verification Logs"
      subtitle="Review uploaded PDF checks, public verifier attempts, status results, and confidence scores."
      cards={[
        { label: "Attempts", value: adminVerificationLogs.length, detail: "Total verification requests." },
        { label: "Matches", value: adminVerificationLogs.filter((row) => row.status === "authentic").length, detail: "Verified document matches." },
        { label: "Mismatches", value: adminVerificationLogs.filter((row) => row.status === "mismatch").length, detail: "Potential tamper alerts." },
      ]}
      columns={[
        { key: "document", label: "Document", render: (row) => row.document_name },
        { key: "code", label: "Code", render: (row) => row.verification_code },
        { key: "verifier", label: "Verifier", render: (row) => row.verifier },
        { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> },
        { key: "hash", label: "Hash", render: (row) => row.blockchain_hash },
        { key: "date", label: "Verified", render: (row) => formatAdminDate(row.verified_at) },
      ]}
      rows={adminVerificationLogs}
    />
  );
}
