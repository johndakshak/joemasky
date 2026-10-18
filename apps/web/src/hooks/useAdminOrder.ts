"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/useAdminClient";
import { getOrderById } from "@/lib/api/adminOrders";

export function useAdminOrder(id: number) {
  const client = useAdminClient();

  return useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => getOrderById(client!, id),
    enabled: !!client && !isNaN(id),
  });
}
