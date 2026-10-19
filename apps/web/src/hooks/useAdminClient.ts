"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { createAuthenticatedClient } from "@/lib/api/admin";

/**
 * useAdminClient
 *
 * Returns a memoised authenticated API client bound to the current JWT.
 *
 * The client automatically attaches `Authorization: Bearer <token>` to
 * every request.  If the server responds with 401 (expired or revoked
 * token), the onUnauthorized callback clears the Zustand store and
 * redirects to /admin/login (passing the current path as ?from= so
 * GuestOnlyRoute can return the admin here after re-authenticating)
 * before re-throwing the error.
 *
 * Returns null when no token is present so callers can guard:
 *   const client = useAdminClient();
 *   if (!client) return;
 */
export function useAdminClient() {
  const token = useAdminAuthStore((state) => state.token);
  const logout = useAdminAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  const client = useMemo(() => {
    if (!token) return null;

    return createAuthenticatedClient(token, () => {
      logout();
      const loginUrl = `/admin/login?from=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    });
  }, [token, logout, router, pathname]);

  return client;
}
