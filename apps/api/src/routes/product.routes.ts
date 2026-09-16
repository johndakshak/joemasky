import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { upload } from "../lib/cloudinary";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.post("/create/product", requireAdmin, upload.single("image"), productController.createProduct);
router.patch("/update/product/:id", requireAdmin, upload.single("image"), productController.updateProduct);
router.delete("/delete/product/:id", requireAdmin, productController.deleteProduct);

export default router;