import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { upload } from "../lib/cloudinary";

const router = Router();

router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.post("/create/product", upload.single("image"), productController.createProduct);
router.patch("/update/product/:id", upload.single("image"), productController.updateProduct);
router.delete("/delete/product/:id", productController.deleteProduct);

export default router;