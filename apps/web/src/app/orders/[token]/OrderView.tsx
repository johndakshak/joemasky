"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Order, OrderItem, OrderStatus } from "@/types/order";
import type { OrderContactLinks } from "@/types/contact";
import { getOrderContactLinks } from "@/lib/api/contact";
import { OrderActions } from "./OrderActions";
import { PageContainer } from "@/components/layout/Page-Container";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

// Human-readable label + colour for each status
function statusMeta(status: OrderStatus): { label: string; className: string } {
  switch (status) {
    case "PENDING":
      return { label: "Pending Review", className: "bg-amber-50 text-amber-700 border border-amber-200" };
    case "CONFIRMED":
      return { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    case "PARTIALLY_CONFIRMED":
      return { label: "Partially Confirmed", className: "bg-orange-50 text-orange-700 border border-orange-200" };
    case "UNAVAILABLE":
      return { label: "Unavailable", className: "bg-red-50 text-red-700 border border-red-200" };
    case "PROCESSING":
      return { label: "Processing", className: "bg-blue-50 text-blue-700 border border-blue-200" };
    case "COMPLETED":
      return { label: "Completed", className: "bg-emerald-50 text-emerald-800 border border-emerald-200" };
    case "CANCELLED":
      return { label: "Cancelled", className: "bg-charcoal/5 text-warmgray border border-charcoal/10" };
  }
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: OrderItem }) {
  const lineTotal = Number(item.unitPrice) * item.quantity;
  const unavailable = item.availability === "UNAVAILABLE";

  return (
    <div
      className={`py-4 border-b border-charcoal/[.06] last:border-0 ${
        unavailable ? "opacity-60" : ""
      }`}
    >
      {/* Row 1: product name + availability badge */}
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <p className="text-[0.85rem] text-charcoal leading-snug flex-1 min-w-0">
          {item.productName}
        </p>
        <span
          className={`shrink-0 text-[0.6rem] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full ${
            unavailable
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {unavailable ? "Unavailable" : "Available"}
        </span>
      </div>

      {/* Row 2: size and colour — only when at least one is present */}
      {(item.selectedSize || item.selectedColor) && (
        <p className="text-[0.72rem] text-warmgray mb-1.5">
          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
          {item.selectedSize && item.selectedColor && <span className="mx-1">·</span>}
          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
        </p>
      )}

      {/* Row 3: quantity · unit price · line total */}
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[0.72rem] text-warmgray">
          <span>Qty: {item.quantity}</span>
          <span className="mx-1.5 text-charcoal/20">·</span>
          <span>{formatNaira(Number(item.unitPrice))} each</span>
        </p>
        <p
          className={`shrink-0 text-[0.9rem] font-semibold whitespace-nowrap ${
            unavailable ? "line-through text-warmgray" : "text-charcoal"
          }`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {formatNaira(lineTotal)}
        </p>
      </div>
    </div>
  );
}

// ─── Main view — holds live order state after Accept/Decline ──────────────────

interface OrderViewProps {
  initialOrder: Order;
}

export function OrderView({ initialOrder }: OrderViewProps) {
  // Accept/Decline actions return the updated Order — replace the initial data.
  const [order, setOrder] = useState<Order>(initialOrder);

  // Contact links are fetched separately so a failure does not affect
  // the order display or Accept/Decline actions.
  // null  = still loading
  // false = fetch failed
  // OrderContactLinks = successfully loaded
  const [contactLinks, setContactLinks] = useState<OrderContactLinks | null | false>(null);

  useEffect(() => {
    // Track whether this effect is still current so we don't apply a stale
    // result if the component re-renders with a different token.
    let cancelled = false;

    setContactLinks(null); // reset to loading on each token change

    getOrderContactLinks(order.publicToken)
      .then((links) => {
        if (!cancelled) setContactLinks(links);
      })
      .catch(() => {
        if (!cancelled) setContactLinks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [order.publicToken]);

  const { label: statusLabel, className: statusClass } = statusMeta(order.status);
  const hasUnavailableItems = order.items.some((i) => i.availability === "UNAVAILABLE");
  const isPartiallyConfirmed = order.status === "PARTIALLY_CONFIRMED";
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Gold accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
        aria-hidden="true"
      />

      <div className="pt-[3px]">
        <PageContainer>
          <div className="py-10 max-w-[720px] mx-auto">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[0.68rem] tracking-[0.12em] uppercase text-warmgray mb-3"
            >
              <Link href="/" className="hover:text-gold transition-colors duration-200">
                Home
              </Link>
              <span>/</span>
              <span className="text-charcoal">Order</span>
            </nav>

            {/* Page heading + status */}
            <div className="flex flex-wrap items-baseline gap-4 mb-8">
              <h1
                className="text-[1.8rem] font-semibold text-charcoal leading-tight"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Your Order
              </h1>
              <span
                className={`text-[0.68rem] font-semibold tracking-[0.12em] uppercase px-3 py-1 rounded-full ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

            {/* Partially confirmed notice — shown before the items list */}
            {isPartiallyConfirmed && (
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-[10px] px-5 py-4 mb-6">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#c2410c"
                  strokeWidth="2"
                  className="shrink-0 mt-px"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <div>
                  <p className="text-[0.82rem] font-medium text-orange-800 mb-0.5">
                    Some items are unavailable
                  </p>
                  <p className="text-[0.78rem] text-orange-700 leading-relaxed">
                    The shop has reviewed your order and one or more items cannot
                    be fulfilled. Review the list below and choose whether to
                    accept the available items or decline the order.
                  </p>
                </div>
              </div>
            )}

            {/* ── Section card: Order details ── */}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span
                  className="text-[1.05rem] font-semibold text-charcoal"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Order Details
                </span>
                <span className="ml-auto text-[0.72rem] text-warmgray">
                  {formattedDate}
                </span>
              </div>

              {/* Card body — customer + delivery info */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[0.62rem] tracking-[0.18em] uppercase text-warmgray mb-1">
                    Name
                  </p>
                  <p className="text-[0.85rem] text-charcoal">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] tracking-[0.18em] uppercase text-warmgray mb-1">
                    Phone
                  </p>
                  <p className="text-[0.85rem] text-charcoal">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] tracking-[0.18em] uppercase text-warmgray mb-1">
                    Fulfilment
                  </p>
                  <p className="text-[0.85rem] text-charcoal">
                    {order.deliveryMethod === "DELIVERY"
                      ? "Delivery / Waybill"
                      : "Pickup from shop"}
                  </p>
                </div>
                {order.deliveryMethod === "DELIVERY" && order.deliveryInfo && (
                  <div>
                    <p className="text-[0.62rem] tracking-[0.18em] uppercase text-warmgray mb-1">
                      Delivery Address
                    </p>
                    <p className="text-[0.85rem] text-charcoal leading-snug">
                      {order.deliveryInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section card: Items ── */}
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <span
                  className="text-[1.05rem] font-semibold text-charcoal"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Items
                </span>
              </div>

              {/* Items list */}
              <div className="px-6">
                {order.items.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-5 border-t border-charcoal/10 flex flex-col gap-2.5">
                {hasUnavailableItems && (
                  <p className="text-[0.72rem] text-warmgray mb-1">
                    Unavailable items are excluded from the total.
                  </p>
                )}
                <div className="flex justify-between items-baseline">
                  <span
                    className="text-[1.15rem] font-semibold text-charcoal"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {hasUnavailableItems ? "Total (available items)" : "Total"}
                  </span>
                  <span
                    className="text-[1.15rem] font-semibold text-charcoal"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {formatNaira(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Accept / Decline actions — only for PARTIALLY_CONFIRMED ── */}
            {isPartiallyConfirmed && (
              <div className="bg-white border border-charcoal/10 rounded-[14px] overflow-hidden mb-5">
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
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-[1.05rem] font-semibold text-charcoal"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    Your Response Required
                  </span>
                </div>
                <div className="px-6 py-5">
                  <OrderActions
                    publicToken={order.publicToken}
                    onUpdate={setOrder}
                  />
                </div>
              </div>
            )}

            {/* ── Contact note — always shown ── */}
            <p className="text-center text-[0.75rem] text-warmgray leading-relaxed">
              Questions about your order? Contact the shop via{" "}
              {contactLinks === null ? (
                // Loading — keep the sentence intact with muted placeholder text
                <span className="text-warmgray/40">WhatsApp or phone</span>
              ) : contactLinks === false ? (
                // Fetch failed — omit links so we never show dead or fake URLs
                <span>WhatsApp or phone</span>
              ) : (
                <>
                  <a
                    href={contactLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    WhatsApp
                  </a>
                  {" "}or{" "}
                  <a
                    href={contactLinks.call}
                    className="text-gold hover:underline"
                  >
                    phone
                  </a>
                </>
              )}
              .
            </p>

            {/* ── Back to shop ── */}
            <div className="flex justify-center mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.1em] uppercase text-warmgray hover:text-charcoal transition-colors duration-200"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to Shop
              </Link>
            </div>

          </div>
        </PageContainer>
      </div>
    </>
  );
}
