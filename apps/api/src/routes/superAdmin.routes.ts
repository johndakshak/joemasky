import { Router } from "express";
import * as superAdminController from "../controllers/superAdmin.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin";

const router = Router();

// All routes require a valid admin JWT and the SUPER_ADMIN role.
router.get("/admin/admins", requireAdmin, requireSuperAdmin, superAdminController.listAdmins);
router.post("/admin/invite", requireAdmin, requireSuperAdmin, superAdminController.generateInvite);
router.patch("/freeze/:id", requireAdmin, requireSuperAdmin, superAdminController.freezeAdmin);
router.patch("/unfreeze/:id", requireAdmin, requireSuperAdmin, superAdminController.unfreezeAdmin);

export default router;
