"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminOrder } from "@/hooks/useAdminOrder";
import { useOrderMutations } from "@/hooks/useOrderMutations";
import { useAvailabilityMutations } from "@/hooks/useAvailabilityMutations";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  PENDING: {
    bg: "rgba(200,160,48,0.10)",
    border: "rgba(200,160,48,0.30)",
    color: "#7a5e10",
    label: "Pending",
  },
  PARTIALLY_CONFIRMED: {
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    color: "#4338ca",
    label: "Partially Confirmed",
  },
  CONFIRMED: {
    bg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.25)",
    color: "#15803d",
    label: "Confirmed",
  },
  PROCESSING: {
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.25)",
    color: "#1d4ed8",
    label: "Processing",
  },
  COMPLETED: {
    bg: "rgba(28,26,20,0.06)",
    border: "rgba(28,26,20,0.18)",
    color: "var(--charcoal)",
    label: "Completed",
  },
  CANCELLED: {
    bg: "rgba(176,92,58,0.08)",
    border: "rgba(176,92,58,0.25)",
    color: "#b05c3a",
    label: "Cancelled",
  },
  UNAVAILABLE: {
    bg: "rgba(107,104,96,0.10)",
    border: "rgba(107,104,96,0.25)",
    color: "var(--warmgray)",
    label: "Unavailable",
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span
      className="inline-block font-barlow font-medium"
      style={{
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        padding: "3px 10px",
        borderRadius: "3px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

// Mirrors the transition table in order.controller.ts → updateOrderStatus.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "PARTIALLY_CONFIRMED", "CANCELLED", "UNAVAILABLE"],
  PARTIALLY_CONFIRMED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  UNAVAILABLE: ["CANCELLED"],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_CONFIRMED: "Partially Confirmed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  UNAVAILABLE: "Unavailable",
};

const AVAILABILITY_EDITABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "UNAVAILABLE",
  "PARTIALLY_CONFIRMED",
];

function AvailabilityReviewPanel({
  order,
  orderId,
}: {
  order: Order;
  orderId: number;
}) {
  const { updatingItem, finalisingReview, handleMarkAvailability, handleFinaliseReview } =
    useAvailabilityMutations(orderId);

  return (
    <div
      className="bg-white border border-charcoal/[.06] rounded-lg overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
    >
      <div
        className="px-6 py-4 border-b border-charcoal/[.05]"
        style={{ background: "var(--archive)" }}
      >
        <h2
          className="font-bebas tracking-wider text-charcoal"
          style={{ fontSize: "1.2rem" }}
        >
          Availability Review
        </h2>
        <p
          className="font-barlow font-light text-warmgray mt-0.5"
          style={{ fontSize: "0.75rem" }}
        >
          Mark each item as available, partially available, or unavailable.
          Fulfilment quantities shown use the effective available quantity.
        </p>
      </div>

      <div className="divide-y divide-charcoal/[.04]">
        {order.items.map((item) => (
          <AvailabilityItemRow
            key={item.id}
            item={item}
            isUpdating={!!updatingItem[item.id]}
            onMark={handleMarkAvailability}
          />
        ))}
      </div>

      <div
        className="px-6 py-4 border-t border-charcoal/[.05] flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{ background: "var(--archive)" }}
      >
        <p
          className="font-barlow font-light text-warmgray flex-1"
          style={{ fontSize: "0.75rem" }}
        >
          Once all items are marked, click <strong>Finalise Review</strong> to
          calculate the order status and notify the customer.
        </p>
        <button
          type="button"
          onClick={handleFinaliseReview}
          disabled={finalisingReview}
          className="shrink-0 px-6 py-2.5 rounded font-barlow font-medium uppercase
                     tracking-widest transition-colors focus-visible:outline
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-gold disabled:opacity-50
                     disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontSize: "0.72rem",
            background: "var(--gold)",
            color: "var(--charcoal)",
            border: "none",
          }}
          onMouseOver={(e) => {
            if (!finalisingReview) {
              e.currentTarget.style.background = "var(--charcoal)";
              e.currentTarget.style.color = "var(--cream)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--gold)";
            e.currentTarget.style.color = "var(--charcoal)";
          }}
        >
          {finalisingReview ? "Finalising…" : "Finalise Review"}
        </button>
      </div>
    </div>
  );
}

