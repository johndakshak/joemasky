import { OrderItem } from "../generated/prisma/client";

export function calculateOrderTotal(items: OrderItem[]): number {
  return items
    .filter(item => item.availability === "AVAILABLE")
    .reduce((total, item) => total + Number(item.unitPrice) * item.quantity, 0);
}