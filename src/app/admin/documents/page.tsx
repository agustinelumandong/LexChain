import { MockResourcePage } from "@/features/admin/mock-resource-page";

export default async function AdminDocumentsPage() {
  const { adminDocuments } = await import("@/features/admin/admin-demo-data");

  return (
    <MockResourcePage resource="documents" rows={adminDocuments} />
  );
}
