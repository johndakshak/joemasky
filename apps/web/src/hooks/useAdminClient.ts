"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
 * redirects to /admin/login before re-throwing the error.
 *
 * Returns null when no token is present so callers can guard:
 *   const client = useAdminClient();
 *   if (!client) return;
 */
export function useAdminClient() {
  const token = useAdminAuthStore((state) => state.token);
  const logout = useAdminAuthStore((state) => state.logout);
  const router = useRouter();

  const client = useMemo(() => {
    if (!token) return null;

    return createAuthenticatedClient(token, () => {
      logout();
      router.push("/admin/login");
    });
  }, [token, logout, router]);

  return client;
}
