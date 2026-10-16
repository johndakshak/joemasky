"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HeroSection } from "./_components/HeroSection";
import { MarqueeBar } from "./_components/MarqueeBar";
import { CategoryProductSections } from "./_components/CategoryProductSections";
import { EditorialCollection } from "./_components/EditorialCollection";
import { BrandStory } from "./_components/BrandStory";

/**
 * Homepage / landing page.
 *
 * Section order:
 *   HeroSection              — full-screen hero
 *   MarqueeBar               — scrolling text strip
 *   CategoryProductSections  — one grid per backend category (#shop anchor on first)
 *   EditorialCollection      — asymmetric 1+2 editorial grid (#collections)
 *   BrandStory               — split image/text panel (#about)
 *   Footer                   — rendered by layout.tsx (#contact via footer id)
 *
 * The newsletter section has been omitted — it has no subscription backend
 * and displaying it would imply functionality that does not exist.
 */
export default function HomePage() {
  // Progressive-enhancement scroll reveal.
  // Content is always visible; animations activate only when
  // IntersectionObserver is available.
  useScrollReveal();

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <MarqueeBar />
      <CategoryProductSections />
      <EditorialCollection />
      <BrandStory />
    </main>
  );
}
