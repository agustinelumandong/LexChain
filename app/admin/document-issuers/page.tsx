import { MockResourcePage } from "../mock-resource-page";

export default async function AdminDocumentIssuersPage() {
  const { adminIssuers } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="document-issuers" rows={adminIssuers} />
  );
}
