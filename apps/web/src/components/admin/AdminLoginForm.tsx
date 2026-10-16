"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { loginAdmin } from "@/lib/api/admin";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { ApiError } from "@/lib/api/client";
import { Logo } from "@/components/layout/Logo";

// ---------------------------------------------------------------------------
// Validation schema
//
// Login rules are deliberately minimal: the backend enforces no password
// complexity on login (only on registration). We validate:
//   - email: required, trimmed, valid format
//   - password: required, non-whitespace-only
// We do NOT trim or modify the password before sending — the user must type
// the exact password they registered with.
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .refine((v) => v.trim().length > 0, "Password cannot be blank."),
});

type LoginFields = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginFields, string>>;

/**
 * AdminLoginForm
 *
 * Owns the full admin login page layout — two-column on desktop
 * (brand panel + form panel), single-column on mobile.
 *
 * Authenticates against POST /login/admin.
 * Handles invalid credentials, frozen/inactive accounts (401),
 * validation errors (400), network failures, and server errors.
 * Stores JWT in sessionStorage via the admin auth store.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const login = useAdminAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Top-level API/network error banner
  const [formError, setFormError] = useState("");
  // Per-field inline errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [isLoading, setIsLoading] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  /**
   * Validates the form and returns the parsed data on success,
   * or null and sets field errors on failure.
   */
  function validate(): LoginFields | null {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFields;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return null;
    }

    setFieldErrors({});
    return result.data;
  }

  // ── Change handlers — clear the relevant field error as the user types ──────

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    // Also clear the form-level error so it doesn't persist stale state
    if (formError) setFormError("");
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (formError) setFormError("");
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Guard: prevent duplicate submissions
    if (isLoading) return;

    setFormError("");

    const data = validate();
    if (!data) return; // field errors already set

    setIsLoading(true);

    try {
      // Send the trimmed email but the ORIGINAL password (no trimming).
      const response = await loginAdmin({ email: data.email, password });
      login(response.admin, response.token);

      // Show the success toast, then navigate after a short pause so the
      // user sees confirmation before the page changes.
      toast.success("Login successful! Welcome back.");
      setTimeout(() => router.push("/admin"), 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 400:
            // Backend rejected the input — surface backend message or fallback
            setFormError(err.message || "Please check your input and try again.");
            break;
          case 401:
            // Wrong credentials or inactive account.
            // The backend intentionally returns the same message for both to
            // avoid account enumeration — we respect that here.
            setFormError("Invalid email or password.");
            break;
          case 429:
            setFormError("Too many login attempts. Please wait a moment and try again.");
            break;
          case 500:
          default:
            // Never surface raw server errors or stack traces
            setFormError("Something went wrong on our end. Please try again shortly.");
            break;
        }
      } else {
        // fetch() rejected — network unreachable, DNS failure, etc.
        setFormError("Unable to connect. Check your internet connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  // The submit button is only disabled while a login request is in flight
  // to prevent duplicate submissions. Empty / invalid fields are reported
  // by inline validation when the user submits, not by disabling the button.
  const submitDisabled = isLoading;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Gold accent bar */}
      <div className="admin-accent-bar" aria-hidden="true" />

      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden overflow-y-auto">

        {/* ── LEFT: Brand panel ──────────────────────────────── */}
        <div
          className="admin-brand-panel hidden lg:flex flex-col items-center justify-center py-16 px-10 xl:px-14 order-2 lg:order-1"
          aria-hidden="true"
        >
          {/* Corner brackets */}
          <div className="admin-corner-tl" />
          <div className="admin-corner-br" />

          {/* JM watermark */}
          <div className="admin-jm-watermark">JM</div>

          <div className="text-center select-none w-full max-w-sm mx-auto z-10">

            {/* Brand logo — links to storefront */}
            <Link
              href="/"
              className="reveal block mx-auto mb-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              style={{ height: "110px", aspectRatio: "690/290", maxWidth: "420px" }}
            >
              <Logo className="w-full h-full" />
            </Link>

            {/* Decorative divider */}
            <div className="reveal reveal-d1 flex items-center justify-center gap-4 mb-10">
              <span className="h-px w-16 block" style={{ background: "rgba(200,160,48,0.5)" }} />
              <span className="h-2 w-2 rounded-full block" style={{ background: "#c8a030" }} />
              <span className="h-px w-16 block" style={{ background: "rgba(200,160,48,0.5)" }} />
            </div>

            {/* Brand quote */}
            <p
              className="reveal reveal-d2 font-cormorant italic leading-relaxed"
              style={{ color: "rgba(245,242,236,0.75)", fontSize: "1.15rem", lineHeight: "1.65" }}
            >
              &ldquo;Dressed in gold. Built to last. Welcome back to where style lives.&rdquo;
            </p>

          </div>
        </div>

        {/* ── RIGHT: Form panel ──────────────────────────────── */}
        <div className="admin-form-panel flex items-center justify-center px-6 py-14 sm:px-10 md:px-16 order-1 lg:order-2">
          <div className="admin-form-inner w-full max-w-md">

            {/* Mobile-only logo
                Uses an inline SVG with mobile-scoped gradient IDs (suffix M)
                so they never clash with the desktop brand panel's SVG IDs,
                which share the same DOM when both are rendered during hydration.
                Container matches the reference exactly:
                  height 72px · aspect-ratio 690/290 · max-width 280px.
                The wrapping <Link> keeps the whole mark clickable (→ /). */}
            <div className="flex flex-col items-center lg:hidden mb-10 text-center">
              <Link
                href="/"
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                style={{ display: "block", height: "72px", width: "auto", aspectRatio: "690/290", maxWidth: "280px" }}
                aria-label="Joe Masky — back to homepage"
              >
                <svg width="100%" height="100%" viewBox="0 0 690 290" role="img" aria-label="Joe Masky Caps & Bags" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gTopM" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#FFFDE8" />
                      <stop offset="12%"  stopColor="#FFE033" />
                      <stop offset="40%"  stopColor="#C8880A" />
                      <stop offset="62%"  stopColor="#F5C000" />
                      <stop offset="80%"  stopColor="#B07000" />
                      <stop offset="100%" stopColor="#7A5000" />
                    </linearGradient>
                    <linearGradient id="gSubM" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#FFF8C0" />
                      <stop offset="30%"  stopColor="#E8AA00" />
                      <stop offset="65%"  stopColor="#C08000" />
                      <stop offset="100%" stopColor="#7A5000" />
                    </linearGradient>
                    <linearGradient id="embGM" x1="20%" y1="5%" x2="80%" y2="95%">
                      <stop offset="0%"   stopColor="#FFF5A0" />
                      <stop offset="35%"  stopColor="#F5C000" />
                      <stop offset="70%"  stopColor="#B07800" />
                      <stop offset="100%" stopColor="#7A5200" />
                    </linearGradient>
                    <linearGradient id="mGM" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#FFFFFF" />
                      <stop offset="45%"  stopColor="#FFFFF8" />
                      <stop offset="100%" stopColor="#C8A800" />
                    </linearGradient>
                    <radialGradient id="haloM" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="50%"  stopColor="#FFFDE0" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FFE000" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="340" cy="128" rx="95" ry="95" fill="url(#haloM)" />
                  <ellipse cx="340" cy="128" rx="72" ry="72" fill="#FFFDE8" opacity="0.3" />
                  <circle cx="340" cy="128" r="68" fill="url(#embGM)" />
                  <circle cx="340" cy="128" r="68" fill="none" stroke="#E0B020" strokeWidth="1.5" />
                  <circle cx="340" cy="128" r="63" fill="none" stroke="#FFF0A0" strokeWidth="0.6" opacity="0.5" />
                  <path
                    d="M303,178 L303,90 L340,155 L377,90 L377,178 L362,178 L362,122 L340,162 L318,122 L318,178 Z"
                    fill="url(#mGM)"
                    stroke="#C09000"
                    strokeWidth="0.7"
                  />
                  <text x="95" y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTopM)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">JOE</text>
                  <text x="412" y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTopM)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">asky</text>
                  <circle cx="218" cy="198" r="4.5" fill="url(#gSubM)" />
                  <text x="232" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSubM)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">CAPS</text>
                  <text x="338" y="212" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic" fontWeight="700" fill="url(#gSubM)" stroke="#8A6000" strokeWidth="0.3" textAnchor="middle">&amp;</text>
                  <text x="358" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSubM)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">BAGS</text>
                  <circle cx="468" cy="198" r="4.5" fill="url(#gSubM)" />
                  <text x="477" y="208" fontFamily="Arial" fontSize="13" fontWeight="700" fill="url(#gSubM)">®</text>
                </svg>
              </Link>
            </div>

            {/* Heading */}
            <p
              className="font-barlow uppercase mb-2"
              style={{ color: "var(--gold)", fontSize: "0.7rem", letterSpacing: "0.3em" }}
            >
              Welcome Back
            </p>
            <h1
              className="font-cormorant text-charcoal font-semibold leading-tight mb-7"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
            >
              Sign In
            </h1>

            {/* Form-level error banner (API / network errors) */}
            {formError && (
              <div
                className="px-4 py-3 text-sm mb-5 font-barlow"
                style={{
                  background: "rgba(176,92,58,0.1)",
                  border: "1px solid rgba(176,92,58,0.3)",
                  color: "#b05c3a",
                }}
                role="alert"
                aria-live="polite"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* ── Email ── */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block font-barlow uppercase mb-1.5"
                  style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  placeholder="admin@joemasky.com"
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  aria-invalid={!!fieldErrors.email}
                  className="admin-login-input"
                  style={fieldErrors.email ? { borderColor: "#b05c3a" } : undefined}
                />
                {fieldErrors.email && (
                  <p
                    id="email-error"
                    className="mt-1.5 font-barlow"
                    style={{ fontSize: "0.75rem", color: "#b05c3a" }}
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* ── Password ── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block font-barlow uppercase"
                    style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    aria-invalid={!!fieldErrors.password}
                    className="admin-login-input"
                    style={{
                      paddingRight: "3rem",
                      ...(fieldErrors.password ? { borderColor: "#b05c3a" } : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    style={{ color: "var(--warmgray)" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--warmgray)")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 font-barlow"
                    style={{ fontSize: "0.75rem", color: "#b05c3a" }}
                    role="alert"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={submitDisabled}
                className="admin-login-btn w-full font-barlow font-medium uppercase transition-all duration-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--charcoal)",
                  color: "var(--cream)",
                  fontSize: "0.78rem",
                  letterSpacing: "0.22em",
                  padding: "1rem",
                  marginTop: "0.25rem",
                  border: "none",
                  borderRadius: "4px",
                }}
                onMouseOver={(e) => {
                  if (!submitDisabled) {
                    e.currentTarget.style.background = "var(--gold)";
                    e.currentTarget.style.color = "var(--charcoal)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--charcoal)";
                  e.currentTarget.style.color = "var(--cream)";
                }}
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              {/* Registration requires an invite token from a super-admin.
                  The link carries no token here — the invitee follows the
                  URL they received, which includes ?token=… */}
              <p
                className="text-center font-barlow font-light"
                style={{ fontSize: "0.875rem", color: "#7a776f" }}
              >
                New to Joe Masky?{" "}
                <Link
                  href="/admin/register"
                  className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  style={{ color: "var(--gold)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--gold)")}
                >
                  Create an account
                </Link>
              </p>

            </form>

            {/* Back to store */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="font-barlow uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--warmgray)")}
              >
                ← Back to Store
              </Link>
            </div>

          </div>
        </div>

      </section>
    </>
  );
}
