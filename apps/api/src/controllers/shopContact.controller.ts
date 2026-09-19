import { Request, Response } from "express";

export async function getShopContact(req: Request, res: Response) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        whatsapp: process.env.SHOP_WHATSAPP_NUMBER,
        phone: process.env.SHOP_PHONE_NUMBER,
      }
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop contact info"
    });
  }
}