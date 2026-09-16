import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as adminService from "../services/superAdmin.service";
import { validateEmail, validateName, validatePassword } from "../utils/validation";
import { Prisma } from "../generated/prisma/client";


// GENERATE INVITE
export async function generateInvite(req: Request, res: Response) {

  try {

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const INVITE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    const invite = await adminService.createInvite(req.admin.id, expiresAt);

    return res.status(201).json({
      success: true,
      data: {
        token: invite.token,
        expiresAt: invite.expiresAt
      }
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate invite"
    });
  }
}

// FREEZE ADMIN
export async function freezeAdmin(req: Request, res: Response) {

  try {

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const targetId = Number(req.params.id);

    if (isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID"
      });
    }

    if (req.admin.id === targetId) {
      return res.status(400).json({
        success: false,
        message: "You cannot freeze your own account"
      });
    }

    const updatedAdmin = await adminService.updateAdminStatus(targetId, false);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
      }
    });

  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to freeze admin"
    });
  }
}

// UNFREEZE ADMIN
export async function unfreezeAdmin(req: Request, res: Response) {

  try {

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const targetId = Number(req.params.id);

    if (isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID"
      });
    }

    const updatedAdmin = await adminService.updateAdminStatus(targetId, true);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
      }
    });

  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to unfreeze admin"
    });
  }
}