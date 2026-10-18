import { CreateOrderInput } from "../types/order.types";
import { Request, Response } from "express";
import { validateName, validatePhone } from "../utils/validation";
import * as orderService from "../services/order.service"
import { Prisma } from "../generated/prisma/client";
import { calculateOrderTotal } from "../utils/order";

export async function createOrder(req: Request, res: Response) {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { customerName, customerPhone, deliveryMethod, deliveryInfo, items } = req.body;

    const nameError = validateName(customerName);
    if (nameError) {
      return res.status(400).json({ success: false, message: nameError });
    }

    const phoneError = validatePhone(customerPhone);
    if (phoneError) {
      return res.status(400).json({ success: false, message: phoneError });
    }

    if (deliveryMethod !== "PICKUP" && deliveryMethod !== "DELIVERY") {
      return res.status(400).json({
        success: false,
        message: "deliveryMethod must be PICKUP or DELIVERY"
      });
    }

    if (deliveryMethod === "DELIVERY" && (!deliveryInfo || typeof deliveryInfo !== "string")) {
      return res.status(400).json({
        success: false,
        message: "deliveryInfo is required when deliveryMethod is DELIVERY"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items must be a non-empty array" });
    }

    for (const item of items) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.productId !== "number" ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid productId and a positive quantity"
        });
      }
    }

    const productIds = items.map((item: any) => item.productId);
    const products = await orderService.findProductsByIds(productIds);

    const foundIds = products.map(p => p.id);
    const missingIds = productIds.filter((id: number) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some products do not exist: ${missingIds.join(", ")}`
      });
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;

      if (product.sizes.length > 0) {
        if (!item.selectedSize || typeof item.selectedSize !== "string") {
          return res.status(400).json({
            success: false,
            message: `A size selection is required for product: ${product.name}`
          });
        }
        if (!product.sizes.includes(item.selectedSize)) {
          return res.status(400).json({
            success: false,
            message: `Invalid size "${item.selectedSize}" for product: ${product.name}`
          });
        }
      }

      if (product.colors.length > 0) {
        if (!item.selectedColor || typeof item.selectedColor !== "string") {
          return res.status(400).json({
            success: false,
            message: `A color selection is required for product: ${product.name}`
          });
        }
        if (!product.colors.includes(item.selectedColor)) {
          return res.status(400).json({
            success: false,
            message: `Invalid color "${item.selectedColor}" for product: ${product.name}`
          });
        }
      }
    }

    const orderInput: CreateOrderInput = {
      customerName,
      customerPhone,
      deliveryMethod,
      deliveryInfo,
      items,
    };

    const order = await orderService.createOrder(orderInput, products);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }

    return res.status(201).json({
      success: true,
      data: { ...order, totalAmount: calculateOrderTotal(order.items) }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create order" });
  }
}

export async function getOrderByPublicToken(req: Request, res: Response) {
  try {
    const { publicToken } = req.params;

    if (typeof publicToken !== "string") {
      return res.status(400).json({ success: false, message: "Invalid order token" });
    }

    const order = await orderService.findOrderByPublicToken(publicToken);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      data: { ...order, totalAmount: calculateOrderTotal(order.items) }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const orders = await orderService.findAllOrders();

    const ordersWithTotals = orders.map(order => ({
      ...order,
      totalAmount: calculateOrderTotal(order.items),
    }));

    return res.status(200).json({ success: true, data: ordersWithTotals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await orderService.findOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      data: { ...order, totalAmount: calculateOrderTotal(order.items) }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { status } = req.body;

    const validStatuses = [
      "PENDING", "PARTIALLY_CONFIRMED", "CONFIRMED",
      "PROCESSING", "COMPLETED", "CANCELLED", "UNAVAILABLE",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const existingOrder = await orderService.findOrderById(id);

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "PARTIALLY_CONFIRMED", "CANCELLED", "UNAVAILABLE"],
      PARTIALLY_CONFIRMED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
      UNAVAILABLE: ["CANCELLED"],
    };

    if (status === existingOrder.status) {
      return res.status(409).json({ success: false, message: `Order is already ${status}` });
    }

    const allowedNext = validTransitions[existingOrder.status];

    if (!allowedNext.includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot change status from ${existingOrder.status} to ${status}`
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
}

export async function markItemAvailability(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.orderId);
    const itemId = Number(req.params.itemId);

    if (isNaN(orderId) || isNaN(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID or item ID" });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    const { availability, availableQuantity } = req.body;

    if (availability !== "AVAILABLE" && availability !== "UNAVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "availability must be either AVAILABLE or UNAVAILABLE"
      });
    }

    if (availableQuantity != null && availability === "UNAVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "availableQuantity cannot be set when availability is UNAVAILABLE"
      });
    }

    if (availableQuantity != null) {
      if (
        typeof availableQuantity !== "number" ||
        !Number.isInteger(availableQuantity) ||
        availableQuantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "availableQuantity must be a positive integer"
        });
      }
    }

    const order = await orderService.findOrderById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const reviewableStatuses = ["PENDING", "UNAVAILABLE", "PARTIALLY_CONFIRMED"];
    if (!reviewableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Availability can only be edited while the order is Pending, Unavailable, or Partially Confirmed"
      });
    }

    if (availableQuantity != null) {
      const item = order.items.find((i) => i.id === itemId);
      if (item && availableQuantity >= item.quantity) {
        return res.status(400).json({
          success: false,
          message: "availableQuantity must be less than the ordered quantity — use availability AVAILABLE without availableQuantity if the full quantity is available"
        });
      }
    }

    const item = await orderService.markItemAvailability(orderId, itemId, availability, availableQuantity ?? null);

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_STATE_CHANGED") {
      return res.status(409).json({
        success: false,
        message: "Order status changed before update could complete — please retry"
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (error instanceof Error && error.message === "ITEM_NOT_IN_ORDER") {
      return res.status(404).json({ success: false, message: "Item not found in this order" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update item availability" });
  }
}

export async function reviewOrder(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const updatedOrder = await orderService.reviewOrder(orderId);

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_HAS_NO_ITEMS") {
      return res.status(400).json({ success: false, message: "Cannot review an order with no items" });
    }

    if (error instanceof Error && error.message === "ORDER_NOT_REVIEWABLE") {
      return res.status(409).json({
        success: false,
        message: "Order cannot be reviewed in its current state — only Pending, Unavailable, or Partially Confirmed orders can be finalised"
      });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to review order" });
  }
}

export async function acceptOrder(req: Request, res: Response) {
  try {
    const { publicToken } = req.params;

    if (typeof publicToken !== "string") {
      return res.status(400).json({ success: false, message: "Invalid order token" });
    }

    const order = await orderService.respondToOrder(publicToken, "ACCEPT");

    return res.status(200).json({
      success: true,
      data: { ...order, totalAmount: calculateOrderTotal(order.items) }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (error instanceof Error && error.message === "ORDER_NOT_REVIEWABLE") {
      return res.status(409).json({ success: false, message: "This order is not awaiting confirmation" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to accept order" });
  }
}

export async function declineOrder(req: Request, res: Response) {
  try {
    const { publicToken } = req.params;

    if (typeof publicToken !== "string") {
      return res.status(400).json({ success: false, message: "Invalid order token" });
    }

    const order = await orderService.respondToOrder(publicToken, "DECLINE");

    return res.status(200).json({
      success: true,
      data: { ...order, totalAmount: calculateOrderTotal(order.items) }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (error instanceof Error && error.message === "ORDER_NOT_REVIEWABLE") {
      return res.status(409).json({ success: false, message: "This order is not awaiting confirmation" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to decline order" });
  }
}
