import type { Metadata } from "next";
import { AdminRegisterForm } from "@/components/admin/AdminRegisterForm";

export const metadata: Metadata = {
  title: "Create Account — Joe Masky Admin",
  description: "Register a new Joe Masky admin account using an invitation token.",
};

/**
 * Admin registration page
 *
 * The invitation token is entered by the user in a form field — no query
 * parameter is required to display this page.  The backend validates
 * whether the submitted token is authentic, unused, and unexpired.
 *
 * The storefront Header and Footer are suppressed by the admin layout.
 */
export default function AdminRegisterPage() {
  return <AdminRegisterForm />;
}
