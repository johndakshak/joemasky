import { prisma } from "../lib/prisma";
import { CreateAdminData } from "../types/admin.types";
import { hashToken } from "./superAdmin.service";

// FIND ADMIN BY EMAIL
export async function findAdminByEmail(email: string) {
  return prisma.admin.findUnique({
    where: { email },
  });
}

// CREATE ADMIN
export async function createAdmin(data: CreateAdminData) {
  return prisma.admin.create({
    data,
  });
}

// FIND INVITE BY RAW TOKEN
// Hashes the supplied raw token before querying so the database never holds
// the plaintext value that an invitee would use to register.
export async function findInviteByToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  return prisma.adminInvite.findUnique({
    where: { tokenHash },
  });
}

// MARK INVITE AS USED
// Accepts the raw token and hashes it internally to locate the record.
export async function markInviteAsUsed(rawToken: string, usedById: number) {
  const tokenHash = hashToken(rawToken);
  return prisma.adminInvite.update({
    where: { tokenHash },
    data: {
      usedById,
      usedAt: new Date(),
    },
  });
}
