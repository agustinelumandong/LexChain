import { adminCategories } from "../admin-demo-data";
import { AdminBadge, AdminResourcePage } from "../admin-resource-page";

export default function AdminCategoriesPage() {
  return (
    <AdminResourcePage
      activeHref="/admin/categories"
      title="Categories"
      subtitle="Manage document grouping, classification labels, and category usage patterns."
      cards={[
        { label: "Categories", value: adminCategories.length, detail: "Configured document types." },
        { label: "Public", value: adminCategories.filter((row) => row.publicly_verifiable).length, detail: "Public verification allowed." },
        { label: "Invite only", value: adminCategories.filter((row) => row.requires_invitation).length, detail: "Requires controlled access." },
      ]}
      columns={[
        { key: "name", label: "Category", render: (row) => row.name },
        { key: "public", label: "Public", render: (row) => row.publicly_verifiable ? "Yes" : "No" },
        { key: "invite", label: "Invite", render: (row) => row.requires_invitation ? "Required" : "Optional" },
        { key: "download", label: "Download", render: (row) => row.allow_download ? "Allowed" : "Blocked" },
        { key: "privacy", label: "Default Privacy", render: (row) => <AdminBadge>{row.default_privacy}</AdminBadge> },
      ]}
      rows={adminCategories}
    />
  );
}
