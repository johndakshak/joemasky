"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminClient } from "@/hooks/useAdminClient";
import { updateOrderStatus } from "@/lib/api/adminOrders";
import { ApiError } from "@/lib/api/client";
import type { OrderStatus } from "@/types/order";

export function useOrderMutations() {
  const client = useAdminClient();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  async function invalidateOrders(orderId: number) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] }),
    ]);
  }

  async function handleStatusUpdate(
    orderId: number,
    status: OrderStatus,
    onSuccess?: () => void
  ) {
    if (!client || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(client, orderId, status);
      toast.success(`Order status updated to ${formatStatus(status)}.`);
      await invalidateOrders(orderId);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 409:
            toast.error(err.message || "This status change is not allowed.");
            break;
          case 404:
            toast.error("Order not found.");
            break;
          case 400:
            toast.error(err.message || "Invalid status value.");
            break;
          default:
            toast.error("Failed to update order status. Please try again.");
        }
      } else {
        toast.error("Unable to connect. Check your internet connection.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return { isUpdating, handleStatusUpdate };
}

function formatStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    PARTIALLY_CONFIRMED: "Partially Confirmed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    UNAVAILABLE: "Unavailable",
  };
  return labels[status] ?? status;
}
