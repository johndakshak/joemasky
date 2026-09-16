import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as adminService from "../services/admin.service";
import { validateEmail, validateName, validatePassword } from "../utils/validation";
import { Prisma } from "../generated/prisma/client";


// REGISTER ADMIN
export async function register(req: Request, res: Response) {

  try {

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }

    const { name, email, password, inviteToken } = req.body;

    const nameError = validateName(name);
    if (nameError) {
    return res.status(400).json({ success: false, message: nameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
    return res.status(400).json({ success: false, message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
    }
    
    if (!inviteToken || typeof inviteToken !== "string") {
        return res.status(400).json({
        success: false,
        message: "inviteToken is required"
        });
    }

    const invite = await adminService.findInviteByToken(inviteToken);

    if (!invite) {
      return res.status(400).json({
        success: false,
        message: "Invalid invite token"
      });
    }

    if (invite.usedAt) {
      return res.status(400).json({
        success: false,
        message: "This invite has already been used"
      });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This invite has expired"
      });
    }

    const existingAdmin = await adminService.findAdminByEmail(email);

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await adminService.createAdmin({
      name,
      email,
      password: hashedPassword,
    });

    await adminService.markInviteAsUsed(inviteToken, newAdmin.id);

    return res.status(201).json({
      success: true,
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      }
    });

  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register admin"
    });
  }
}


