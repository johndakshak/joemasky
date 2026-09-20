import { Request, Response } from "express";
import * as orderService from "../services/order.service"


export async function getContactLinks(req: Request, res: Response) {

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

    const orderLink = `${process.env.FRONTEND_URL}/orders/${publicToken}`;
    const message = `Hi, I just placed an order. Check it out here: ${orderLink}`;
    const encodedMessage = encodeURIComponent(message);

    const shopWhatsapp = process.env.SHOP_WHATSAPP_NUMBER;
    const shopPhone = process.env.SHOP_PHONE_NUMBER;

    return res.status(200).json({
      success: true,
      data: {
        whatsapp: `https://wa.me/${shopWhatsapp}?text=${encodedMessage}`,
        call: `tel:+${shopPhone}`,
        sms: `sms:+${shopPhone}?body=${encodedMessage}`,
      }
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate contact links"
    });
  }
}