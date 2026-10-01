import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/category", categoryController.getAllCategories);
router.get("/category/:id", categoryController.getCategoryById);
router.post("/create/category", requireAdmin, categoryController.createCategory);
router.patch("/update/category/:id", requireAdmin, categoryController.updateCategory);
router.delete("/delete/category/:id", requireAdmin, categoryController.deleteCategory);

export default router;