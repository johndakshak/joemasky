import { Request, Response } from "express";
import * as superAdminService from "../services/superAdmin.service";
import { Prisma } from "../generated/prisma/client";

// LIST ALL ADMINS
export async function listAdmins(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admins = await superAdminService.findAllAdmins();

    return res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch admins" });
  }
}

// GENERATE INVITE
// Generates a cryptographically secure 32-byte random token.
// Only the SHA-256 hash is persisted — the raw token is returned once to
// the Super Admin and never stored, so a database breach cannot be used to
// accept invitations.
export async function generateInvite(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    const { rawToken, tokenHash } = superAdminService.generateTokenPair();

    await superAdminService.createInvite(req.admin.id, tokenHash, expiresAt);

    // Return the raw token exactly once. It is never stored in plaintext.
    return res.status(201).json({
      success: true,
      data: {
        token: rawToken,
        expiresAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to generate invite" });
  }
}

// FREEZE ADMIN
export async function freezeAdmin(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const targetId = Number(req.params.id);

    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }

    if (req.admin.id === targetId) {
      return res.status(400).json({ success: false, message: "You cannot freeze your own account" });
    }

    const target = await superAdminService.findAdminById(targetId);

    if (!target) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (!target.isActive) {
      return res.status(409).json({ success: false, message: "Admin account is already frozen" });
    }

    const updated = await superAdminService.updateAdminStatus(targetId, false);

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to freeze admin" });
  }
}

// UNFREEZE ADMIN
export async function unfreezeAdmin(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const targetId = Number(req.params.id);

    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }

    const target = await superAdminService.findAdminById(targetId);

    if (!target) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (target.isActive) {
      return res.status(409).json({ success: false, message: "Admin account is already active" });
    }

    const updated = await superAdminService.updateAdminStatus(targetId, true);

    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to unfreeze admin" });
  }
}
