import express from "express";
import { getEmailSettings, updateEmailSettings } from "../controllers/emailSettingsController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/email", getEmailSettings)
router.put("/email", requireAuth, requireAdmin, updateEmailSettings)

export default router;