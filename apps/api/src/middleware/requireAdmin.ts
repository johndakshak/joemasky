import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminPayload } from "../types/admin.types";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AdminPayload;
    
    req.admin = decoded;
    next();
  }
  catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}