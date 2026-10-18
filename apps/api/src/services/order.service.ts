import { prisma } from "../lib/prisma";
import { CreateOrderInput } from "../types/order.types";
import { Product, OrderStatus, ItemAvailability } from "../generated/prisma/client";

export async function findProductsByIds(productIds: number[]) {
  return prisma.product.findMany({
    where: { id: { in: productIds } },
  });
}

export async function createOrder(input: CreateOrderInput, products: Product[]) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryMethod: input.deliveryMethod,
        deliveryInfo: input.deliveryInfo,
      },
    });

    for (const item of input.items) {
      const product = products.find(p => p.id === item.productId)!;

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize ?? null,
          selectedColor: item.selectedColor ?? null,
        },
      });
    }

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
  });
}

export async function findOrderByPublicToken(publicToken: string) {
  return prisma.order.findUnique({
    where: { publicToken },
    include: { items: true },
  });
}

export async function findAllOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

// The original `quantity` is never modified — it is the audit record of what
// the customer ordered. availableQuantity records the effective fulfilment
// quantity when the shop can only partially fill an item.
// Re-reads the order inside the transaction to reject concurrent status changes.
export async function markItemAvailability(
  orderId: number,
  itemId: number,
  availability: ItemAvailability,
  availableQuantity?: number | null
) {
  return prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
    const reviewableStatuses: OrderStatus[] = ["PENDING", "UNAVAILABLE", "PARTIALLY_CONFIRMED"];

    if (!currentOrder || !reviewableStatuses.includes(currentOrder.status as OrderStatus)) {
      throw new Error("ORDER_STATE_CHANGED");
    }

    const item = await tx.orderItem.findUnique({ where: { id: itemId } });

    if (!item || item.orderId !== orderId) {
      throw new Error("ITEM_NOT_IN_ORDER");
    }

    const effectiveAvailableQty =
      availability === "AVAILABLE" && availableQuantity != null ? availableQuantity : null;

    return tx.orderItem.update({
      where: { id: itemId },
      data: { availability, availableQuantity: effectiveAvailableQty },
    });
  });
}

// Recalculates order status from item availabilities:
//   all AVAILABLE (full qty) → CONFIRMED
//   all UNAVAILABLE          → UNAVAILABLE
//   any unavailable or partial fill → PARTIALLY_CONFIRMED
// Bypasses the controller's transition guard by design — source-state validation is done here.
export async function reviewOrder(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return null;

  if (order.items.length === 0) {
    throw new Error("ORDER_HAS_NO_ITEMS");
  }

  const reviewableStatuses: OrderStatus[] = ["PENDING", "UNAVAILABLE", "PARTIALLY_CONFIRMED"];
  if (!reviewableStatuses.includes(order.status as OrderStatus)) {
    throw new Error("ORDER_NOT_REVIEWABLE");
  }

  const allUnavailable = order.items.every((item) => item.availability === "UNAVAILABLE");

  // An item is "fully confirmed" only when it is AVAILABLE with no partial-fill reduction.
  // Items that are AVAILABLE but have availableQuantity set are partial fills and require
  // customer acceptance before they are confirmed.
  const allFullyAvailable = order.items.every(
    (item) => item.availability === "AVAILABLE" && item.availableQuantity == null
  );

  const newStatus: OrderStatus = allFullyAvailable
    ? "CONFIRMED"
    : allUnavailable
    ? "UNAVAILABLE"
    : "PARTIALLY_CONFIRMED";

  return updateOrderStatus(orderId, newStatus);
}

export async function respondToOrder(publicToken: string, decision: "ACCEPT" | "DECLINE") {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { publicToken } });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== "PARTIALLY_CONFIRMED") throw new Error("ORDER_NOT_REVIEWABLE");

    const newStatus = decision === "ACCEPT" ? "CONFIRMED" : "CANCELLED";

    return tx.order.update({
      where: { publicToken },
      data: { status: newStatus },
      include: { items: true },
    });
  });
}
