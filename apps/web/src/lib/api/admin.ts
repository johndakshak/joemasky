import { apiClient, ApiError } from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from "@/types/admin";

/**
 * Admin login
 * POST /login/admin
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/login/admin", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Admin registration (invite-only)
 * POST /register/admin
 *
 * Requires a valid, unexpired invite token issued by a super-admin via
 * POST /admin/invite.  On success the backend returns the new admin's public
 * fields only — no JWT is issued, so the admin must sign in separately.
 */
export async function registerAdmin(credentials: RegisterCredentials): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/register/admin", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Create an authenticated API client bound to a JWT token.
 *
 * Automatically attaches `Authorization: Bearer <token>` to every request.
 *
 * If the server responds with 401 (expired or invalid token), the optional
 * `onUnauthorized` callback is invoked before re-throwing, giving callers
 * a chance to clear auth state and redirect without having to inspect the
 * status themselves.
 *
 * Usage:
 *   const client = createAuthenticatedClient(token, () => {
 *     logout();
 *     router.push("/admin/login");
 *   });
 *   const data = await client<Product[]>("/products");
 */
export function createAuthenticatedClient(
  token: string,
  onUnauthorized?: () => void
) {
  return async function authenticatedApiClient<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      return await apiClient<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
      }
      throw err;
    }
  };
}
