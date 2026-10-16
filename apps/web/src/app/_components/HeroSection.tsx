import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/**
 * Full-screen hero section.
 *
 * Hero image: place /public/images/hero.jpeg to activate the background photo.
 * Until that file exists the section uses the #e8e3d8 warm-sand fallback.
 *
 * Height: calc(100vh - 4rem) so the section fills exactly the viewport area
 * below the 4rem (64px) sticky header without overlapping or leaving a gap.
 */
export function HeroSection() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden bg-hero"
      style={{ minHeight: "calc(100vh - 4rem)" }}
      aria-label="Joe Masky — hero"
    >
      {/* Background image — decorative, hidden gracefully when file is absent */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero.jpeg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-charcoal/45" aria-hidden="true" />

      {/* Gold-tint gradient at base */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(200,160,48,0.12), transparent)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-8 md:py-12 w-full max-w-3xl mx-auto">

        {/* Large logo mark */}
        <div className="reveal mb-4 md:mb-5 w-full max-w-[660px]">
          <Logo className="w-full h-auto" aria-label="Joe Masky Caps & Bags" />
        </div>

        {/* Gold divider */}
        <div
          className="reveal reveal-d1 flex items-center justify-center gap-4 mb-4 md:mb-5"
          aria-hidden="true"
        >
          <span className="h-px w-16 bg-gold opacity-70" />
          <span className="h-2 w-2 rounded-full bg-gold" />
          <span className="h-px w-16 bg-gold opacity-70" />
        </div>

        {/* Tagline */}
        <p className="reveal reveal-d2 font-cormorant italic text-cream text-[1.125rem] md:text-[1.25rem] leading-relaxed max-w-sm mb-6 md:mb-7">
          Premium fashion for those who understand that quality is the quietest form of luxury.
        </p>

        {/* CTAs */}
        <div className="reveal reveal-d3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="#shop"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.22em] uppercase text-charcoal bg-gold px-10 py-3.5 font-barlow font-medium hover:bg-goldlt transition-all duration-300 whitespace-nowrap"
          >
            Shop Now →
          </Link>
          <Link
            href="#collections"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.22em] uppercase text-cream px-10 py-3.5 font-barlow border border-cream/40 hover:border-gold hover:text-gold transition-all duration-300 whitespace-nowrap"
          >
            View Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
