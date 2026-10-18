"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/useAdminClient";
import { getAllOrders } from "@/lib/api/adminOrders";

export function useAdminOrders() {
  const client = useAdminClient();

  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => getAllOrders(client!),
    enabled: !!client,
  });
}
