import { AdminShell } from "@/components/admin/AdminShell";
import { ComingSoonCard } from "@/components/admin/ComingSoonCard";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <ComingSoonCard
        title="Settings"
        description="Admin account settings and shop configuration will be available here in a future phase."
        items={[
          "Update admin profile",
          "Manage admin accounts (Super Admin)",
          "Shop contact configuration",
        ]}
      />
    </AdminShell>
  );
}
