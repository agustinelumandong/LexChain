import { MockResourcePage } from "../mock-resource-page";

export default async function AdminCategoriesPage() {
  const { adminCategories } = await import("../admin-demo-data");

  return (
    <MockResourcePage resource="categories" rows={adminCategories} />
  );
}
