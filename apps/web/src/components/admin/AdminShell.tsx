"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminRole } from "@/types/admin";

interface AdminShellProps {
  children: React.ReactNode;
}

// ── SidebarContent ────────────────────────────────────────────────────────────
// Declared outside AdminShell to satisfy the React compiler's static-components
// lint rule (no component definitions inside render).

interface SidebarContentProps {
  adminName: string;
  adminRole: string;
  onLogout: () => void;
  /** Present when rendered inside the mobile Sheet drawer. */
  onNavigate?: () => void;
}

function SidebarContent({
  adminName,
  adminRole,
  onLogout,
  onNavigate,
}: SidebarContentProps) {
  const isMobileDrawer = !!onNavigate;

  return (
    <div className="flex flex-col h-full" style={{ background: "#1c1a14" }}>

      {/* ── Logo + close button row ──────────────────────────────── */}
      <div className="px-6 pt-8 pb-5">
        <div className="flex items-start justify-between gap-2">

          {/* Logo — same proportions as the login/register page mobile logo:
              height 72px · aspect-ratio 690/290 · max-width 280px */}
          <Link
            href="/"
            className="block focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-4 focus-visible:outline-gold"
            aria-label="Joe Masky — back to storefront"
            onClick={onNavigate}
            style={{
              display: "block",
              height: "48px",
              aspectRatio: "690/290",
              maxWidth: "220px",
              flex: "1 1 auto",
            }}
          >
            <Logo className="w-full h-full" />
          </Link>

          {/* Close button — visible only inside the mobile Sheet drawer.
              Uses SheetClose so base-ui's Dialog.Close fires the onOpenChange
              callback and the Sheet closes reliably via its own mechanism. */}
          {isMobileDrawer && (
            <SheetClose
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center
                         transition-colors focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{ color: "rgba(255,255,255,0.40)", marginTop: "2px" }}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
                (e.currentTarget.style.color = "var(--gold)")
              }
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.40)")
              }
              aria-label="Close navigation"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </SheetClose>
          )}
        </div>

        <p
          className="mt-1 font-barlow uppercase tracking-[0.3em]"
          style={{ fontSize: "0.6rem", color: "rgba(200,160,48,0.5)" }}
        >
          Admin Dashboard
        </p>
      </div>

      {/* Gold divider */}
      <div className="admin-gold-line mx-4 mb-5" />

      {/* Nav */}
      <div className="flex-1 px-3 overflow-y-auto">
        <AdminNav onNavigate={onNavigate} />
      </div>

      {/* Gold divider */}
      <div className="admin-gold-line mx-4 mt-4" />

      {/* Admin identity — 32×32 gold-gradient avatar, real name + role label */}
      <div className="px-4 py-5 flex items-center gap-3">
        {/* Decorative initials avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                     font-barlow font-bold text-xs"
          style={{
            background: "linear-gradient(135deg, #FFE033, #C8880A)",
            color: "#1a1a18",
          }}
          aria-hidden="true"
        >
          JM
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.72rem] font-semibold font-barlow text-cream truncate">
            {adminName}
          </p>
          <p
            className="text-[0.6rem] tracking-wide font-barlow truncate"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {adminRole}
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="flex-shrink-0 transition-colors cursor-pointer
                     focus-visible:outline focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-gold"
          style={{ color: "rgba(255,255,255,0.30)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
          onMouseOut={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.30)")
          }
          aria-label="Sign out"
          title="Sign out"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── AdminShell ────────────────────────────────────────────────────────────────

/**
 * AdminShell
 *
 * Persistent layout shell for all protected admin pages.
 *
 * Desktop: fixed sidebar (w-64, #1c1a14 background).
 * Mobile:  sticky top bar with hamburger → Sheet drawer that includes an
 *          explicit ✕ close button at the top of the sidebar.
 *
 * Admin name and role are read from the Zustand store (populated at login).
 * The backend returns { id, name, email, role } — no separate display-name
 * field. Role is one of ADMIN | SUPER_ADMIN; we format it as a friendly label.
 */
export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { admin, logout } = useAdminAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  // Use the real admin name from the store; fall back to email if name is
  // somehow absent, then to an empty string. Never hardcode a person's name.
  const adminName = admin?.name || admin?.email || "";

  // Map the database role values to user-friendly labels.
  // The Admin model has role: AdminRole (ADMIN | SUPER_ADMIN) — no other
  // display-name field exists in the schema.
  const adminRole =
    admin?.role === AdminRole.SUPER_ADMIN ? "Super Admin" : "Admin";

  return (
    <div className="flex min-h-screen bg-cream">

      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside
        className="admin-sidebar hidden md:flex flex-col flex-shrink-0"
        aria-label="Admin sidebar"
      >
        {/* Desktop: no onNavigate — close button is hidden */}
        <SidebarContent
          adminName={adminName}
          adminRole={adminRole}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 bg-white
                     border-b border-charcoal/10 sticky top-0 z-30"
          style={{ boxShadow: "0 1px 12px rgba(200,160,48,0.06)" }}
        >
          {/* Hamburger → Sheet */}
          <Sheet open={mobileOpen} onOpenChange={(open) => setMobileOpen(open)}>
            <SheetTrigger
              className="w-9 h-9 flex items-center justify-center border
                         border-charcoal/15 hover:border-gold transition-colors"
              aria-label="Open navigation menu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="p-0 w-64 border-none"
              style={{ background: "#1c1a14" }}
              showCloseButton={false}
            >
              {/* Mobile: onNavigate closes drawer via setMobileOpen(false)
                  AND the SheetClose button fires Dialog.Close independently */}
              <SidebarContent
                adminName={adminName}
                adminRole={adminRole}
                onLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Centre logo — matches login/register page mobile logo:
              height 72px · aspect-ratio 690/290 · max-width 280px */}
          <Link
            href="/admin"
            aria-label="Dashboard home"
            className="focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-4 focus-visible:outline-gold"
            style={{
              display: "block",
              height: "44px",
              aspectRatio: "690/290",
              maxWidth: "220px",
            }}
          >
            <Logo className="w-full h-full" />
          </Link>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center border
                       border-charcoal/15 text-warmgray hover:border-gold
                       hover:text-gold transition-colors cursor-pointer"
            aria-label="Sign out"
            title="Sign out"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 admin-content overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
