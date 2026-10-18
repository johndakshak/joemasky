import type { Order, OrderItem, OrderStatus } from "@/types/order";

type AuthenticatedClient = <T>(path: string, options?: RequestInit) => Promise<T>;

export async function getAllOrders(client: AuthenticatedClient): Promise<Order[]> {
  return client<Order[]>("/admin/Orders");
}

export async function getOrderById(
  client: AuthenticatedClient,
  id: number
): Promise<Order> {
  return client<Order>(`/admin/order/${id}`);
}

export async function updateOrderStatus(
  client: AuthenticatedClient,
  id: number,
  status: OrderStatus
): Promise<Order> {
  return client<Order>(`/admin/orderStatus/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// availableQuantity is only sent for AVAILABLE items; UNAVAILABLE + quantity is rejected by the API.
export async function markItemAvailability(
  client: AuthenticatedClient,
  orderId: number,
  itemId: number,
  availability: "AVAILABLE" | "UNAVAILABLE",
  availableQuantity?: number | null
): Promise<OrderItem> {
  const body: Record<string, unknown> = { availability };
  if (availability === "AVAILABLE" && availableQuantity != null) {
    body.availableQuantity = availableQuantity;
  }
  return client<OrderItem>(`/order/${orderId}/items/${itemId}/availability`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function finaliseReview(
  client: AuthenticatedClient,
  orderId: number
): Promise<Order> {
  return client<Order>(`/order/${orderId}/review-orders`, {
    method: "POST",
  });
}
