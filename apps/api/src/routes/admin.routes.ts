import { Router } from "express";
import * as adminController from "../controllers/admin.controller";

const router = Router();

router.post("/register/admin", adminController.register);

export default router;