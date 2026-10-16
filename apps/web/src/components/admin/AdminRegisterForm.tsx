"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { registerAdmin } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { Logo } from "@/components/layout/Logo";
import { getPasswordStrength } from "@/lib/utils";

// Zod schema — mirrors backend validation rules exactly.
// firstName + lastName are joined into a single `name` before submission.
// inviteToken is required here for immediate UX feedback; backend validates authenticity.
// termsAccepted is client-side only and is never sent to the backend.
const registerSchema = z.object({
  firstName:   z.string().trim().min(1, "First name is required."),
  lastName:    z.string().trim().min(1, "Last name is required."),
  email:       z.string().trim().min(1, "Email is required.").email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[0-9]/, "Password must include at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Password must include at least one symbol."),
  inviteToken: z.string().min(1, "Invitation token is required."),
});

type RegisterFields = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterFields | "terms", string>>;

// Eye icons for the password visibility toggle.
const EyeOpen = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeClosed = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export function AdminRegisterForm() {
  const router = useRouter();

  const [firstName,    setFirstName]    = useState("");
  const [lastName,     setLastName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [inviteToken,  setInviteToken]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formError,   setFormError]   = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading,   setIsLoading]   = useState(false);

  const strength = getPasswordStrength(password);

  function validate(): RegisterFields | null {
    if (!termsAccepted) {
      setFieldErrors((prev) => ({ ...prev, terms: "You must agree to the Terms and Privacy Policy." }));
      return null;
    }
    const result = registerSchema.safeParse({ firstName, lastName, email, password, inviteToken });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterFields;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return null;
    }
    setFieldErrors({});
    return result.data;
  }

  // Clears the field error and form banner as the user types.
  function mkClear<K extends keyof FieldErrors>(setter: React.Dispatch<React.SetStateAction<string>>, key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: undefined }));
      if (formError) setFormError("");
    };
  }

  const handleFirstNameChange   = mkClear(setFirstName,  "firstName");
  const handleLastNameChange    = mkClear(setLastName,   "lastName");
  const handleEmailChange       = mkClear(setEmail,      "email");
  const handleInviteTokenChange = mkClear(setInviteToken,"inviteToken");

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
    if (formError) setFormError("");
  }

  function handleTermsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTermsAccepted(e.target.checked);
    if (fieldErrors.terms) setFieldErrors((p) => ({ ...p, terms: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    setFormError("");
    const data = validate();
    if (!data) return;

    setIsLoading(true);
    try {
      await registerAdmin({
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        password: data.password,
        inviteToken: data.inviteToken,
      });
      // Toast persists across the client-side navigation because <Toaster>
      // lives in the root layout and is never unmounted by router.push().
      toast.success("Account created successfully! Please sign in.");
      router.push("/admin/login");
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 400: setFormError(err.message || "Please check your details and try again."); break;
          case 409: setFormError("An account with this email address already exists."); break;
          case 429: setFormError("Too many requests. Please wait a moment and try again."); break;
          default:  setFormError("Something went wrong on our end. Please try again shortly."); break;
        }
      } else {
        setFormError("Unable to connect. Check your internet connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Inline field-error paragraph, reused across all fields.
  function FieldError({ id, msg }: { id: string; msg?: string }) {
    if (!msg) return null;
    return (
      <p id={id} className="mt-1.5 font-barlow" style={{ fontSize: "0.75rem", color: "#b05c3a" }} role="alert">
        {msg}
      </p>
    );
  }

  const submitDisabled = isLoading;

  return (
    <>
      <div className="admin-accent-bar" aria-hidden="true" />

      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden">

        {/* Desktop brand panel */}
        <div
          className="admin-brand-panel hidden lg:flex flex-col items-center justify-center py-16 px-10 xl:px-14 order-2 lg:order-1"
          aria-hidden="true"
        >
          <div className="admin-corner-tl" />
          <div className="admin-corner-br" />
          <div className="admin-jm-watermark">JM</div>

          <div className="text-center select-none w-full max-w-sm mx-auto z-10">
            <Link
              href="/"
              className="reveal block mx-auto mb-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              style={{ height: "110px", aspectRatio: "690/290", maxWidth: "420px" }}
            >
              <Logo className="w-full h-full" />
            </Link>
            <div className="reveal reveal-d1 flex items-center justify-center gap-4 mb-10">
              <span className="h-px w-16 block" style={{ background: "rgba(200,160,48,0.5)" }} />
              <span className="h-2 w-2 rounded-full block" style={{ background: "#c8a030" }} />
              <span className="h-px w-16 block" style={{ background: "rgba(200,160,48,0.5)" }} />
            </div>
            <p className="reveal reveal-d2 font-cormorant italic leading-relaxed" style={{ color: "rgba(245,242,236,0.75)", fontSize: "1.15rem", lineHeight: "1.65" }}>
              &ldquo;Join a community that dresses with intention. Your wardrobe, your story.&rdquo;
            </p>
            <p className="reveal reveal-d3 mt-4 font-barlow uppercase" style={{ color: "var(--warmgray)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>
              — Joe Masky, Lagos
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="admin-form-panel flex items-center justify-center px-6 py-12 sm:px-10 md:px-16 order-1 lg:order-2">
          <div className="admin-form-inner w-full max-w-md">

            {/* Mobile logo — inline SVG uses suffix-RM gradient IDs to avoid
                clashing with the desktop panel's IDs when both are in the DOM. */}
            <div className="flex flex-col items-center lg:hidden mb-8 text-center">
              <Link
                href="/"
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                style={{ display: "block", height: "72px", width: "auto", aspectRatio: "690/290", maxWidth: "280px" }}
                aria-label="Joe Masky — back to homepage"
              >
                <svg width="100%" height="100%" viewBox="0 0 690 290" role="img" aria-label="Joe Masky Caps & Bags" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gTopRM" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#FFFDE8" /><stop offset="12%"  stopColor="#FFE033" />
                      <stop offset="40%"  stopColor="#C8880A" /><stop offset="62%"  stopColor="#F5C000" />
                      <stop offset="80%"  stopColor="#B07000" /><stop offset="100%" stopColor="#7A5000" />
                    </linearGradient>
                    <linearGradient id="gSubRM" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#FFF8C0" /><stop offset="30%"  stopColor="#E8AA00" />
                      <stop offset="65%"  stopColor="#C08000" /><stop offset="100%" stopColor="#7A5000" />
                    </linearGradient>
                    <linearGradient id="embGRM" x1="20%" y1="5%" x2="80%" y2="95%">
                      <stop offset="0%"   stopColor="#FFF5A0" /><stop offset="35%"  stopColor="#F5C000" />
                      <stop offset="70%"  stopColor="#B07800" /><stop offset="100%" stopColor="#7A5200" />
                    </linearGradient>
                    <linearGradient id="mGRM" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#FFFFFF" /><stop offset="45%"  stopColor="#FFFFF8" />
                      <stop offset="100%" stopColor="#C8A800" />
                    </linearGradient>
                    <radialGradient id="haloRM" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="50%"  stopColor="#FFFDE0" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FFE000" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="340" cy="128" rx="95" ry="95" fill="url(#haloRM)" />
                  <ellipse cx="340" cy="128" rx="72" ry="72" fill="#FFFDE8" opacity="0.3" />
                  <circle cx="340" cy="128" r="68" fill="url(#embGRM)" />
                  <circle cx="340" cy="128" r="68" fill="none" stroke="#E0B020" strokeWidth="1.5" />
                  <circle cx="340" cy="128" r="63" fill="none" stroke="#FFF0A0" strokeWidth="0.6" opacity="0.5" />
                  <path d="M303,178 L303,90 L340,155 L377,90 L377,178 L362,178 L362,122 L340,162 L318,122 L318,178 Z" fill="url(#mGRM)" stroke="#C09000" strokeWidth="0.7" />
                  <text x="95"  y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTopRM)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">JOE</text>
                  <text x="412" y="167" fontFamily="'Times New Roman', Georgia, serif" fontSize="96" fontWeight="900" fontStyle="italic" fill="url(#gTopRM)" stroke="#8A6000" strokeWidth="0.4" letterSpacing="-1">asky</text>
                  <circle cx="218" cy="198" r="4.5" fill="url(#gSubRM)" />
                  <text x="232" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSubRM)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">CAPS</text>
                  <text x="338" y="212" fontFamily="'Times New Roman', serif" fontSize="22" fontStyle="italic" fontWeight="700" fill="url(#gSubRM)" stroke="#8A6000" strokeWidth="0.3" textAnchor="middle">&amp;</text>
                  <text x="358" y="212" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="900" fill="url(#gSubRM)" stroke="#8A6000" strokeWidth="0.3" letterSpacing="5">BAGS</text>
                  <circle cx="468" cy="198" r="4.5" fill="url(#gSubRM)" />
                  <text x="477" y="208" fontFamily="Arial" fontSize="13" fontWeight="700" fill="url(#gSubRM)">®</text>
                </svg>
              </Link>
            </div>

            <p className="font-barlow uppercase mb-2" style={{ color: "var(--gold)", fontSize: "0.7rem", letterSpacing: "0.3em" }}>
              Get Started
            </p>
            <h1 className="font-cormorant text-charcoal font-semibold leading-tight mb-1" style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}>
              Create Account
            </h1>
            <p className="font-barlow font-light mb-7" style={{ fontSize: "0.875rem", color: "#7a776f" }}>
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="font-normal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                style={{ color: "var(--gold)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#a07820")}
                onMouseOut={(e)  => (e.currentTarget.style.color = "var(--gold)")}
              >
                Sign in
              </Link>
            </p>

            {formError && (
              <div
                className="px-4 py-3 text-sm mb-5 font-barlow"
                style={{ background: "rgba(176,92,58,0.1)", border: "1px solid rgba(176,92,58,0.3)", color: "#b05c3a" }}
                role="alert"
                aria-live="polite"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-first-name" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                    First Name
                  </label>
                  <input
                    type="text" id="reg-first-name" name="firstName" value={firstName}
                    onChange={handleFirstNameChange} required disabled={isLoading}
                    autoComplete="given-name" placeholder="Joe"
                    aria-describedby={fieldErrors.firstName ? "first-name-error" : undefined}
                    aria-invalid={!!fieldErrors.firstName} className="admin-login-input"
                    style={fieldErrors.firstName ? { borderColor: "#b05c3a" } : undefined}
                  />
                  <FieldError id="first-name-error" msg={fieldErrors.firstName} />
                </div>
                <div>
                  <label htmlFor="reg-last-name" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                    Last Name
                  </label>
                  <input
                    type="text" id="reg-last-name" name="lastName" value={lastName}
                    onChange={handleLastNameChange} required disabled={isLoading}
                    autoComplete="family-name" placeholder="Masky"
                    aria-describedby={fieldErrors.lastName ? "last-name-error" : undefined}
                    aria-invalid={!!fieldErrors.lastName} className="admin-login-input"
                    style={fieldErrors.lastName ? { borderColor: "#b05c3a" } : undefined}
                  />
                  <FieldError id="last-name-error" msg={fieldErrors.lastName} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                  Email Address
                </label>
                <input
                  type="email" id="reg-email" name="email" value={email}
                  onChange={handleEmailChange} required disabled={isLoading}
                  autoComplete="email" placeholder="admin@joemasky.com"
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  aria-invalid={!!fieldErrors.email} className="admin-login-input"
                  style={fieldErrors.email ? { borderColor: "#b05c3a" } : undefined}
                />
                <FieldError id="email-error" msg={fieldErrors.email} />
              </div>

              {/* Password + strength indicator */}
              <div>
                <label htmlFor="reg-password" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} id="reg-password" name="password"
                    value={password} onChange={handlePasswordChange} required disabled={isLoading}
                    autoComplete="new-password" placeholder="••••••••"
                    aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
                    aria-invalid={!!fieldErrors.password} className="admin-login-input"
                    style={{ paddingRight: "3rem", ...(fieldErrors.password ? { borderColor: "#b05c3a" } : {}) }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    style={{ color: "var(--warmgray)" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
                    onMouseOut={(e)  => (e.currentTarget.style.color = "var(--warmgray)")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword} disabled={isLoading}
                  >
                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                <div aria-hidden="true" style={{ height: "3px", borderRadius: "2px", background: "rgba(26,26,24,0.08)", overflow: "hidden", marginTop: "0.5rem" }}>
                  <div style={{ height: "100%", borderRadius: "2px", width: strength ? strength.pct : "0%", background: strength ? strength.color : "transparent", transition: "width 0.3s ease, background 0.3s ease" }} />
                </div>
                {strength && !fieldErrors.password && (
                  <p id="password-hint" className="font-barlow tracking-wide mt-1" style={{ fontSize: "0.65rem", color: strength.color }} aria-live="polite">
                    {strength.label}
                  </p>
                )}
                {!strength && !fieldErrors.password && (
                  <p id="password-hint" className="mt-1 font-barlow" style={{ fontSize: "0.72rem", color: "var(--warmgray)" }}>
                    Min. 8 characters with uppercase, lowercase, number, and symbol.
                  </p>
                )}
                <FieldError id="password-error" msg={fieldErrors.password} />
              </div>

              {/* Invitation Token — backend validates authenticity, expiry, and usage */}
              <div>
                <label htmlFor="reg-invite-token" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                  Invitation Token
                </label>
                <input
                  type="text" id="reg-invite-token" name="inviteToken" value={inviteToken}
                  onChange={handleInviteTokenChange} required disabled={isLoading}
                  autoComplete="off" spellCheck={false} placeholder="Paste your invitation token"
                  aria-describedby={fieldErrors.inviteToken ? "invite-token-error" : "invite-token-hint"}
                  aria-invalid={!!fieldErrors.inviteToken} className="admin-login-input"
                  style={fieldErrors.inviteToken ? { borderColor: "#b05c3a" } : undefined}
                />
                {!fieldErrors.inviteToken && (
                  <p id="invite-token-hint" className="mt-1.5 font-barlow" style={{ fontSize: "0.72rem", color: "var(--warmgray)" }}>
                    Provided by the shop owner. Check your email or message.
                  </p>
                )}
                <FieldError id="invite-token-error" msg={fieldErrors.inviteToken} />
              </div>

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox" id="reg-terms" name="terms" checked={termsAccepted}
                    onChange={handleTermsChange} disabled={isLoading}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 cursor-pointer"
                    style={{ accentColor: "var(--gold)" }}
                    aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
                    aria-invalid={!!fieldErrors.terms}
                  />
                  <span className="font-barlow font-light leading-relaxed" style={{ fontSize: "0.875rem", color: "#7a776f" }}>
                    I agree to the{" "}
                    <span style={{ color: "var(--gold)" }}>Terms of Use</span>
                    {" "}and{" "}
                    <span style={{ color: "var(--gold)" }}>Privacy Policy</span>
                  </span>
                </label>
                <FieldError id="terms-error" msg={fieldErrors.terms} />
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={submitDisabled}
                className="admin-login-btn w-full font-barlow font-medium uppercase transition-all duration-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--charcoal)", color: "var(--cream)", fontSize: "0.78rem", letterSpacing: "0.22em", padding: "1rem", marginTop: "0.25rem", border: "none", borderRadius: "4px" }}
                onMouseOver={(e) => { if (!submitDisabled) { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--charcoal)"; } }}
                onMouseOut={(e)  => { e.currentTarget.style.background = "var(--charcoal)"; e.currentTarget.style.color = "var(--cream)"; }}
              >
                {isLoading ? "Creating account…" : "Create Account"}
              </button>

            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="font-barlow uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseOut={(e)  => (e.currentTarget.style.color = "var(--warmgray)")}
              >
                ← Back to Store
              </Link>
            </div>

            <p className="font-barlow text-center mt-4" style={{ fontSize: "0.7rem", color: "#7a776f" }}>
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                style={{ color: "var(--gold)" }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={(e)  => (e.currentTarget.style.textDecoration = "none")}
              >
                Sign in here
              </Link>
            </p>

          </div>
        </div>

      </section>
    </>
  );
}
