import { MockResourcePage } from "../mock-resource-page";

export default async function AdminDocumentsPage() {
  const { adminDocuments } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="documents" rows={adminDocuments} />
  );
}
