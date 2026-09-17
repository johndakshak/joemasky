import { DeliveryMethod } from "../generated/prisma/client";

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryInfo?: string;
  items: OrderItemInput[];
}