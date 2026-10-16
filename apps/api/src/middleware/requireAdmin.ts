import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminPayload } from "../types/admin.types";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded: AdminPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AdminPayload;
  }
  catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  // Confirm the admin still exists and has not been frozen since the token
  // was issued. Only the isActive flag is fetched — nothing sensitive.
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { isActive: true },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
  }
  catch (error) {
    console.error("requireAdmin: database error during account check", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }

  req.admin = decoded;
  next();
}