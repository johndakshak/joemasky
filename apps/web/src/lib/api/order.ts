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