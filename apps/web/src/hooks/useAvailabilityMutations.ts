"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminClient } from "@/hooks/useAdminClient";
import { markItemAvailability, finaliseReview } from "@/lib/api/adminOrders";
import { ApiError } from "@/lib/api/client";
import type { OrderItem } from "@/types/order";

export function useAvailabilityMutations(orderId: number) {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  const [updatingItem, setUpdatingItem] = useState<Record<number, boolean>>({});
  const [finalisingReview, setFinalisingReview] = useState(false);

  async function handleMarkAvailability(
    item: OrderItem,
    availability: "AVAILABLE" | "UNAVAILABLE",
    availableQuantity?: number | null
  ) {
    if (!client || updatingItem[item.id]) return;

    setUpdatingItem((prev) => ({ ...prev, [item.id]: true }));
    try {
      await markItemAvailability(client, orderId, item.id, availability, availableQuantity);
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] });
      toast.success(
        availability === "UNAVAILABLE"
          ? `Marked ${item.productName} as unavailable.`
          : availableQuantity != null
          ? `Marked ${item.productName} as partially available (qty: ${availableQuantity}).`
          : `Marked ${item.productName} as available.`
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message || "Failed to update item availability."
          : "Unable to connect. Check your internet connection."
      );
    } finally {
      setUpdatingItem((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  async function handleFinaliseReview() {
    if (!client || finalisingReview) return;

    setFinalisingReview(true);
    try {
      await finaliseReview(client, orderId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] }),
      ]);
      toast.success("Review finalised. Order status has been updated.");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(
          err.status === 409 || err.status === 400
            ? err.message || "Cannot finalise review."
            : "Failed to finalise review. Please try again."
        );
      } else {
        toast.error("Unable to connect. Check your internet connection.");
      }
    } finally {
      setFinalisingReview(false);
    }
  }

  return {
    updatingItem,
    finalisingReview,
    handleMarkAvailability,
    handleFinaliseReview,
  };
}
