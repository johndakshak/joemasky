import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByToken } from "@/lib/api/order";
import { ApiError } from "@/lib/api/client";
import { OrderView } from "./OrderView";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Your Order — JoeMasky",
  description: "Track and manage your JoeMasky order.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
//
// Server component: fetches the order once at request time.
// Renders notFound() for unknown or invalid tokens (404 → Next.js 404 page).
// Passes the verified order to OrderView, a client component that holds live
// state so Accept/Decline actions can update the display without a full reload.

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let order;
  try {
    order = await getOrderByToken(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    // For any other error (network, 500) re-throw so Next.js renders the
    // error boundary rather than a silent blank page.
    throw err;
  }

  return <OrderView initialOrder={order} />;
}