// Three modes:
//   available   → AVAILABLE, no availableQuantity
//   partial     → AVAILABLE, with a positive integer availableQuantity < item.quantity
//   unavailable → UNAVAILABLE
function AvailabilityItemRow({
  item,
  isUpdating,
  onMark,
}: {
  item: OrderItem;
  isUpdating: boolean;
  onMark: (
    item: OrderItem,
    availability: "AVAILABLE" | "UNAVAILABLE",
    availableQuantity?: number | null
  ) => void;
}) {
  function getCurrentMode(): "available" | "partial" | "unavailable" {
    if (item.availability === "UNAVAILABLE") return "unavailable";
    if (item.availableQuantity != null) return "partial";
    return "available";
  }

  const [mode, setMode] = useState<"available" | "partial" | "unavailable">(getCurrentMode);
  const [partialQty, setPartialQty] = useState<string>(
    item.availableQuantity != null ? String(item.availableQuantity) : ""
  );
  const [qtyError, setQtyError] = useState<string | null>(null);

  // Synchronise local mode and partialQty whenever the item prop changes (e.g. after
  // the cache is invalidated following a successful Apply). Without this, the active
  // button highlight and the partial quantity input would show stale values.
  const { availability, availableQuantity } = item;
  useEffect(() => {
    setMode(getCurrentMode());
    setPartialQty(availableQuantity != null ? String(availableQuantity) : "");
    setQtyError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, availableQuantity]);

  const effectiveQty =
    item.availability === "AVAILABLE" ? (item.availableQuantity ?? item.quantity) : 0;

  function handleModeChange(next: "available" | "partial" | "unavailable") {
    setMode(next);
    setQtyError(null);
    if (next === "partial") {
      setPartialQty(item.availableQuantity != null ? String(item.availableQuantity) : "");
    }
  }

  function handleApply() {
    if (mode === "available") {
      onMark(item, "AVAILABLE", null);
    } else if (mode === "unavailable") {
      onMark(item, "UNAVAILABLE", null);
    } else {
      const n = Number(partialQty);
      if (!partialQty || isNaN(n) || !Number.isInteger(n) || n <= 0) {
        setQtyError("Must be a positive whole number.");
        return;
      }
      if (n >= item.quantity) {
        setQtyError(
          `Must be less than the ordered quantity (${item.quantity}). Use "Available" if the full quantity is available.`
        );
        return;
      }
      setQtyError(null);
      onMark(item, "AVAILABLE", n);
    }
  }

  const availabilityBadge =
    item.availability === "UNAVAILABLE" ? (
      <span
        className="inline-block font-barlow font-medium"
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          padding: "2px 8px",
          borderRadius: "3px",
          background: "rgba(176,92,58,0.08)",
          border: "1px solid rgba(176,92,58,0.25)",
          color: "#b05c3a",
        }}
      >
        Unavailable
      </span>
    ) : item.availableQuantity != null ? (
      <span
        className="inline-block font-barlow font-medium"
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          padding: "2px 8px",
          borderRadius: "3px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.25)",
          color: "#4338ca",
        }}
      >
        Partial ({item.availableQuantity} of {item.quantity})
      </span>
    ) : (
      <span
        className="inline-block font-barlow font-medium"
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          padding: "2px 8px",
          borderRadius: "3px",
          background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.25)",
          color: "#15803d",
        }}
      >
        Available
      </span>
    );

  return (
    <div className="px-6 py-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <p
          className="font-barlow font-medium text-charcoal flex-1 min-w-0"
          style={{ fontSize: "0.87rem" }}
        >
          {item.productName}
          {item.selectedSize && (
            <span className="ml-2 font-light text-warmgray" style={{ fontSize: "0.75rem" }}>
              Size: {item.selectedSize}
            </span>
          )}
          {item.selectedColor && (
            <span className="ml-2 font-light text-warmgray" style={{ fontSize: "0.75rem" }}>
              Colour: {item.selectedColor}
            </span>
          )}
        </p>
        {availabilityBadge}
      </div>

      <p
        className="font-barlow font-light text-warmgray mb-3"
        style={{ fontSize: "0.75rem" }}
      >
        Ordered: {item.quantity}
        {item.availability === "AVAILABLE" && item.availableQuantity != null && (
          <>
            <span className="mx-1.5">·</span>
            <strong className="text-charcoal">Fulfil: {effectiveQty}</strong>
            <span className="ml-1 text-warmgray/70">(original qty preserved as record)</span>
          </>
        )}
        {item.availability === "AVAILABLE" && item.availableQuantity == null && (
          <>
            <span className="mx-1.5">·</span>
            <strong className="text-charcoal">Fulfil: {item.quantity}</strong>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-start gap-2">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("available")}
          className="px-3 py-1.5 rounded font-barlow font-medium uppercase transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            background: mode === "available" ? "rgba(22,163,74,0.12)" : "rgba(28,26,20,0.04)",
            border: mode === "available" ? "1px solid rgba(22,163,74,0.35)" : "1px solid rgba(28,26,20,0.10)",
            color: mode === "available" ? "#15803d" : "var(--warmgray)",
          }}
        >
          Available
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("partial")}
          className="px-3 py-1.5 rounded font-barlow font-medium uppercase transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            background: mode === "partial" ? "rgba(99,102,241,0.10)" : "rgba(28,26,20,0.04)",
            border: mode === "partial" ? "1px solid rgba(99,102,241,0.30)" : "1px solid rgba(28,26,20,0.10)",
            color: mode === "partial" ? "#4338ca" : "var(--warmgray)",
          }}
        >
          Partial
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("unavailable")}
          className="px-3 py-1.5 rounded font-barlow font-medium uppercase transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            background: mode === "unavailable" ? "rgba(176,92,58,0.10)" : "rgba(28,26,20,0.04)",
            border: mode === "unavailable" ? "1px solid rgba(176,92,58,0.30)" : "1px solid rgba(28,26,20,0.10)",
            color: mode === "unavailable" ? "#b05c3a" : "var(--warmgray)",
          }}
        >
          Unavailable
        </button>

        {mode === "partial" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={item.quantity - 1}
                value={partialQty}
                onChange={(e) => {
                  setPartialQty(e.target.value);
                  setQtyError(null);
                }}
                disabled={isUpdating}
                placeholder={`1–${item.quantity - 1}`}
                className="border bg-white px-2.5 py-1.5 font-barlow text-charcoal
                           outline-none transition-colors focus:border-charcoal/40
                           disabled:opacity-60"
                style={{
                  fontSize: "0.82rem",
                  borderColor: qtyError ? "#b05c3a" : "#d4cfc6",
                  borderRadius: "6px",
                  width: "5rem",
                }}
                aria-label={`Available quantity for ${item.productName}`}
              />
              <span
                className="font-barlow font-light text-warmgray"
                style={{ fontSize: "0.72rem" }}
              >
                of {item.quantity}
              </span>
            </div>
            {qtyError && (
              <p className="font-barlow text-red-600" style={{ fontSize: "0.7rem" }}>
                {qtyError}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleApply}
          disabled={isUpdating}
          className="px-4 py-1.5 rounded font-barlow font-medium uppercase transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            background: "var(--gold)",
            color: "var(--charcoal)",
            border: "none",
          }}
          onMouseOver={(e) => {
            if (!isUpdating) {
              e.currentTarget.style.background = "var(--charcoal)";
              e.currentTarget.style.color = "var(--cream)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--gold)";
            e.currentTarget.style.color = "var(--charcoal)";
          }}
        >
          {isUpdating ? "Saving…" : "Apply"}
        </button>
      </div>
    </div>
  );
}

