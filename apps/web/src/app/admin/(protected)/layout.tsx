import type { ReactNode } from "react";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";

/**
 * Protected admin layout
 *
 * Wraps every route under /admin/(protected) with ProtectedAdminRoute.
 * Routes outside this group (/admin/login, /admin/register) remain
 * public — they sit under /admin/layout.tsx which is a passthrough.
 *
 * Any new admin page added under this group is protected automatically.
 */
export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <ProtectedAdminRoute>{children}</ProtectedAdminRoute>;
}
