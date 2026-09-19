import { Router } from "express";
import * as shopController from "../controllers/shopContact.controller"

const router = Router();

router.get("/shop/contact", shopController.getShopContact);

export default router;