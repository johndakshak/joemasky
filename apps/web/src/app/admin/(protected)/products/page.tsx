import { AdminShell } from "@/components/admin/AdminShell";
import { ComingSoonCard } from "@/components/admin/ComingSoonCard";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <ComingSoonCard
        title="Product Management"
        description="Create, edit, and manage your product catalogue. This feature is coming in the next phase."
        items={[
          "Add new products with images",
          "Update product details and pricing",
          "Toggle product availability",
          "Manage product categories",
          "Delete discontinued products",
        ]}
      />
    </AdminShell>
  );
}
