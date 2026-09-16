import { prisma } from "../lib/prisma";
import { CreateAdminData } from "../types/admin.types";

// CREATE INVITE
export async function createInvite(createdById: number, expiresAt: Date) {
  return prisma.adminInvite.create({
    data: {
      createdById,
      expiresAt,
    },
  });
}

// FREEZE ADMIN
export async function updateAdminStatus(id: number, isActive: boolean) {
  return prisma.admin.update({
    where: { id },
    data: { isActive },
  });
}