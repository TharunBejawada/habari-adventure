// apps/api/src/routes/authRoutes.ts
import { Router } from "express";
import { loginAdmin } from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiter"; // <-- Updated Import

const router = Router();

// POST /api/v1/auth/login
router.post("/login", authLimiter, loginAdmin);

export default router;