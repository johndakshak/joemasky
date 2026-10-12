import { prisma } from "../lib/prisma";
import { CreateOrderInput } from "../types/order.types";
import { Product } from "../generated/prisma/client";
import { OrderStatus } from "../generated/prisma/client";
import { ItemAvailability } from "../generated/prisma/client";


// FIND PRODUCTS BY ID's (ARRAY OF PRODUCT ID's)
export async function findProductsByIds(productIds: number[]) {
  return prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });
}

// CREATE ORDER
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

// FIND ORDER BY PUBLIC TOKEN
export async function findOrderByPublicToken(publicToken: string) {
  return prisma.order.findUnique({
    where: { publicToken },
    include: { items: true },
  });
}

// FIND ALL ORDERS
export async function findAllOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

// FIND ORDERS BY ID
export async function findOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

// UPDATE ORDER STATUS (ADMIN)
export async function updateOrderStatus(id: number, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

// MARK ITEM AVAILABILITY
export async function markItemAvailability(
  orderId: number,
  itemId: number,
  availability: ItemAvailability
) {
  return prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({ where: { id: orderId } });

    if (!currentOrder || (currentOrder.status !== "PENDING" && currentOrder.status !== "UNAVAILABLE")) {
      throw new Error("ORDER_STATE_CHANGED");
    }

    const item = await tx.orderItem.findUnique({ where: { id: itemId } });

    if (!item || item.orderId !== orderId) {
      throw new Error("ITEM_NOT_IN_ORDER");
    }

    return tx.orderItem.update({
      where: { id: itemId },
      data: { availability },
    });
  });
}

// REVIEW ORDER (ADMIN)
export async function reviewOrder(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return null;
  }

  if (order.items.length === 0) {
    throw new Error("ORDER_HAS_NO_ITEMS");
  }  

  const allAvailable = order.items.every((item) => item.availability === "AVAILABLE");
  const allUnavailable = order.items.every((item) => item.availability === "UNAVAILABLE");

  let newStatus: OrderStatus;

  if (allAvailable) {
    newStatus = "CONFIRMED";
  } else if (allUnavailable) {
    newStatus = "UNAVAILABLE";
  } else {
    newStatus = "PARTIALLY_CONFIRMED";
  }

  return updateOrderStatus(orderId, newStatus);
}

// RESPOND TO ORDER (CUSTOMER)
export async function respondToOrder(publicToken: string, decision: "ACCEPT" | "DECLINE") {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { publicToken } });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (order.status !== "PARTIALLY_CONFIRMED") {
      throw new Error("ORDER_NOT_REVIEWABLE");
    }

    const newStatus = decision === "ACCEPT" ? "CONFIRMED" : "CANCELLED";

    return tx.order.update({
      where: { publicToken },
      data: { status: newStatus },
      include: { items: true },      
    });
  });
}