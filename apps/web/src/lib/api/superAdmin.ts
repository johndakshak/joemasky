import type { AdminRole } from "@/types/admin";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminRecord {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface GeneratedInvite {
  token: string;
  expiresAt: string;
}

// ── API functions ──────────────────────────────────────────────────────────

type AuthClient = <T>(path: string, options?: RequestInit) => Promise<T>;

/** List all admin accounts. Super Admin only. */
export async function listAdmins(client: AuthClient): Promise<AdminRecord[]> {
  return client<AdminRecord[]>("/admin/admins");
}

/** Generate an invite token. Super Admin only. */
export async function generateInvite(client: AuthClient): Promise<GeneratedInvite> {
  return client<GeneratedInvite>("/admin/invite", { method: "POST" });
}

/** Freeze an admin account. Super Admin only. */
export async function freezeAdmin(client: AuthClient, id: number): Promise<AdminRecord> {
  return client<AdminRecord>(`/freeze/${id}`, { method: "PATCH" });
}

/** Unfreeze an admin account. Super Admin only. */
export async function unfreezeAdmin(client: AuthClient, id: number): Promise<AdminRecord> {
  return client<AdminRecord>(`/unfreeze/${id}`, { method: "PATCH" });
}
