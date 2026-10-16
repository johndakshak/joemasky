import { AdminShell } from "@/components/admin/AdminShell";
import { ComingSoonCard } from "@/components/admin/ComingSoonCard";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <ComingSoonCard
        title="Order Management"
        description="Review, update, and track customer orders. This feature is coming in the next phase."
        items={[
          "View all customer orders",
          "Filter by status: pending, confirmed, processing, completed",
          "Update order status",
          "Mark item availability",
          "Review partially confirmed orders",
        ]}
      />
    </AdminShell>
  );
}
