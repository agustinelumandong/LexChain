import { MockResourcePage } from "@/features/admin/mock-resource-page";

export default async function AdminDocumentIssuersPage() {
  const { adminIssuers } = await import("@/features/admin/admin-demo-data");

  return (
    <MockResourcePage resource="document-issuers" rows={adminIssuers} />
  );
}
