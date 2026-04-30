import express from "express";
import { getUpcomingDates, createUpcomingDate, deleteUpcomingDate, updateUpcomingDate } from "../controllers/upcomingDateController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getUpcomingDates);
router.post("/", requireAuth, requireAdmin, createUpcomingDate);
router.put("/:id", requireAuth, requireAdmin, updateUpcomingDate);
router.delete("/:id", requireAuth, requireAdmin, deleteUpcomingDate);

export default router;