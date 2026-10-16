"use client";

import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Admin dashboard page
 * 
 * Protected route requiring authentication.
 * Currently a placeholder - product/order management will be implemented
 * in future phases as per the roadmap.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, logout } = useAdminAuthStore();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-charcoal/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-charcoal">{admin?.name}</p>
                <p className="text-xs text-warmgray">{admin?.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-sm text-warmgray hover:text-charcoal"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="font-bebas text-4xl tracking-wider text-charcoal mb-2">
            Admin Dashboard
          </h1>
          <p className="text-warmgray mb-8">
            Welcome back, {admin?.name}
          </p>

          <div className="bg-white p-8 border border-charcoal/10">
            <h2 className="font-bebas text-2xl tracking-wider text-charcoal mb-4">
              Coming Soon
            </h2>
            <p className="text-warmgray mb-4">
              Product and order management features will be implemented in the next roadmap phases.
            </p>
            <ul className="space-y-2 text-sm text-warmgray">
              <li>• Product management (CRUD operations)</li>
              <li>• Order management and status updates</li>
              <li>• Inventory tracking</li>
              <li>• Customer management</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}
