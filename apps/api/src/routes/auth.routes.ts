import { Router } from "express";
import * as authController from "../controllers/auth.controller"
import { loginLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/login/admin", loginLimiter, authController.login);

export default router;