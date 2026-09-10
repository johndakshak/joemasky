import { Router } from "express";
import * as productController from "../controllers/product.controller";

const router = Router();

router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.post("/create/product", productController.createProduct);
router.patch("/update/product/:id", productController.updateProduct);
router.delete("/delete/product/:id", productController.deleteProduct);

export default router;