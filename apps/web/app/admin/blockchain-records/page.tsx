import { adminBlockchainRecords } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage, formatAdminDate } from "../admin-resource-page";

export default function AdminBlockchainRecordsPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/blockchain-records"
      title="Blockchain Records"
      subtitle="Inspect anchoring status, transaction hashes, issuer addresses, and integrity checks."
      cards={[
        { label: "Records", value: adminBlockchainRecords.length, detail: "Tracked blockchain writes." },
        { label: "Anchored", value: adminBlockchainRecords.filter((row) => row.status === "anchored").length, detail: "Documents with on-chain records." },
        { label: "Failed", value: adminBlockchainRecords.filter((row) => row.status === "failed").length, detail: "Needs retry." },
      ]}
      columns={[
        { key: "hash", label: "Document Hash", render: (row) => row.document_hash },
        { key: "tx", label: "Transaction", render: (row) => row.transaction_hash },
        { key: "block", label: "Block", render: (row) => row.block_number ?? "Pending" },
        { key: "network", label: "Network", render: (row) => row.network },
        { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> },
        { key: "anchored", label: "Anchored", render: (row) => formatAdminDate(row.anchored_at) },
      ]}
      rows={adminBlockchainRecords}
    />
  );
}
