"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useProducts } from "@/hooks/useProducts";
import { PageContainer } from "@/components/layout/Page-Container";
import { LoadingState } from "@/components/shared/LoadingState";

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { data: products, isLoading, isError } = useProducts();

    if (isLoading) {
    return (
        <PageContainer>
        <LoadingState message="Loading your cart..." />
        </PageContainer>
    );
    }

    if (isError || !products) {
        return (
        <PageContainer>
            <p className="py-24 text-center text-warmgray">
            Something went wrong loading your cart. Please try again.
            </p>
        </PageContainer>
        );
    }

  // match each cart item to its product, skip products that no longer exist
  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.product.price) * line.quantity,
    0
  );

  const suggestions = products
    .filter((p) => p.isAvailable && !items.some((i) => i.productId === p.id))
    .slice(0, 4);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="border-b border-charcoal/10 py-10">
        <PageContainer>
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-gold mb-2">
            Review your selection
          </p>
          <div className="flex items-baseline gap-6">
            <h1 className="font-bebas text-[clamp(2.5rem,6vw,5rem)] tracking-[0.04em] leading-none">
              Your Cart
            </h1>
            <span className="text-[0.7rem] tracking-[0.22em] uppercase text-warmgray">
              {lines.length} {lines.length === 1 ? "item" : "items"}
            </span>
          </div>
        </PageContainer>
      </div>

      {/* MAIN CONTENT */}
      <PageContainer>
        <div className="py-12 md:py-16">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg
                className="w-16 h-16 stroke-charcoal/20 fill-none mb-6"
                strokeWidth="1"
                viewBox="0 0 24 24"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="font-bebas text-[2rem] tracking-[0.04em] text-charcoal/30 mb-2">
                Your cart is empty
              </p>
              <p className="text-warmgray text-sm mb-8">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.22em] uppercase text-charcoal bg-gold px-10 py-4 hover:bg-goldlt transition-all duration-300 font-medium"
              >
                Continue Shopping →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
              {/* CART ITEMS */}
              <div>
                <div className="divide-y divide-charcoal/[.07]">
                  {lines.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-5 md:gap-8 py-7">
                      <div className="relative w-24 h-32 md:w-32 md:h-40 shrink-0 overflow-hidden bg-archive">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-[0.6rem] tracking-[0.22em] uppercase text-warmgray mb-1">
                            {product.category.name}
                          </p>
                          <h3 className="text-[0.95rem] tracking-[0.04em] font-normal mb-3">
                            {product.name}
                          </h3>
                          <p className="text-[0.82rem] font-medium text-charcoal">
                            {formatNaira(Number(product.price))}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-charcoal/20">
                            <button
                              onClick={() => decreaseQuantity(product.id)}
                              disabled={quantity === 1}
                              className="w-8 h-8 flex items-center justify-center text-charcoal text-sm border-r border-charcoal/20 transition-colors duration-200 hover:bg-charcoal hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-charcoal"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-[0.82rem] font-medium">
                              {quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(product.id)}
                              className="w-8 h-8 flex items-center justify-center text-charcoal text-sm border-l border-charcoal/20 transition-colors duration-200 hover:bg-charcoal hover:text-cream"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-[0.65rem] tracking-[0.18em] uppercase text-warmgray transition-colors duration-200 hover:text-gold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.22em] uppercase text-charcoal hover:text-gold transition-colors duration-200"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="lg:sticky lg:top-32">
                <div className="bg-archive border border-charcoal/[.07] p-8">
                  <h2 className="font-bebas text-[1.8rem] tracking-[0.04em] leading-none mb-8 pb-4 border-b border-charcoal/10">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[0.78rem] text-warmgray tracking-[0.04em]">Subtotal</span>
                      <span className="text-[0.82rem] font-medium">{formatNaira(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[0.78rem] text-warmgray tracking-[0.04em]">Delivery</span>
                      <span className="text-[0.82rem] text-warmgray">Calculated on order</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[0.78rem] text-warmgray tracking-[0.04em]">Discount</span>
                      <span className="text-[0.82rem] text-warmgray">—</span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-5" />

                  <div className="flex justify-between items-baseline mb-8">
                    <span className="text-[0.8rem] tracking-[0.18em] uppercase font-medium">Total</span>
                    <span className="font-bebas text-[2rem] tracking-[0.04em] text-charcoal leading-none">
                      {formatNaira(subtotal)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-gold via-goldlt to-gold bg-[length:200%_auto] text-charcoal text-[0.72rem] tracking-[0.22em] uppercase font-medium py-4 px-6 transition-all duration-500 hover:bg-right hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,160,48,0.35)]"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="text-[0.65rem] text-warmgray text-center mt-5 leading-relaxed tracking-[0.04em]">
                    Nationwide delivery across all 36 states.
                    <br />
                    100% authentic products guaranteed.
                  </p>
                </div>

                {/* PROMO CODE (not in use: no coupon system on the backend)
                <div className="mt-4 border border-charcoal/10 p-5">
                  <p className="text-[0.65rem] tracking-[0.22em] uppercase text-warmgray mb-3">Promo Code</p>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 min-w-0 px-4 py-3 bg-white border border-charcoal/15 border-r-0 text-charcoal text-[0.8rem] outline-none placeholder:text-warmgray/60"
                    />
                    <button className="px-5 py-3 bg-charcoal text-cream text-[0.65rem] tracking-[0.18em] uppercase hover:bg-gold hover:text-charcoal transition-colors duration-300 font-medium whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                </div>
                */}
              </div>
            </div>
          )}
        </div>
      </PageContainer>

      {/* YOU MAY ALSO LIKE */}
      {suggestions.length > 0 && (
        <section className="bg-archive border-t border-charcoal/10 py-16">
          <PageContainer>
            <div className="flex items-baseline justify-between mb-10 pb-4 border-b border-charcoal/10">
              <h2 className="font-bebas text-[clamp(1.8rem,4vw,3rem)] tracking-[0.04em] leading-none">
                You May Also Like
              </h2>
              <Link
                href="/shop"
                className="text-[0.65rem] tracking-[0.22em] uppercase text-gold hover:opacity-70 transition-opacity"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {suggestions.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block bg-cream">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                      />
                    )}
                  </div>
                  <div className="pt-3 pb-2 px-1">
                    <p className="text-[0.6rem] tracking-[0.22em] uppercase text-warmgray mb-1">
                      {product.category.name}
                    </p>
                    <h4 className="text-[0.82rem] tracking-[0.06em] font-normal mb-1">{product.name}</h4>
                    <p className="text-[0.78rem] text-warmgray">{formatNaira(Number(product.price))}</p>
                  </div>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}
    </>
  );
}