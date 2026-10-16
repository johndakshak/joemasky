import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Sign In — Joe Masky Admin",
  description: "Admin login for Joe Masky Caps & Bags.",
};

/**
 * Admin login page
 *
 * Full-page two-column layout (brand panel + form panel).
 * The storefront Header and Footer are suppressed by the admin layout.
 * Authentication is handled by AdminLoginForm against POST /login/admin.
 */
export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
