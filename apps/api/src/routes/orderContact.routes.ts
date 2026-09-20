import { Router } from "express";
import * as orderController from "../controllers/orderContact.controller"

const router = Router();

router.get("/order/:publicToken/contact-shop", orderController.getContactLinks);

export default router;