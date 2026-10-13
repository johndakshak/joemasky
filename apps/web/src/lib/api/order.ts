import { apiClient } from "./client";
import type { CreateOrderInput, Order } from "@/types/order";

export function createOrder(data: CreateOrderInput): Promise<Order> {
  return apiClient<Order>("/create/order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrderByToken(publicToken: string): Promise<Order> {
  return apiClient<Order>(`/order/${publicToken}`);
}

// Customer accept/decline — only valid when order status is PARTIALLY_CONFIRMED.
// Both endpoints take no request body; they identify the order by publicToken.

export function acceptOrder(publicToken: string): Promise<Order> {
  return apiClient<Order>(`/order/${publicToken}/accept`, { method: "POST" });
}

export function declineOrder(publicToken: string): Promise<Order> {
  return apiClient<Order>(`/order/${publicToken}/decline`, { method: "POST" });
}