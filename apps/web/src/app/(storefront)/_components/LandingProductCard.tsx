"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface LandingProductCardProps {
  product: Product;
  /** Optional badge text, rendered gold when provided */
  badge?: string;
  /** Delay class: "reveal-d1" | "reveal-d2" | "reveal-d3" | "reveal-d4" */
  delayClass?: string;
}

/**
 * Product card for landing page product grids.
 *
 * Add-to-cart behaviour:
 *  - Products with no sizes and no colors → add immediately.
 *  - Products that require a size or color → the overlay button links to the
 *    product detail page instead. This respects the existing validation in
 *    AddToCart.tsx rather than bypassing it on the homepage.
 *
 * The card link always navigates to /products/[id] for full detail.
 */
export function LandingProductCard({ product, badge, delayClass = "" }: LandingProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const needsVariant = product.sizes.length > 0 || product.colors.length > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); // prevent the Link from navigating
    if (!product.isAvailable) return;
    addItem(product.id, 1, null, null);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className={`reveal ${delayClass} relative overflow-hidden bg-archive group`}>
      {/* Availability / badge */}
      {!product.isAvailable ? (
        <span className="absolute top-3 left-3 z-10 bg-charcoal text-cream text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1 font-barlow font-medium">
          Unavailable
        </span>
      ) : badge ? (
        <span className="absolute top-3 left-3 z-10 bg-gold text-charcoal text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1 font-barlow font-medium">
          {badge}
        </span>
      ) : null}

      {/* Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="overflow-hidden aspect-[3/4]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={500}
            height={667}
            className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.08]"
          />
        </div>
      </Link>

      {/*
       * Hover overlay.
       * - No variants needed → "Add to Cart" calls the store directly.
       * - Variants needed → button links to PDP where AddToCart handles selection.
       */}
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/25 transition-all duration-300 flex items-end justify-center pb-5 pointer-events-none group-hover:pointer-events-auto">
        {product.isAvailable && (
          needsVariant ? (
            <Link
              href={`/products/${product.id}`}
              className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream text-charcoal px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase font-barlow"
            >
              Select Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream text-charcoal px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase cursor-pointer font-barlow"
            >
              Add to Cart
            </button>
          )
        )}
      </div>

      {/* Info */}
      <Link href={`/products/${product.id}`} className="block pt-3 pb-2 px-1">
        <h4 className="text-[0.82rem] tracking-[0.06em] font-normal mb-1 text-charcoal">
          {product.name}
        </h4>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.78rem] text-warmgray">
            ₦{Number(product.price).toLocaleString()}
          </p>
          <p className={`text-[0.65rem] tracking-[0.12em] uppercase font-medium ${product.isAvailable ? "text-warmgray" : "text-red-400"}`}>
            {product.isAvailable ? "In stock" : "Unavailable"}
          </p>
        </div>
      </Link>
    </div>
  );
}
