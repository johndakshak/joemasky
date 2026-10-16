import type { ReactNode } from "react";

/**
 * Admin layout
 * 
 * Removes the storefront Header and Footer for admin authentication pages.
 * The dashboard implements its own admin-specific header.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