function StatusUpdatePanel({
  order,
  isUpdating,
  onUpdate,
}: {
  order: Order;
  isUpdating: boolean;
  onUpdate: (status: OrderStatus) => void;
}) {
  const [selected, setSelected] = useState<OrderStatus | "">("");
  const allowedNext = VALID_TRANSITIONS[order.status] ?? [];
  const isTerminal = allowedNext.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || isUpdating) return;
    onUpdate(selected as OrderStatus);
    setSelected("");
  }

  return (
    <div
      className="bg-white border border-charcoal/[.06] rounded-lg p-6"
      style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
    >
      <h2
        className="font-bebas tracking-wider text-charcoal mb-4"
        style={{ fontSize: "1.2rem" }}
      >
        Update Status
      </h2>

      <div className="flex items-center gap-2 mb-5">
        <span
          className="font-barlow font-light text-warmgray"
          style={{ fontSize: "0.78rem" }}
        >
          Current:
        </span>
        <StatusBadge status={order.status} />
      </div>

      {isTerminal ? (
        <p
          className="font-barlow font-light text-warmgray"
          style={{ fontSize: "0.82rem" }}
        >
          This order is in a terminal state and cannot be updated further.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-status"
              className="block font-barlow uppercase mb-1.5"
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                color: "var(--warmgray)",
              }}
            >
              Move to
            </label>
            {/* Wrapper keeps the decorative chevron from intercepting pointer events. */}
            <div className="relative">
              <select
                id="new-status"
                value={selected}
                onChange={(e) => setSelected(e.target.value as OrderStatus | "")}
                disabled={isUpdating}
                className="w-full border bg-white px-3 py-2.5 font-barlow text-charcoal
                           outline-none transition-colors focus:border-charcoal/40
                           cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
                           appearance-none"
                style={{
                  fontSize: "0.875rem",
                  borderColor: "#d4cfc6",
                  borderRadius: "6px",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Select new status…</option>
                {allowedNext.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6860" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selected || isUpdating}
            className="w-full px-6 py-2.5 rounded font-barlow font-medium uppercase
                       tracking-widest transition-colors focus-visible:outline
                       focus-visible:outline-2 focus-visible:outline-offset-2
                       focus-visible:outline-gold disabled:opacity-50
                       disabled:cursor-not-allowed cursor-pointer"
            style={{
              fontSize: "0.72rem",
              background: "var(--gold)",
              color: "var(--charcoal)",
              border: "none",
            }}
            onMouseOver={(e) => {
              if (!isUpdating && selected) {
                e.currentTarget.style.background = "var(--charcoal)";
                e.currentTarget.style.color = "var(--cream)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--gold)";
              e.currentTarget.style.color = "var(--charcoal)";
            }}
          >
            {isUpdating ? "Updating…" : "Update Status"}
          </button>
        </form>
      )}
    </div>
  );
}

function OrderDetail({
  order,
  orderId,
  isUpdating,
  onStatusUpdate,
}: {
  order: Order;
  orderId: number;
  isUpdating: boolean;
  onStatusUpdate: (status: OrderStatus) => void;
}) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const isAvailabilityEditable = AVAILABILITY_EDITABLE_STATUSES.includes(order.status);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-white border border-charcoal/[.06] rounded-lg px-5 py-4"
          style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
        >
          <p
            className="font-barlow uppercase text-warmgray mb-1"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            Order ID
          </p>
          <p
            className="font-bebas tracking-wider text-charcoal"
            style={{ fontSize: "1.5rem" }}
          >
            #{order.id}
          </p>
          <p
            className="font-barlow font-light text-warmgray mt-0.5 break-all"
            style={{ fontSize: "0.62rem" }}
          >
            {order.publicToken}
          </p>
        </div>

        <div
          className="bg-white border border-charcoal/[.06] rounded-lg px-5 py-4"
          style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
        >
          <p
            className="font-barlow uppercase text-warmgray mb-1"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            Customer
          </p>
          <p
            className="font-barlow font-medium text-charcoal"
            style={{ fontSize: "0.92rem" }}
          >
            {order.customerName}
          </p>
          <p
            className="font-barlow font-light text-warmgray mt-0.5"
            style={{ fontSize: "0.78rem" }}
          >
            {order.customerPhone}
          </p>
        </div>

        <div
          className="bg-white border border-charcoal/[.06] rounded-lg px-5 py-4"
          style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
        >
          <p
            className="font-barlow uppercase text-warmgray mb-1"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            Date
          </p>
          <p
            className="font-barlow font-medium text-charcoal"
            style={{ fontSize: "0.82rem", lineHeight: 1.5 }}
          >
            {date}
          </p>
        </div>

        <div
          className="bg-white border border-charcoal/[.06] rounded-lg px-5 py-4"
          style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
        >
          <p
            className="font-barlow uppercase text-warmgray mb-2"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            Status
          </p>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div
        className="bg-white border border-charcoal/[.06] rounded-lg p-6"
        style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
      >
        <h2
          className="font-bebas tracking-wider text-charcoal mb-4"
          style={{ fontSize: "1.2rem" }}
        >
          Delivery
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <p
              className="font-barlow uppercase text-warmgray mb-1"
              style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
            >
              Method
            </p>
            <p
              className="font-barlow font-medium text-charcoal"
              style={{ fontSize: "0.88rem" }}
            >
              {order.deliveryMethod === "DELIVERY" ? "Delivery / Waybill" : "Pickup"}
            </p>
          </div>
          {order.deliveryMethod === "DELIVERY" && order.deliveryInfo && (
            <div>
              <p
                className="font-barlow uppercase text-warmgray mb-1"
                style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Delivery Address / Info
              </p>
              <p
                className="font-barlow font-light text-charcoal"
                style={{ fontSize: "0.88rem", maxWidth: "36rem", lineHeight: 1.6 }}
              >
                {order.deliveryInfo}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="bg-white border border-charcoal/[.06] rounded-lg overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
      >
        <div className="px-6 py-4 border-b border-charcoal/[.05]" style={{ background: "var(--archive)" }}>
          <h2
            className="font-bebas tracking-wider text-charcoal"
            style={{ fontSize: "1.2rem" }}
          >
            Order Items
            <span
              className="ml-2 font-barlow font-light text-warmgray"
              style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
            >
              ({order.items.length} {order.items.length === 1 ? "item" : "items"})
            </span>
          </h2>
        </div>

        {order.items.length === 0 ? (
          <p className="px-6 py-8 font-barlow font-light text-warmgray" style={{ fontSize: "0.85rem" }}>
            No items in this order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-charcoal/[.05]">
                  {["Product", "Size", "Color", "Ordered Qty", "Fulfil Qty", "Unit Price", "Subtotal", "Availability"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-barlow font-medium uppercase"
                      style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const unit = Number(item.unitPrice);
                  // Ordered Qty is the original customer quantity (audit record, never changes).
                  // Fulfil Qty is availableQuantity when set, otherwise the original quantity.
                  const effectiveQty =
                    item.availability === "AVAILABLE"
                      ? (item.availableQuantity ?? item.quantity)
                      : 0;
                  const subtotal =
                    item.availability === "AVAILABLE" ? unit * effectiveQty : 0;
                  const isUnavailable = item.availability === "UNAVAILABLE";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-charcoal/[.04] last:border-0"
                      style={{ opacity: isUnavailable ? 0.55 : 1 }}
                    >
                      <td className="px-5 py-3.5">
                        <p
                          className="font-barlow font-medium text-charcoal"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {item.productName}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-barlow font-light text-charcoal" style={{ fontSize: "0.82rem" }}>
                          {item.selectedSize ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-barlow font-light text-charcoal" style={{ fontSize: "0.82rem" }}>
                          {item.selectedColor ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-barlow font-light text-warmgray" style={{ fontSize: "0.82rem" }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-barlow font-medium ${isUnavailable ? "text-warmgray" : "text-charcoal"}`}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {isUnavailable ? "—" : effectiveQty}
                          {item.availableQuantity != null && !isUnavailable && (
                            <span
                              className="ml-1 font-light text-warmgray"
                              style={{ fontSize: "0.72rem" }}
                              title="Partial fill"
                            >
                              ↓
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-barlow font-light text-charcoal" style={{ fontSize: "0.82rem" }}>
                          ₦{unit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-barlow font-medium ${isUnavailable ? "line-through text-warmgray" : "text-charcoal"}`}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {isUnavailable ? "—" : `₦${subtotal.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isUnavailable ? (
                          <span
                            className="inline-block font-barlow font-medium"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "0.06em",
                              padding: "2px 8px",
                              borderRadius: "3px",
                              background: "rgba(176,92,58,0.08)",
                              border: "1px solid rgba(176,92,58,0.25)",
                              color: "#b05c3a",
                            }}
                          >
                            Unavailable
                          </span>
                        ) : item.availableQuantity != null ? (
                          <span
                            className="inline-block font-barlow font-medium"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "0.06em",
                              padding: "2px 8px",
                              borderRadius: "3px",
                              background: "rgba(99,102,241,0.08)",
                              border: "1px solid rgba(99,102,241,0.25)",
                              color: "#4338ca",
                            }}
                          >
                            Partial
                          </span>
                        ) : (
                          <span
                            className="inline-block font-barlow font-medium"
                            style={{
                              fontSize: "0.65rem",
                              letterSpacing: "0.06em",
                              padding: "2px 8px",
                              borderRadius: "3px",
                              background: "rgba(22,163,74,0.08)",
                              border: "1px solid rgba(22,163,74,0.25)",
                              color: "#15803d",
                            }}
                          >
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--archive)" }}>
                  <td
                    colSpan={6}
                    className="px-5 py-3 text-right font-barlow font-medium uppercase"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--warmgray)" }}
                  >
                    Total (available items)
                  </td>
                  <td colSpan={2} className="px-5 py-3">
                    <span
                      className="font-barlow font-bold text-charcoal"
                      style={{ fontSize: "0.88rem" }}
                    >
                      ₦{Number(order.totalAmount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {isAvailabilityEditable && (
        <AvailabilityReviewPanel order={order} orderId={orderId} />
      )}

      <StatusUpdatePanel
        order={order}
        isUpdating={isUpdating}
        onUpdate={onStatusUpdate}
      />
    </div>
  );
}

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  // Next.js 15: params is a Promise, unwrap with React.use().
  const { id: idStr } = use(params);
  const id = Number(idStr);

  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const { isUpdating, handleStatusUpdate } = useOrderMutations();

  return (
    <AdminShell>
      <div className="p-6 md:p-10">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-barlow text-warmgray
                     hover:text-gold transition-colors mb-6"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Orders
        </Link>

        <div className="mb-8">
          <h1
            className="font-bebas tracking-wider text-charcoal leading-none"
            style={{ fontSize: "2rem" }}
          >
            Order Details
          </h1>
          <p
            className="font-barlow font-light text-warmgray mt-1"
            style={{ fontSize: "0.8rem", letterSpacing: "0.08em" }}
          >
            {isNaN(id) ? "—" : `Order #${id}`}
          </p>
        </div>

        {isLoading && <LoadingState message="Loading order…" />}

        {!isLoading && isError && (
          <ErrorState
            message="Could not load this order. It may not exist or an error occurred."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && order && (
          <OrderDetail
            order={order}
            orderId={id}
            isUpdating={isUpdating}
            onStatusUpdate={(status) => handleStatusUpdate(id, status)}
          />
        )}
      </div>
    </AdminShell>
  );
}
