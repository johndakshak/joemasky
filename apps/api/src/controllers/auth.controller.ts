import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

// ADMIN LOGIN (AUTHENTICATION)
export async function login(req: Request, res: Response) {

  try {

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }

    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required"
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required"
      });
    }    

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password is required"
      });
    }     

    const admin = await adminService.findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        }
      }
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to log in"
    });
  }
}
