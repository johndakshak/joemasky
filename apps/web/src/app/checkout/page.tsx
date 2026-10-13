"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { useProducts } from "@/hooks/useProducts";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageContainer } from "@/components/layout/Page-Container";
import { createOrder } from "@/lib/api/order";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/types/order";

// ─── Zod schema ───────────────────────────────────────────────────────────────
//
// Nigerian phone: +234XXXXXXXXXX or 0XXXXXXXXXX (070/080/090, 11 digits total)
// Must match the backend's validatePhone regex exactly.

const nigerianPhone = z
  .string()
  .regex(/^(?:\+234|0)[789][01]\d{8}$/, {
    message: "Enter a valid Nigerian number, e.g. 08012345678 or +2348012345678",
  });

const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" }),
    customerPhone: nigerianPhone,
    deliveryMethod: z.enum(["PICKUP", "DELIVERY"]),
    deliveryInfo: z.string().optional(),
    // Terms checkbox — must be true to submit.
    // Zod v4 uses `error` (not `errorMap`) for the custom message param.
    termsAccepted: z.literal(true, {
      error: "You must agree to the Terms & Conditions to continue",
    }),
  })
  // deliveryInfo is required when DELIVERY is chosen
  .refine(
    (data) => {
      if (data.deliveryMethod === "DELIVERY") {
        return !!data.deliveryInfo && data.deliveryInfo.trim().length > 0;
      }
      return true;
    },
    {
      message: "Delivery address is required",
      path: ["deliveryInfo"],
    }
  );

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { data: products } = useProducts();

  // Zustand rehydrates from localStorage asynchronously.
  // We must not redirect during the initial render — wait for mount.
  const [mounted, setMounted] = useState(false);

  // Holds the confirmed order after successful submission.
  // While non-null the success panel is shown instead of the form.
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // API-level error message shown above the submit button.
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ref attached to the success panel's root element so we can scroll it into
  // view immediately after the order is confirmed.
  const successPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to /cart after hydration if the cart is empty.
  // Guard: do NOT redirect when confirmedOrder is set — the cart is
  // intentionally empty at that point and the success panel must stay visible.
  useEffect(() => {
    if (mounted && cartItems.length === 0 && !confirmedOrder) {
      router.replace("/cart");
    }
  }, [mounted, cartItems.length, confirmedOrder, router]);

  // Scroll the success panel into view as soon as it mounts.
  // Fires only once when confirmedOrder transitions from null to an Order object.
  useEffect(() => {
    if (confirmedOrder && successPanelRef.current) {
      successPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [confirmedOrder]);

  // ─── React Hook Form ────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "PICKUP",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  // ─── Order summary data ─────────────────────────────────────────────────────

  // Match each cart item to its full product; skip items whose product has
  // been removed from the API (same pattern used in the cart page).
  const lines = cartItems.flatMap((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return product
      ? [
          {
            product,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          },
        ]
      : [];
  });

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.product.price) * line.quantity,
    0
  );

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Submit handler ─────────────────────────────────────────────────────────
  //
  // RHF's handleSubmit sets formState.isSubmitting = true for the duration of
  // this async function, which disables the button and prevents double-submit.
  // The cart is only cleared after the API confirms success — never on failure.

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitError(null);

    try {
      const order = await createOrder({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        deliveryMethod: values.deliveryMethod,
        // Only include deliveryInfo when DELIVERY is selected and the field
        // has a value; omit it entirely for PICKUP.
        ...(values.deliveryMethod === "DELIVERY" && values.deliveryInfo
          ? { deliveryInfo: values.deliveryInfo }
          : {}),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize ?? null,
          selectedColor: item.selectedColor ?? null,
        })),
      });

      // Order confirmed — clear the cart then show the success panel.
      clearCart();
      setConfirmedOrder(order);
    } catch (err) {
      if (err instanceof ApiError) {
        // Surface the backend's validation message directly (it's already
        // user-readable, e.g. "A size selection is required for…")
        setSubmitError(err.message);
      } else {
        setSubmitError(
          "Something went wrong. Please check your connection and try again."
        );
      }
    }
  }

  // ─── Loading / redirect guard ───────────────────────────────────────────────
  //
  // Show the spinner until Zustand has hydrated AND we know the cart is
  // non-empty.  If the cart really is empty, the redirect useEffect fires and
  // replaces this spinner with the /cart page.

  if (!mounted || (cartItems.length === 0 && !confirmedOrder)) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  // ─── Success panel ──────────────────────────────────────────────────────────
  //
  // Shown after the API confirms the order. The form is replaced entirely.
  // The publicToken is available here for Phase 7 (order-tracking page).

  if (confirmedOrder) {
    return (
      <>
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[60]"
          style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
          aria-hidden="true"
        />
        {/* ref sits on the outermost scrollable element so scrollIntoView
            brings the very top of the panel into view */}
        <div className="pt-[3px]" ref={successPanelRef}>
          <div className="max-w-[1060px] mx-auto px-4 sm:px-6 py-16 flex justify-center">
            <div className="w-full max-w-[460px] bg-white border border-charcoal/10 rounded-[18px] px-10 py-12 text-center shadow-[0_20px_60px_rgba(26,26,24,0.08)]">
              {/* Checkmark icon */}
              <div className="w-[72px] h-[72px] rounded-full bg-[rgba(74,144,104,0.1)] border-2 border-[rgba(74,144,104,0.3)] flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth="2.2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2
                className="text-[2rem] font-semibold text-charcoal mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Order Placed!
              </h2>

              {/* 1. Customer name is now bold (font-semibold), matching the
                     emphasis already applied to the phone number. */}
              <p className="text-[0.83rem] text-warmgray leading-relaxed mb-7">
                Thank you,{" "}
                <span className="text-charcoal font-semibold">
                  {confirmedOrder.customerName}
                </span>
                . Your order has been received and is being reviewed by the
                shop. We&apos;ll reach out to you on{" "}
                <span className="text-charcoal font-medium">
                  {confirmedOrder.customerPhone}
                </span>{" "}
                to confirm availability and arrange{" "}
                {confirmedOrder.deliveryMethod === "DELIVERY" ? "delivery" : "pickup"}.
              </p>

              {/* Order details summary */}
              <div className="bg-cream rounded-[10px] px-5 py-4 mb-7 flex flex-col gap-2 text-left">
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-warmgray">Order total</span>
                  <span className="text-charcoal font-medium">
                    {formatNaira(confirmedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-warmgray">Fulfilment</span>
                  <span className="text-charcoal font-medium">
                    {confirmedOrder.deliveryMethod === "DELIVERY"
                      ? "Delivery / Waybill"
                      : "Pickup"}
                  </span>
                </div>
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-warmgray">Status</span>
                  <span className="text-charcoal font-medium capitalize">
                    {confirmedOrder.status.charAt(0) +
                      confirmedOrder.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              {/* 2. Button row: Track Order (outlined) + Continue Shopping (gold).
                     Track Order is a placeholder — the /orders/[token] route does
                     not exist yet (Phase 7). The button is present and the token
                     is available; it will be wired to the real route in Phase 7. */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="block w-full rounded-[10px] bg-gold text-charcoal py-[1.05rem] px-6 text-[0.78rem] font-semibold tracking-[0.2em] uppercase text-center transition-all duration-200 hover:bg-goldlt hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(200,160,48,0.35)]"
                >
                  Continue Shopping
                </Link>

                {/* Track Order — href intentionally points to # until the
                    Phase 7 order-tracking page exists at /orders/[token].
                    Replace href with `/orders/${confirmedOrder.publicToken}`
                    once that route is created. */}
                <Link
                  href="#"
                  aria-disabled="true"
                  className="block w-full rounded-[10px] border border-charcoal/20 text-charcoal py-[1.05rem] px-6 text-[0.78rem] font-semibold tracking-[0.2em] uppercase text-center transition-all duration-200 hover:border-gold hover:text-gold opacity-50 cursor-not-allowed pointer-events-none"
                >
                  Track Order
                </Link>

                <p className="text-[0.65rem] text-warmgray/70 tracking-[0.04em]">
                  Order tracking will be available shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Thin gold accent bar — fixed at very top, sits above the sticky Header */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60]"
        style={{
          background:
            "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)",
        }}
        aria-hidden="true"
      />

      {/* Page body — push down by 3px so accent bar doesn't overlap header */}
      <div className="pt-[3px]">
        <div className="max-w-[1060px] mx-auto px-4 sm:px-6 py-10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

              {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
              <div>

                {/* Breadcrumb + page title */}
                <div className="mb-7">
                  <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-2 text-[0.68rem] tracking-[0.12em] uppercase text-warmgray mb-2.5"
                  >
                    <Link
                      href="/"
                      className="hover:text-gold transition-colors duration-200"
                    >
                      Home
                    </Link>
                    <span>/</span>
                    <Link
                      href="/cart"
                      className="hover:text-gold transition-colors duration-200"
                    >
                      Cart
                    </Link>
                    <span>/</span>
                    <span className="text-charcoal">Checkout</span>
                  </nav>
                  <h1
                    className="text-[1.8rem] font-semibold text-charcoal leading-tight"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    Checkout
                  </h1>
                </div>

                {/* ── Section card: Contact Details ────────────────────── */}
                <div className="bg-white border border-charcoal/10 rounded-[14px] overflow-hidden mb-5">
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-6 py-[1.1rem] border-b border-charcoal/10">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(200,169,110,0.08)] flex items-center justify-center shrink-0">
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#c8a96e"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-[1.05rem] font-semibold text-charcoal"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    >
                      Contact Details
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-6 flex flex-col gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="customerName"
                        className="text-[0.64rem] tracking-[0.18em] uppercase text-warmgray"
                      >
                        Full Name
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        placeholder="e.g. Emeka Okafor"
                        autoComplete="name"
                        {...register("customerName")}
                        className={`bg-cream border rounded-lg px-4 py-3 text-[0.85rem] text-charcoal outline-none transition-all duration-200 placeholder:text-warmgray/60 focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,160,48,0.12)] ${
                          errors.customerName
                            ? "border-red-400"
                            : "border-charcoal/10"
                        }`}
                      />
                      {errors.customerName && (
                        <p className="text-[0.72rem] text-red-500 mt-0.5">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="customerPhone"
                        className="text-[0.64rem] tracking-[0.18em] uppercase text-warmgray"
                      >
                        Phone Number
                      </label>
                      <input
                        id="customerPhone"
                        type="tel"
                        placeholder="08012345678 or +2348012345678"
                        autoComplete="tel"
                        {...register("customerPhone")}
                        className={`bg-cream border rounded-lg px-4 py-3 text-[0.85rem] text-charcoal outline-none transition-all duration-200 placeholder:text-warmgray/60 focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,160,48,0.12)] ${
                          errors.customerPhone
                            ? "border-red-400"
                            : "border-charcoal/10"
                        }`}
                      />
                      {errors.customerPhone && (
                        <p className="text-[0.72rem] text-red-500 mt-0.5">
                          {errors.customerPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Section card: Delivery Method ────────────────────── */}
                <div className="bg-white border border-charcoal/10 rounded-[14px] overflow-hidden mb-5">
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-6 py-[1.1rem] border-b border-charcoal/10">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(200,169,110,0.08)] flex items-center justify-center shrink-0">
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#c8a96e"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <rect x="1" y="3" width="15" height="13" rx="1" />
                        <path d="M16 8h4l3 3v5h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </div>
                    <span
                      className="text-[1.05rem] font-semibold text-charcoal"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    >
                      Delivery Method
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-6 flex flex-col gap-[0.65rem]">

                    {/* PICKUP option */}
                    <label
                      className={`flex items-center gap-4 border-[1.5px] rounded-[10px] px-5 py-4 cursor-pointer transition-all duration-200 ${
                        deliveryMethod === "PICKUP"
                          ? "border-gold bg-[rgba(200,169,110,0.08)]"
                          : "border-charcoal/10 hover:border-[rgba(200,169,110,0.4)]"
                      }`}
                    >
                      <input
                        type="radio"
                        value="PICKUP"
                        {...register("deliveryMethod")}
                        className="accent-gold shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-[0.85rem] text-charcoal">Pickup</p>
                        <p className="text-[0.72rem] text-warmgray mt-0.5">
                          Collect from the shop
                        </p>
                      </div>
                    </label>

                    {/* DELIVERY option */}
                    <label
                      className={`flex items-center gap-4 border-[1.5px] rounded-[10px] px-5 py-4 cursor-pointer transition-all duration-200 ${
                        deliveryMethod === "DELIVERY"
                          ? "border-gold bg-[rgba(200,169,110,0.08)]"
                          : "border-charcoal/10 hover:border-[rgba(200,169,110,0.4)]"
                      }`}
                    >
                      <input
                        type="radio"
                        value="DELIVERY"
                        {...register("deliveryMethod")}
                        className="accent-gold shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-[0.85rem] text-charcoal">
                          Delivery / Waybill
                        </p>
                        <p className="text-[0.72rem] text-warmgray mt-0.5">
                          Delivered to your address
                        </p>
                      </div>
                    </label>

                    {/* Delivery address — shown only when DELIVERY is selected */}
                    {deliveryMethod === "DELIVERY" && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <label
                          htmlFor="deliveryInfo"
                          className="text-[0.64rem] tracking-[0.18em] uppercase text-warmgray"
                        >
                          Delivery Address
                        </label>
                        <textarea
                          id="deliveryInfo"
                          rows={3}
                          placeholder="Street address, city, state"
                          {...register("deliveryInfo")}
                          className={`bg-cream border rounded-lg px-4 py-3 text-[0.85rem] text-charcoal outline-none transition-all duration-200 placeholder:text-warmgray/60 focus:border-gold focus:shadow-[0_0_0_3px_rgba(200,160,48,0.12)] resize-none ${
                            errors.deliveryInfo
                              ? "border-red-400"
                              : "border-charcoal/10"
                          }`}
                        />
                        {errors.deliveryInfo && (
                          <p className="text-[0.72rem] text-red-500 mt-0.5">
                            {errors.deliveryInfo.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Terms + Place Order ───────────────────────────────── */}
                <div className="mt-1">
                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer mb-5">
                    <input
                      type="checkbox"
                      {...register("termsAccepted")}
                      className="accent-gold mt-[3px] shrink-0"
                    />
                    <span className="text-[0.78rem] text-warmgray leading-relaxed">
                      I agree to JeoMasky&apos;s{" "}
                      {/* Terms & Privacy routes do not currently exist in the project.
                          Using # as a placeholder. Report: both routes are missing. */}
                      <a
                        href="#"
                        className="text-gold hover:underline"
                      >
                        Terms &amp; Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-gold hover:underline"
                      >
                        Privacy Policy
                      </a>
                      . I confirm my order and delivery details are correct.
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-[0.72rem] text-red-500 -mt-3 mb-4">
                      {errors.termsAccepted.message}
                    </p>
                  )}

                  {/* API / network error banner */}
                  {submitError && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-500 shrink-0 mt-px"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-[0.78rem] text-red-700 leading-relaxed">
                        {submitError}
                      </p>
                    </div>
                  )}

                  {/* Place Order button — brand gold background, charcoal text.
                      Disabled and shows a spinner while the API request is in flight. */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-[10px] bg-gold text-charcoal border-none py-[1.05rem] px-6 text-[0.78rem] font-semibold tracking-[0.2em] uppercase cursor-pointer transition-all duration-200 hover:bg-goldlt hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(200,160,48,0.35)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="animate-spin"
                          aria-hidden="true"
                        >
                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Place Order
                      </>
                    )}
                  </button>

                  {/* Secure note */}
                  <p className="flex items-center justify-center gap-1.5 text-[0.68rem] text-warmgray mt-3 tracking-[0.06em]">
                    <svg
                      width="11"
                      height="11"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    256-bit SSL encrypted · Your data is safe
                  </p>

                  {/* Back to cart */}
                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-2 text-[0.72rem] tracking-[0.1em] uppercase text-warmgray hover:text-charcoal transition-colors duration-200 mt-4"
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 12H5M12 5l-7 7 7 7"
                      />
                    </svg>
                    Back to Cart
                  </Link>
                </div>
              </div>

              {/* ── RIGHT COLUMN: Order Summary ──────────────────────────── */}
              <div className="lg:sticky lg:top-20">
                <div className="bg-white border border-charcoal/10 rounded-[14px] overflow-hidden">

                  {/* Summary header */}
                  <div className="flex items-center justify-between px-5 py-[1.1rem] border-b border-charcoal/10">
                    <span
                      className="text-[1.05rem] font-semibold text-charcoal"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    >
                      Order Summary
                    </span>
                    <Link
                      href="/cart"
                      className="text-[0.68rem] tracking-[0.1em] uppercase text-gold hover:opacity-70 transition-opacity duration-200"
                    >
                      Edit Cart
                    </Link>
                  </div>

                  {/* Items list */}
                  <div className="px-5 py-[1.1rem] flex flex-col gap-[0.85rem]">
                    {lines.length === 0
                      ? // Skeleton rows while products API resolves
                        cartItems.map((item) => (
                          <div
                            key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                            className="flex gap-3 items-center"
                          >
                            <div className="w-[52px] h-[62px] rounded-lg bg-archive shrink-0 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-charcoal/10 w-3/4 rounded animate-pulse" />
                              <div className="h-2.5 bg-charcoal/10 w-1/2 rounded animate-pulse" />
                            </div>
                            <div className="h-3 bg-charcoal/10 w-14 rounded animate-pulse" />
                          </div>
                        ))
                      : lines.map(
                          ({ product, quantity, selectedSize, selectedColor }) => (
                            <div
                              key={`${product.id}-${selectedSize}-${selectedColor}`}
                              className="flex gap-3 items-center"
                            >
                              {/* Product thumbnail */}
                              <div className="relative w-[52px] h-[62px] rounded-lg bg-archive border border-charcoal/10 shrink-0 overflow-hidden flex items-center justify-center">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="52px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-[0.52rem] text-warmgray uppercase tracking-[0.08em] text-center px-1">
                                    Photo
                                  </span>
                                )}
                                {/* Quantity badge */}
                                <span className="absolute -top-[5px] -right-[5px] bg-charcoal text-cream text-[0.55rem] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">
                                  {quantity}
                                </span>
                              </div>

                              {/* Name + meta */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[0.82rem] text-charcoal leading-snug truncate">
                                  {product.name}
                                </p>
                                {(selectedSize || selectedColor) && (
                                  <p className="text-[0.7rem] text-warmgray mt-0.5">
                                    {selectedSize && (
                                      <span>Size {selectedSize}</span>
                                    )}
                                    {selectedSize && selectedColor && (
                                      <span> · </span>
                                    )}
                                    {selectedColor && (
                                      <span>{selectedColor}</span>
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Line price */}
                              <p
                                className="ml-auto text-[1rem] font-semibold text-charcoal whitespace-nowrap"
                                style={{
                                  fontFamily:
                                    "var(--font-cormorant), Georgia, serif",
                                }}
                              >
                                {formatNaira(Number(product.price) * quantity)}
                              </p>
                            </div>
                          )
                        )}
                  </div>

                  {/* Totals */}
                  <div className="px-5 py-4 border-t border-charcoal/10 flex flex-col gap-2">
                    <div className="flex justify-between text-[0.82rem] text-warmgray">
                      <span>
                        Subtotal ({totalItemCount}{" "}
                        {totalItemCount === 1 ? "item" : "items"})
                      </span>
                      <span>{formatNaira(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[0.82rem] text-warmgray">
                      <span>Delivery</span>
                      <span>Calculated on order</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-charcoal/10 mt-1.5 pt-2.5">
                      <div className="flex justify-between items-baseline">
                        <span
                          className="text-[1.2rem] font-semibold text-charcoal"
                          style={{
                            fontFamily:
                              "var(--font-cormorant), Georgia, serif",
                          }}
                        >
                          Total
                        </span>
                        <span
                          className="text-[1.2rem] font-semibold text-charcoal"
                          style={{
                            fontFamily:
                              "var(--font-cormorant), Georgia, serif",
                          }}
                        >
                          {formatNaira(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
