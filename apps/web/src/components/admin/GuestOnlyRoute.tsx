"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * GuestOnlyRoute
 *
 * The inverse of ProtectedAdminRoute. Guards the login and registration pages
 * so that an already-authenticated admin cannot remain on or access them.
 *
 * ── Behaviour ────────────────────────────────────────────────────────────────
 *
 * After the auth store hydrates:
 *   • If the visitor is an authenticated admin → redirect to the page they
 *     were previously viewing. When no previous page exists (e.g. the login
 *     URL was opened in a new tab), fall back to the homepage (`/`).
 *   • If the visitor is unauthenticated → render the children (the login or
 *     registration form) so they can sign in or register with an invite token.
 *
 * ── Hydration-safe design ────────────────────────────────────────────────────
 *
 * Mirrors ProtectedAdminRoute: `hasHydrated` starts as `false` on both the
 * server and the client's first render, so identical markup (a neutral
 * loading spinner) is produced everywhere. After mount, the effect checks
 * whether the store is already hydrated (client-side navigation) or waits
 * for `onFinishHydration`. Only then is the auth state evaluated.
 *
 * This avoids hydration mismatches that would occur if we read
 * sessionStorage-backed state during the first render.
 */
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const token = useAdminAuthStore((s) => s.token);

  // Always start as false — identical on server and client first render.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Check synchronously in case the store is already hydrated
    // (client-side navigation where this component was never unmounted).
    if (useAdminAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    // Not yet hydrated — subscribe and wait.
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsub;
  }, []); // empty deps: runs once on mount, cleans up on unmount

  // ── First render (server + client) and while awaiting hydration ──────────
  // Render a neutral, branded loading screen. No auth decision is made here.
  if (!hasHydrated) {
    return <LoadingSpinner />;
  }

  // ── Post-hydration: store state is now reliable ───────────────────────────
  if (isAuthenticated && token) {
    return <RedirectAway />;
  }

  return <>{children}</>;
}

// ── RedirectAway ─────────────────────────────────────────────────────────────
// Rendered only when a definitively authenticated state is confirmed after
// hydration. Reads the `from` query parameter (set by ProtectedAdminRoute and
// useAdminClient when redirecting to login), validates it as a safe internal
// path, and sends the admin back there. Falls back to the homepage when the
// param is absent, external, or unsafe.

function RedirectAway() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    router.replace(getSafeReturnPath(from));
  }, [router]);

  // Invisible while the redirect effect fires — same spinner as the
  // hydration-pending state so there is no visible text flash.
  return <LoadingSpinner />;
}

// ── getSafeReturnPath ─────────────────────────────────────────────────────────
// Validates a `from` query parameter and returns a safe internal path, or
// "/" when the value is absent, external, or unsafe.
//
// Security: the History API does not expose the URLs of session-history
// entries, so we cannot rely on router.back() to guarantee an internal
// destination. Instead, the redirect sources (ProtectedAdminRoute and
// useAdminClient) pass the current pathname as ?from=<path>, and we validate
// it here before navigating.
//
//   • null/empty            → "/"   (no return path available)
//   • absolute external URL → "/"   (new URL() parses it; origin mismatch)
//   • protocol-relative    → "/"   (//evil.com → origin mismatch)
//   • javascript:/data:    → "/"   (non-http protocol rejected)
//   • login/register page   → "/"   (prevents redirect loops)
//   • valid internal path   → the path (pathname + search + hash)

function getSafeReturnPath(from: string | null): string {
  if (!from) return "/";

  try {
    // Parse relative to the current origin. Absolute URLs (https://evil.com)
    // take precedence over the base, so their origin won't match and will be
    // rejected. Protocol-relative URLs (//evil.com) resolve to evil.com's
    // origin and are also rejected.
    const url = new URL(from, window.location.origin);

    // Reject external origins — also catches protocol-relative and
    // non-http(s) schemes (javascript:, data:, etc.).
    if (url.origin !== window.location.origin) return "/";
    if (url.protocol !== "http:" && url.protocol !== "https:") return "/";

    // Reject the login and register pages themselves to prevent loops.
    if (url.pathname === "/admin/login" || url.pathname === "/admin/register") {
      return "/";
    }

    // Return the full path including query string and hash fragment.
    return url.pathname + url.search + url.hash;
  } catch {
    // Invalid URL — reject.
    return "/";
  }
}

// ── LoadingSpinner ───────────────────────────────────────────────────────────
// Shared neutral loading UI, visually consistent with ProtectedAdminRoute.

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 border-2 border-charcoal/20 border-t-gold rounded-full animate-spin" />
        <p className="text-warmgray font-barlow text-sm tracking-wide">
          Loading…
        </p>
      </div>
    </div>
  );
}
