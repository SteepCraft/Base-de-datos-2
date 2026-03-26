import { Router } from "express";

import AuthController from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.me);
router.post("/logout", authenticate, AuthController.logout);

export default router;
