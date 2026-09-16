import { Router } from "express";
import * as adminController from "../controllers/superAdmin.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin";

const router = Router();

router.post("/admin/invite", requireAdmin, requireSuperAdmin, adminController.generateInvite);
router.patch("/freeze/:id", requireAdmin, requireSuperAdmin, adminController.freezeAdmin);
router.patch("/unfreeze/:id", requireAdmin, requireSuperAdmin, adminController.unfreezeAdmin);

export default router;