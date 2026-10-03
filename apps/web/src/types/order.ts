export type DeliveryMethod = "PICKUP" | "DELIVERY";
export type OrderStatus = "PENDING" | "PARTIALLY_CONFIRMED" | "CONFIRMED" | "UNAVAILABLE" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type ItemAvailability = "AVAILABLE" | "UNAVAILABLE";

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

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  availability: ItemAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  publicToken: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryInfo: string | null;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}