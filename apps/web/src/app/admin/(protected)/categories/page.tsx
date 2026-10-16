import { AdminShell } from "@/components/admin/AdminShell";
import { ComingSoonCard } from "@/components/admin/ComingSoonCard";

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <ComingSoonCard
        title="Category Management"
        description="Organise your products into categories. This feature is coming in a future phase."
        items={[
          "Create and name product categories",
          "Assign products to one or more categories",
          "Reorder and rename categories",
          "Remove empty or unused categories",
        ]}
      />
    </AdminShell>
  );
}
