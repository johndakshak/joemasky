"use client";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { LandingProductCard } from "./LandingProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import Link from "next/link";

const DELAY_CLASSES = ["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4"] as const;

/**
 * Renders one product grid section per backend category.
 *
 * Ordering: categories are sorted by `createdAt` ascending so the order is
 * stable and matches the order they were created in the admin panel.
 * No ordering field exists on the Category type beyond `createdAt` and `id`,
 * so createdAt-ascending is the most semantically meaningful stable sort.
 *
 * Sections with no products for their category are skipped entirely rather
 * than showing an empty state — the page only shows populated categories.
 *
 * The first section receives id="shop" for the hero's "Shop Now" anchor link.
 */
export function CategoryProductSections() {
  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
  } = useProducts();

  const {
    data: categories,
    isPending: categoriesPending,
    isError: categoriesError,
  } = useCategories();

  // Show skeleton only while the very first fetch is in-flight (no data yet).
  // isPending = true only when there is no cached data — background refetches
  // while data is already available do not trigger the skeleton.
  const showSkeleton = productsPending || categoriesPending;

  // Sort categories by createdAt ascending for stable, consistent ordering.
  const sortedCategories = categories
    ? [...categories].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];

  if (showSkeleton) {
    return (
      <>
        {/* Render two skeleton sections while loading */}
        {[0, 1].map((s) => (
          <section
            key={s}
            id={s === 0 ? "shop" : undefined}
            className={`px-4 sm:px-6 md:px-14 py-16 md:py-20 ${s % 2 !== 0 ? "bg-archive" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
              <div className="h-10 w-48 bg-charcoal/10 animate-pulse" />
              <div className="h-3 w-24 bg-charcoal/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ))}
      </>
    );
  }

  if (productsError || categoriesError) {
    return (
      <section id="shop" className="px-4 sm:px-6 md:px-14 py-16 md:py-20">
        <p className="text-warmgray text-sm py-8 text-center font-barlow">
          Products could not be loaded. Please try again later.
        </p>
        <div className="flex justify-center mt-4">
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 text-[0.72rem] tracking-[0.22em] uppercase text-charcoal px-10 py-[0.9rem] border border-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300 font-barlow"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    );
  }

  if (!products || !categories || sortedCategories.length === 0) {
    return (
      <section id="shop" className="px-4 sm:px-6 md:px-14 py-16 md:py-20">
        <p className="text-warmgray text-sm py-8 text-center font-barlow">
          No products available yet.
        </p>
      </section>
    );
  }

  // Build per-category product lists. Skip categories that have no products.
  // No artificial limit — the grid wraps rows automatically and the backend
  // returns all products. Previously .slice(0, 4) capped each category at 4
  // products, hiding valid products (e.g. Jerseys had 7 but only 4 showed).
  const sections = sortedCategories
    .map((category) => ({
      category,
      products: products.filter((p) => p.categoryId === category.id),
    }))
    .filter((s) => s.products.length > 0);

  if (sections.length === 0) {
    return (
      <section id="shop" className="px-4 sm:px-6 md:px-14 py-16 md:py-20">
        <p className="text-warmgray text-sm py-8 text-center font-barlow">
          No products available yet.
        </p>
      </section>
    );
  }

  return (
    <>
      {sections.map(({ category, products: catProducts }, sectionIndex) => {
        // Alternate cream / archive backgrounds for visual rhythm.
        const bgClass = sectionIndex % 2 !== 0 ? "bg-archive" : "";
        // Section number label: 01, 02, 03 …
        const number = String(sectionIndex + 1).padStart(2, "0");
        const label = `${number} / ${category.name}`;

        return (
          <section
            key={category.id}
            // First section gets the #shop anchor; subsequent categories get
            // their own slugified anchor for deep-linking.
            id={sectionIndex === 0 ? "shop" : `category-${category.id}`}
            className={`px-4 sm:px-6 md:px-14 py-16 md:py-20 ${bgClass}`}
          >
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
              <h2 className="font-bebas text-[clamp(2rem,5vw,4rem)] tracking-[0.04em] leading-none">
                {category.name}
              </h2>
              <span className="text-[0.65rem] tracking-[0.28em] uppercase text-warmgray font-barlow">
                {label}
              </span>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {catProducts.map((product, i) => (
                <LandingProductCard
                  key={product.id}
                  product={product}
                  delayClass={DELAY_CLASSES[i] ?? ""}
                />
              ))}
            </div>

            {/* View all CTA */}
            <div className="reveal mt-8 flex justify-center">
              <Link
                href="/#shop"
                className="inline-flex items-center gap-3 text-[0.72rem] tracking-[0.22em] uppercase text-charcoal px-10 py-[0.9rem] border border-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300 font-barlow"
              >
                View All {category.name}
              </Link>
            </div>
          </section>
        );
      })}
    </>
  );
}
