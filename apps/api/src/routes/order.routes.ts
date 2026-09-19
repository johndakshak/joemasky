import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/create/order", orderController.createOrder);
router.get("/order/:publicToken", orderController.getOrderByPublicToken);
router.get("/admin/Orders", requireAdmin, orderController.getAllOrders);
router.get("/admin/order/:id", requireAdmin, orderController.getOrderById);
router.patch("/admin/orderStatus/:id", requireAdmin, orderController.updateOrderStatus);

router.patch("/order/:orderId/items/:itemId/availability", requireAdmin, orderController.markItemAvailability);
router.post("/order/:orderId/review-orders", requireAdmin, orderController.reviewOrder);

router.post("/order/:publicToken/accept", orderController.acceptOrder);
router.post("/order/:publicToken/decline", orderController.declineOrder);

export default router;