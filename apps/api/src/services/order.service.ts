import { prisma } from "../lib/prisma";
import { CreateOrderInput } from "../types/order.types";
import { Product } from "../generated/prisma/client";


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