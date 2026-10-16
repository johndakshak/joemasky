import { Request, Response, NextFunction } from "express";

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: not enough privileges"
    });
  }

  next();
}