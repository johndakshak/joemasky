import { AdminShell } from "@/components/admin/AdminShell";
import { ComingSoonCard } from "@/components/admin/ComingSoonCard";

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <ComingSoonCard
        title="Customer Records"
        description="Browse customer order history and contact details. This feature is coming in a future phase."
        items={[
          "View customers by order history",
          "Access contact details",
          "Track order count per customer",
        ]}
      />
    </AdminShell>
  );
}
