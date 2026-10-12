import { DeliveryMethod } from "../generated/prisma/client";

export interface OrderItemInput {
  productId: number;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryInfo?: string;
  items: OrderItemInput[];
}