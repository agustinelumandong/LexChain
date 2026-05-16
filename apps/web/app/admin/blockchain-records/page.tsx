import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminBlockchainRecordsPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/blockchain-records"
      title="Blockchain Records"
      subtitle="Inspect anchoring status, transaction hashes, issuer addresses, and integrity checks."
      cards={[
        { label: "Anchored", value: "2,842", detail: "Documents with on-chain records." },
        { label: "Pending anchor", value: "47", detail: "Queued blockchain writes." },
        { label: "Alerts", value: "9", detail: "Hash mismatches under review." },
      ]}
    />
  );
}
