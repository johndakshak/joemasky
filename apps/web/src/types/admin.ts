export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

// Registration — POST /register/admin
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}

// Backend returns the new admin's public fields (no token — the admin must
// log in separately after registering).
export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
}
