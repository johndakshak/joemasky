"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminClient } from "@/hooks/useAdminClient";
import { getAllOrders } from "@/lib/api/adminOrders";
import { getProducts } from "@/lib/api/product";
import type { Order, OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  /** Optional sub-label shown below the value. */
  note?: string;
  /** Colour of the note text. Defaults to warmgray. */
  noteColor?: string;
}

function StatCard({ label, value, icon, note, noteColor }: StatCardProps) {
  return (
    <div className="admin-stat-card bg-white border border-charcoal/[.06] p-6">
      <div className="flex items-start justify-between mb-4">
        <p
          className="text-[0.62rem] tracking-[0.25em] uppercase font-barlow"
          style={{ color: "var(--warmgray)" }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(200,160,48,0.10)" }}
        >
          {icon}
        </div>
      </div>
      <p className="font-bebas text-[2.2rem] tracking-[0.04em] text-charcoal leading-none">
        {value}
      </p>
      {note && (
        <p
          className="text-[0.65rem] font-barlow mt-2"
          style={{ color: noteColor ?? "var(--warmgray)" }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

// ── Icon helpers (inline SVG, consistent stroke style) ────────────────────────

function OrdersIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AttentionIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function UnavailableIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  PENDING:             { bg: "rgba(200,160,48,0.12)",  color: "#9a7520", label: "Pending" },
  PARTIALLY_CONFIRMED: { bg: "rgba(59,130,246,0.10)",  color: "#2563eb", label: "Part. Confirmed" },
  CONFIRMED:           { bg: "rgba(34,197,94,0.12)",   color: "#16a34a", label: "Confirmed" },
  PROCESSING:          { bg: "rgba(59,130,246,0.12)",  color: "#2563eb", label: "Processing" },
  COMPLETED:           { bg: "rgba(34,197,94,0.12)",   color: "#16a34a", label: "Completed" },
  CANCELLED:           { bg: "rgba(239,68,68,0.10)",   color: "#dc2626", label: "Cancelled" },
  UNAVAILABLE:         { bg: "rgba(239,68,68,0.10)",   color: "#dc2626", label: "Unavailable" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span
      className="inline-block font-barlow font-bold tracking-[0.12em] uppercase"
      style={{
        fontSize: "0.6rem",
        padding: "3px 8px",
        borderRadius: "2px",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

// ── Order stats section ───────────────────────────────────────────────────────

function OrderStatsSection() {
  const client = useAdminClient();

  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: () => {
      if (!client) throw new Error("Not authenticated");
      return getAllOrders(client);
    },
    enabled: !!client,
  });

  if (isLoading) {
    return (
      <div className="col-span-3">
        <LoadingState message="Loading order statistics…" />
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="col-span-3">
        <ErrorState
          message="Could not load order statistics. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const total = orders.length;
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const attention = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PARTIALLY_CONFIRMED"
  ).length;

  return (
    <>
      <StatCard
        label="Total Orders"
        value={total}
        icon={<OrdersIcon />}
        note={total === 0 ? "No orders yet" : `${total} order${total !== 1 ? "s" : ""} placed`}
      />
      <StatCard
        label="Pending"
        value={pending}
        icon={<PendingIcon />}
        note={pending > 0 ? "Awaiting review" : "None pending"}
        noteColor={pending > 0 ? "var(--gold)" : undefined}
      />
      <StatCard
        label="Needs Attention"
        value={attention}
        icon={<AttentionIcon />}
        note={
          attention > 0
            ? "Pending or partially confirmed"
            : "All orders up to date"
        }
        noteColor={attention > 0 ? "#b05c3a" : undefined}
      />
    </>
  );
}

// ── Product stats section ─────────────────────────────────────────────────────

function ProductStatsSection() {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="col-span-2">
        <LoadingState message="Loading product statistics…" />
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="col-span-2">
        <ErrorState
          message="Could not load product statistics. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const total = products.length;
  const unavailable = products.filter((p) => !p.isAvailable).length;

  return (
    <>
      <StatCard
        label="Total Products"
        value={total}
        icon={<ProductsIcon />}
        note={total === 0 ? "No products yet" : `${total} product${total !== 1 ? "s" : ""} listed`}
      />
      <StatCard
        label="Unavailable"
        value={unavailable}
        icon={<UnavailableIcon />}
        note={unavailable > 0 ? "Marked unavailable" : "All products available"}
        noteColor={unavailable > 0 ? "#b05c3a" : undefined}
      />
    </>
  );
}

// ── Recent orders table ───────────────────────────────────────────────────────

function RecentOrdersTable() {
  const client = useAdminClient();

  const { data: orders, isLoading, isError, refetch } = useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: () => {
      if (!client) throw new Error("Not authenticated");
      return getAllOrders(client);
    },
    enabled: !!client,
  });

  if (isLoading) return <LoadingState message="Loading recent orders…" />;

  if (isError || !orders) {
    return (
      <ErrorState
        message="Could not load recent orders."
        onRetry={() => refetch()}
      />
    );
  }

  const recent = orders.slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="px-6 py-10 text-sm text-warmgray font-barlow text-center">
        No orders yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-charcoal/[.05]" style={{ background: "var(--archive)" }}>
            {["Customer", "Delivery", "Status", "Total"].map((h) => (
              <th
                key={h}
                className="text-left font-barlow font-medium px-6 py-3"
                style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--warmgray)", textTransform: "uppercase" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((order) => (
            <tr
              key={order.id}
              className="border-b border-charcoal/[.04]"
              style={{ transition: "background 0.15s" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(200,160,48,0.04)")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "")}
            >
              <td className="px-6 py-3.5">
                <p className="font-barlow font-medium" style={{ fontSize: "0.78rem" }}>
                  {order.customerName}
                </p>
                <p className="font-barlow" style={{ fontSize: "0.65rem", color: "var(--warmgray)" }}>
                  {order.customerPhone}
                </p>
              </td>
              <td className="px-6 py-3.5 font-barlow" style={{ fontSize: "0.72rem", color: "var(--warmgray)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {order.deliveryMethod === "PICKUP" ? "Pickup" : "Delivery"}
              </td>
              <td className="px-6 py-3.5">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-6 py-3.5 font-barlow font-semibold" style={{ fontSize: "0.78rem" }}>
                ₦{Number(order.totalAmount ?? 0).toLocaleString("en-NG")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="p-6 md:p-10">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-bebas text-[1.9rem] md:text-[2.4rem] tracking-[0.06em] leading-none text-charcoal">
            Overview
          </h1>
          <p
            className="font-barlow mt-1"
            style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--warmgray)" }}
          >
            Dashboard Summary
          </p>
        </div>

        {/* Stat cards — orders (3 cols) + products (2 cols).
            Each group loads and fails independently. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <OrderStatsSection />
          <ProductStatsSection />
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-charcoal/[.06]">
          <div
            className="px-6 py-4 border-b border-charcoal/[.06] flex items-center justify-between"
          >
            <h2 className="font-bebas text-[1.1rem] tracking-[0.08em]">
              Recent Orders
            </h2>
            <p
              className="font-barlow"
              style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warmgray)" }}
            >
              Latest 5
            </p>
          </div>
          <RecentOrdersTable />
        </div>

      </div>
    </AdminShell>
  );
}
