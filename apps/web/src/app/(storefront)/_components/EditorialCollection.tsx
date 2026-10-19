"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import type { Product } from "@/types/product";

/**
 * Individual editorial card.
 * Uses a positioned wrapper with explicit aspect ratio instead of `fill`
 * to avoid height-inference issues across browsers.
 */
function EditorialCard({
  product,
  label,
  isFeatured = false,
}: {
  product: Product;
  label: string;
  isFeatured?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const needsVariant = product.sizes.length > 0 || product.colors.length > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.isAvailable) return;
    addItem(product.id, 1, null, null);
    toast.success(`${product.name} added to cart`);
  }

  return (
    /*
     * Outer div: relative + overflow-hidden + explicit height.
     * On mobile all cards stack; on lg the featured card uses min-h-[70vh]
     * and secondary cards flex-stretch to match it via the grid.
     */
    <div
      className={`relative overflow-hidden group ${
        isFeatured
          ? "min-h-[60vw] lg:min-h-[70vh]"
          : "min-h-[45vw] lg:min-h-0 lg:h-auto"
      }`}
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes={isFeatured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 100vw"}
        className="object-cover transition-transform duration-[800ms] ease-spring group-hover:scale-[1.06]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <span className="text-[0.65rem] tracking-[0.2em] uppercase text-cream/65 mb-1 font-barlow">
          {label}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3
            className={`font-bebas tracking-[0.08em] text-cream hover:text-goldlt transition-colors ${
              isFeatured ? "text-[1.8rem]" : "text-[1.4rem]"
            }`}
          >
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <p className="text-white text-[0.82rem] font-barlow">
            ₦{Number(product.price).toLocaleString()}
          </p>
          <p
            className={`text-[0.65rem] tracking-[0.12em] uppercase font-medium font-barlow ${
              product.isAvailable ? "text-cream/60" : "text-red-300"
            }`}
          >
            {product.isAvailable ? "In stock" : "Unavailable"}
          </p>
        </div>

        {product.isAvailable && (
          needsVariant ? (
            <Link
              href={`/products/${product.id}`}
              className="mt-3 w-fit bg-gold text-charcoal text-[0.68rem] tracking-[0.18em] uppercase px-5 py-2.5 hover:bg-goldlt transition-colors duration-300 font-barlow font-medium"
            >
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-3 w-fit bg-gold text-charcoal text-[0.68rem] tracking-[0.18em] uppercase px-5 py-2.5 cursor-pointer hover:bg-goldlt transition-colors duration-300 font-barlow font-medium"
            >
              Add to Cart
            </button>
          )
        )}
      </div>
    </div>
  );
}

const EDITORIAL_LABELS = ["Featured", "New In", "New In"];

/**
 * Editorial Collection section — asymmetric 2fr + 1fr + 1fr grid.
 *
 * Uses the first 3 products regardless of availability so the layout is
 * always populated. Availability is shown on each card.
 *
 * Section numbering: dynamically calculates its number based on how many
 * category sections precede it (categories that have at least one product).
 */
export function EditorialCollection() {
  const { data: products, isPending, isError } = useProducts();
  const { data: categories } = useCategories();

  const showSkeleton = isPending;

  // Take the first 3 products. No availability filter here — unavailable
  // products are visually labelled on the card.
  const items = products?.slice(0, 3) ?? [];

  // Calculate section number: count how many category sections precede this one.
  // Only categories with products are rendered as sections, so we filter accordingly.
  const categorySectionCount =
    products && categories
      ? categories.filter((cat) =>
          products.some((p) => p.categoryId === cat.id)
        ).length
      : 0;
  const sectionNumber = String(categorySectionCount + 1).padStart(2, "0");
  const sectionLabel = `${sectionNumber} / Collections`;

  return (
    <section
      id="collections"
      className="px-4 sm:px-6 md:px-14 py-14 md:py-16 bg-archive"
    >
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
        <h2 className="font-bebas text-[clamp(2rem,5vw,4rem)] tracking-[0.04em] leading-none">
          The Collection
        </h2>
        <span className="text-[0.65rem] tracking-[0.28em] uppercase text-warmgray font-barlow">
          {sectionLabel}
        </span>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px]">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      ) : isError ? (
        <p className="text-warmgray text-sm py-8 text-center font-barlow">
          Collection could not be loaded. Please try again.
        </p>
      ) : items.length === 0 ? (
        <p className="text-warmgray text-sm py-8 text-center font-barlow">
          No products available.
        </p>
      ) : (
        <div className="reveal grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-[2px]">
          {items.map((product, i) => (
            <EditorialCard
              key={product.id}
              product={product}
              label={EDITORIAL_LABELS[i] ?? "New In"}
              isFeatured={i === 0}
            />
          ))}
          {/* Pad to 3 columns when fewer than 3 products exist */}
          {items.length === 2 && (
            <div className="bg-archive min-h-[45vw] lg:min-h-0" />
          )}
        </div>
      )}
    </section>
  );
}
