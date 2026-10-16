import { redirect } from "next/navigation";

/**
 * /admin/dashboard → /admin (permanent redirect)
 *
 * The dashboard homepage moved to /admin in Phase 11.
 * This keeps any existing bookmarks or links working.
 */
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
