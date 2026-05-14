import { Router } from "express";
import { getStats, createStat, updateStat, deleteStat } from "../controllers/statController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getStats);
router.post("/", requireAuth, requireAdmin, createStat);
router.put("/:id", requireAuth, requireAdmin, updateStat);
router.delete("/:id", requireAuth, requireAdmin, deleteStat);

export default router;