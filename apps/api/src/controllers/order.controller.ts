import { CreateOrderInput } from "../types/order.types";
import { Request, Response } from "express";
import { validateName, validatePhone } from "../utils/validation";
import * as orderService from "../services/order.service"

// CREATE ORDER
export async function create(req: Request, res: Response) {

  try {

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
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
      return res.status(400).json({
        success: false,
        message: "items must be a non-empty array"
      });
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

    const orderInput: CreateOrderInput = {
      customerName,
      customerPhone,
      deliveryMethod,
      deliveryInfo,
      items,
    };

    const order = await orderService.createOrder(orderInput, products);

    return res.status(201).json({
      success: true,
      data: order
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
}

// GET ORDER BY PUBLIC TOKEN
export async function getByPublicToken(req: Request, res: Response) {

  try {

    const { publicToken } = req.params;

    if (typeof publicToken !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid order token"
        });
    }    

    const order = await orderService.findOrderByPublicToken(publicToken);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
}