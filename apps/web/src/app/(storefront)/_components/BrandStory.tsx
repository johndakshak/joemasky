import Link from "next/link";

/**
 * Brand story / philosophy split section.
 *
 * Image panel: place /public/images/brand-story.jpeg to replace the warm-sand
 * colour fallback. No code change is needed — the img's onError handler hides
 * the broken image and the bg-hero colour is always visible beneath it.
 *
 * Statistics (500+, 12 years, 98%) from the reference HTML are fabricated
 * marketing copy and have been omitted per the implementation brief.
 */
export function BrandStory() {
  return (
    <section
      id="about"
      className="grid grid-cols-1 md:grid-cols-2 md:min-h-[70vh] md:mx-14 mx-4 my-12 md:my-16"
    >
      {/* Image panel */}
      <div className="relative overflow-hidden bg-hero min-h-[55vw] md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand-story.jpeg"
          alt="Joe Masky store and craftsmanship"
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Text panel */}
      <div className="flex flex-col justify-center px-6 md:pl-14 md:pr-14 py-12 md:py-20">
        <p className="reveal text-[0.65rem] tracking-[0.35em] uppercase text-gold mb-5 font-barlow">
          Our Philosophy
        </p>

        <h2 className="reveal reveal-d1 font-bebas text-[clamp(2rem,4vw,3.8rem)] leading-[1.05] text-charcoal mb-6">
          Our Approach<br />to Fashion &amp; Craft
        </h2>

        <p className="reveal reveal-d2 text-warmgray text-[0.88rem] leading-[1.85] max-w-md mb-8">
          Joe Masky is built on a single belief — that everyone deserves to wear
          something that makes them feel extraordinary. Every cap and bag leaves our
          hands carrying that same quiet intention: quality you can feel, style you
          can own.
        </p>

        <div className="reveal reveal-d3">
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 text-[0.72rem] tracking-[0.22em] uppercase text-cream bg-charcoal px-10 py-4 hover:bg-gold hover:text-charcoal transition-all duration-300 w-fit font-barlow"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
