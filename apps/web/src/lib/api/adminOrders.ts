import type { Order } from "@/types/order";

type AuthenticatedClient = <T>(path: string, options?: RequestInit) => Promise<T>;

/**
 * getAllOrders
 *
 * Fetches all orders for the admin dashboard.
 * GET /admin/Orders
 *
 * Requires an authenticated client from useAdminClient().
 * Returns an Order array sorted by createdAt desc (server-side).
 * Each order includes a server-computed totalAmount (available items only).
 */
export async function getAllOrders(client: AuthenticatedClient): Promise<Order[]> {
  return client<Order[]>("/admin/Orders");
}

/**
 * getOrderById
 *
 * Fetches a single order by database ID.
 * GET /admin/order/:id
 *
 * Requires an authenticated client from useAdminClient().
 */
export async function getOrderById(
  client: AuthenticatedClient,
  id: number
): Promise<Order> {
  return client<Order>(`/admin/order/${id}`);
}
