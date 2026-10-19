"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedAdminRoute
 *
 * Guards all routes nested under app/admin/(protected)/.
 *
 * ── Hydration-safe design ────────────────────────────────────────────────────
 *
 * Problem: Zustand's persist middleware reads sessionStorage, which only
 * exists in the browser. On the server the store always holds its default
 * values (isAuthenticated: false, token: null). If we made any auth decision
 * on the first render we would either:
 *   a) always redirect on the server (wrong — server has no session), or
 *   b) use browser state on first render and cause a hydration mismatch
 *      because the server HTML differs from the client's initial render tree.
 *
 * Solution: always render the same neutral loading UI on the first pass
 * (server AND client first render). `hasHydrated` starts as `false` — a
 * plain literal, not a lazy initialiser that calls browser APIs. After the
 * component mounts (client only), the useEffect checks whether the store is
 * already hydrated (client-side navigation where the layout was never
 * unmounted) or subscribes to onFinishHydration to learn when it is ready.
 * Only once `hasHydrated` flips to `true` does the component evaluate the
 * actual auth state and either render the protected content or redirect.
 *
 * ── Why the lazy initialiser was wrong ───────────────────────────────────────
 *
 * The previous version used:
 *   useState(() => useAdminAuthStore.persist.hasHydrated())
 *
 * `hasHydrated()` returns false on the server and may return true on the
 * client depending on timing. This caused the server to render the spinner
 * while the client's first render rendered RedirectToLogin (or children),
 * producing a React hydration mismatch error.
 *
 * The fix is to always start with false. Both server and client render the
 * spinner. After mount, the effect sets the real value. No mismatch.
 *
 * ── Normal client-side navigation ────────────────────────────────────────────
 *
 * When navigating between protected pages (e.g. /admin → /admin/orders) the
 * (protected)/layout.tsx is NOT remounted — Next.js keeps shared layouts
 * mounted. hasHydrated was already set to true on the initial load, so the
 * useEffect no-ops and children render immediately with no flicker.
 *
 * ── 401 handling ─────────────────────────────────────────────────────────────
 *
 * When an API call returns 401, useAdminClient calls logout() and
 * router.push("/admin/login") directly, clearing isAuthenticated/token.
 * On the next render (after hydration is long complete) !isAuthenticated
 * causes RedirectToLogin to be returned and the user is sent to the login page.
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, token, logout } = useAdminAuthStore();

  // Always start as false — identical on server and client first render.
  // This is the key fix for the hydration mismatch.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Check synchronously in case the store is already hydrated
    // (client-side navigation where this layout was never unmounted).
    if (useAdminAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    // Not yet hydrated — subscribe and wait.
    // onFinishHydration returns an unsubscribe cleanup function.
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsub;
  }, []); // empty deps: runs once on mount, cleans up on unmount

  // ── First render (server + client) and while awaiting hydration ──────────
  // Render a neutral, branded loading screen. No auth decision is made here.
  if (!hasHydrated) {
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

  // ── Post-hydration: store state is now reliable ───────────────────────────
  if (!isAuthenticated || !token) {
    return <RedirectToLogin logout={logout} />;
  }

  return <>{children}</>;
}

// ── RedirectToLogin ───────────────────────────────────────────────────────────
// Rendered only when a definitively unauthenticated state is confirmed after
// hydration. Isolating router.push into a useEffect keeps the render cycle
// clean and avoids calling navigation imperatively during render.
//
// Passes the current pathname as ?from= so GuestOnlyRoute can redirect the
// admin back here after they re-authenticate.

function RedirectToLogin({ logout }: { logout: () => void }) {
  const router = useRouter();

  useEffect(() => {
    logout();
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const loginUrl = `/admin/login?from=${encodeURIComponent(currentPath)}`;
    router.push(loginUrl);
  }, [logout, router]);

  // Invisible while the redirect effect fires — same spinner as the
  // hydration-pending state so there is no visible text flash.
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-charcoal/20 border-t-gold rounded-full animate-spin" />
    </div>
  );
}
