"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedAdminRoute
 *
 * Guards admin pages against unauthenticated access.
 *
 * Behaviour:
 * - Reads authentication state from the Zustand store (backed by sessionStorage).
 * - If no valid session exists, redirects to /admin/login immediately.
 * - Shows a neutral loading state during the async hydration tick to prevent
 *   a flash of protected content before the store has rehydrated from storage.
 *
 * Token expiry:
 * - The store holds the token until the browser tab is closed (sessionStorage).
 * - A stale but structurally present token will pass this client-side check.
 * - The backend requireAdmin middleware validates every protected API request
 *   and returns 401 for expired/invalid tokens.
 * - When that happens, the authenticated client created by
 *   createAuthenticatedClient(token, onUnauthorized) will call the supplied
 *   onUnauthorized callback, which should call logout() and redirect here.
 *
 * Note: client-side protection prevents accidental navigation only.
 * All sensitive data is protected by backend middleware — never rely solely
 * on this component for security.
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAdminAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear any partial state before redirecting to avoid stale store data
      // landing on the login page and immediately redirecting back.
      logout();
      router.push("/admin/login");
    }
  }, [isAuthenticated, token, logout, router]);

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-warmgray font-barlow text-sm">Checking authentication…</p>
      </div>
    );
  }

  return <>{children}</>;
}
