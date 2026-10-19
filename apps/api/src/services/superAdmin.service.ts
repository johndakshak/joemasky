import crypto from "crypto";
import { prisma } from "../lib/prisma";

// ── Token helpers ─────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure, URL-safe invite token.
 * Returns the raw token (to be shared with the invitee) and its SHA-256
 * hex digest (the only value ever stored in the database).
 */
export function generateTokenPair(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 hex chars
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/** Compute the SHA-256 hex digest of a raw invite token. */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ── Database helpers ──────────────────────────────────────────────────────────

/** Persist a new invite using only the hashed token. */
export async function createInvite(createdById: number, tokenHash: string, expiresAt: Date) {
  return prisma.adminInvite.create({
    data: {
      tokenHash,
      createdById,
      expiresAt,
    },
  });
}

/** Look up an invite by the hash of the raw token supplied by the caller. */
export async function findInviteByTokenHash(tokenHash: string) {
  return prisma.adminInvite.findUnique({
    where: { tokenHash },
  });
}

/** GET ALL ADMINS (excludes passwords) */
export async function findAllAdmins() {
  return prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/** FIND ADMIN BY ID (excludes password) */
export async function findAdminById(id: number) {
  return prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

/** SET isActive on an admin account. */
export async function updateAdminStatus(id: number, isActive: boolean) {
  return prisma.admin.update({
    where: { id },
    data: { isActive },
  });
}
