import { prisma } from "../lib/prisma";
import { CreateAdminData } from "../types/admin.types";

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


// FIND INVITE BY TOKEN
export async function findInviteByToken(token: string) {
  return prisma.adminInvite.findUnique({
    where: { token },
  });
}

// MARK INVITE AS USED
export async function markInviteAsUsed(token: string, usedById: number) {
  return prisma.adminInvite.update({
    where: { token },
    data: {
      usedById,
      usedAt: new Date(),
    },
  });
}