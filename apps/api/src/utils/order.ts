import { OrderItem } from "../generated/prisma/client";

// Uses availableQuantity ?? quantity for AVAILABLE items so partial fills are reflected correctly.
export function calculateOrderTotal(items: OrderItem[]): number {
  return items
    .filter((item) => item.availability === "AVAILABLE")
    .reduce((total, item) => {
      const effectiveQty = item.availableQuantity ?? item.quantity;
      return total + Number(item.unitPrice) * effectiveQty;
    }, 0);
}
