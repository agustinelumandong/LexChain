import { MockResourcePage } from "../mock-resource-page";

export default async function AdminBlockchainRecordsPage() {
  const { adminBlockchainRecords } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="blockchain-records" rows={adminBlockchainRecords} />
  );
}
