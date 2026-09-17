import { Router } from "express";
import * as orderController from "../controllers/order.controller";

const router = Router();

router.post("/create/order", orderController.create);
router.get("/order/:publicToken", orderController.getByPublicToken);

export default router;