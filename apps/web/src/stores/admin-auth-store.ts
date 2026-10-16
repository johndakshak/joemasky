"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "@/types/admin";

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
}

/**
 * Admin authentication store
 * 
 * Stores admin info and JWT token in sessionStorage (not localStorage)
 * for security. Token expires automatically based on backend JWT_EXPIRES_IN.
 * 
 * The token is sent in Authorization header for protected API requests.
 * Backend validates the token via requireAdmin middleware.
 */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      login: (admin, token) =>
        set({
          admin,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "admin-auth",
      // Use sessionStorage instead of localStorage for better security
      // Token is cleared when browser/tab closes
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
