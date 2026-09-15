import { AdminRole } from "../generated/prisma/client";

export interface RegisterAdminInput {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}

export interface LoginAdminInput {
  email: string;
  password: string;
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}

export interface AdminPayload {
  id: number;
  role: AdminRole;
}