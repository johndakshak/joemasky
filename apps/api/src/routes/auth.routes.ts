import { Router } from "express";
import * as authController from "../controllers/auth.controller"

const router = Router();

router.post("/login/admin", authController.login);

export default router;