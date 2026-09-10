import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/category", categoryController.getAllCategories);
router.get("/category/:id", categoryController.getCategoryById);
router.post("/create/category", categoryController.createCategory);
router.patch("/update/category/:id", categoryController.updateCategory);
router.delete("/delete/category/:id", categoryController.deleteCategory);

export default router;