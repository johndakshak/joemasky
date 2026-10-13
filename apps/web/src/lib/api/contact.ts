import { apiClient } from "./client";
import type { ShopContact, OrderContactLinks } from "@/types/contact";

// GET /shop/contact
// Returns the shop's general WhatsApp and phone numbers (bare numbers).
export function getShopContact(): Promise<ShopContact> {
  return apiClient<ShopContact>("/shop/contact");
}

// GET /order/:publicToken/contact-shop
// Returns fully formed contact URLs pre-filled with an order-specific message.
export function getOrderContactLinks(publicToken: string): Promise<OrderContactLinks> {
  return apiClient<OrderContactLinks>(`/order/${publicToken}/contact-shop`);
}
