"use client";

import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import type { Order, OrderStatus } from "@/types/order";

// ── Status badge ─────────────────────────────────────────────────────────────

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
        fontSize: "0.65rem",
        letterSpacing: "0.08em",
        padding: "2px 8px",
        borderRadius: "3px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ── Delivery badge ────────────────────────────────────────────────────────────

function DeliveryBadge({ method }: { method: "PICKUP" | "DELIVERY" }) {
  const isDelivery = method === "DELIVERY";
  return (
    <span
      className="inline-block font-barlow font-medium"
      style={{
        fontSize: "0.65rem",
        letterSpacing: "0.08em",
        padding: "2px 8px",
        borderRadius: "3px",
        background: isDelivery
          ? "rgba(37,99,235,0.07)"
          : "rgba(28,26,20,0.06)",
        border: isDelivery
          ? "1px solid rgba(37,99,235,0.22)"
          : "1px solid rgba(28,26,20,0.14)",
        color: isDelivery ? "#1d4ed8" : "var(--charcoal)",
        whiteSpace: "nowrap",
      }}
    >
      {isDelivery ? "Delivery" : "Pickup"}
    </span>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const itemCount = order.items?.length ?? 0;

  return (
    <tr className="border-b border-charcoal/[.05] hover:bg-archive/40 transition-colors">
      {/* Order ID */}
      <td className="px-5 py-3.5">
        <span
          className="font-barlow font-medium text-charcoal"
          style={{ fontSize: "0.82rem" }}
        >
          #{order.id}
        </span>
      </td>

      {/* Customer */}
      <td className="px-5 py-3.5">
        <p
          className="font-barlow font-medium text-charcoal"
          style={{ fontSize: "0.85rem" }}
        >
          {order.customerName}
        </p>
        <p
          className="font-barlow font-light text-warmgray mt-0.5"
          style={{ fontSize: "0.72rem" }}
        >
          {order.customerPhone}
        </p>
      </td>

      {/* Date */}
      <td className="px-5 py-3.5 hidden md:table-cell">
        <span
          className="font-barlow font-light text-charcoal"
          style={{ fontSize: "0.82rem" }}
        >
          {date}
        </span>
      </td>

      {/* Items */}
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span
          className="font-barlow font-light text-charcoal"
          style={{ fontSize: "0.82rem" }}
        >
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </td>

      {/* Total */}
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span
          className="font-barlow font-medium text-charcoal"
          style={{ fontSize: "0.85rem" }}
        >
          ₦{Number(order.totalAmount).toLocaleString()}
        </span>
      </td>

      {/* Delivery */}
      <td className="px-5 py-3.5 hidden lg:table-cell">
        <DeliveryBadge method={order.deliveryMethod} />
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <StatusBadge status={order.status} />
      </td>

      {/* Action */}
      <td className="px-5 py-3.5">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 font-barlow font-medium uppercase
                     tracking-widest transition-colors hover:text-gold focus-visible:outline
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-gold"
          style={{ fontSize: "0.65rem", color: "var(--charcoal)" }}
        >
          View
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </td>
    </tr>
  );
}

// ── Table column headers ──────────────────────────────────────────────────────

const TABLE_HEADERS = [
  { label: "Order",    className: "" },
  { label: "Customer", className: "" },
  { label: "Date",     className: "hidden md:table-cell" },
  { label: "Items",    className: "hidden sm:table-cell" },
  { label: "Total",    className: "hidden sm:table-cell" },
  { label: "Delivery", className: "hidden lg:table-cell" },
  { label: "Status",   className: "" },
  { label: "Actions",  className: "" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useAdminOrders();

  return (
    <AdminShell>
      <div className="p-6 md:p-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1
              className="font-bebas tracking-wider text-charcoal leading-none"
              style={{ fontSize: "2rem" }}
            >
              Orders
            </h1>
            <p
              className="font-barlow font-light text-warmgray mt-1"
              style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
            >
              {isLoading
                ? "Loading…"
                : orders
                ? `${orders.length} order${orders.length !== 1 ? "s" : ""}`
                : ""}
            </p>
          </div>
        </div>

        {isLoading && <LoadingState message="Loading orders…" />}

        {isError && (
          <ErrorState
            message="Could not load orders. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && orders && orders.length === 0 && (
          <EmptyState
            title="No Orders Yet"
            description="Customer orders will appear here once they start coming in."
          />
        )}

        {!isLoading && !isError && orders && orders.length > 0 && (
          <div className="bg-white border border-charcoal/[.06] overflow-x-auto rounded-lg">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr
                  className="border-b border-charcoal/[.05]"
                  style={{ background: "var(--archive)" }}
                >
                  {TABLE_HEADERS.map(({ label, className }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-left font-barlow font-medium uppercase ${className}`}
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        color: "var(--warmgray)",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
