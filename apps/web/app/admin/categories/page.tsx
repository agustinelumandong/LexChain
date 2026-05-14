import { AdminPlaceholderPage } from "../admin-placeholder-page";

export default function AdminCategoriesPage() {
  return (
    <AdminPlaceholderPage
      activeHref="/admin/categories"
      title="Categories"
      subtitle="Manage document grouping, classification labels, and category usage patterns."
      cards={[
        { label: "Categories", value: "28", detail: "Configured document types." },
        { label: "Most used", value: "Contracts", detail: "Top category by volume." },
        { label: "Unsorted", value: "73", detail: "Documents needing classification." },
      ]}
    />
  );
}
