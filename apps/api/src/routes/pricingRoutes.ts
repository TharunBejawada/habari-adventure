import express from "express";
import { getAllPricing, upsertPricing, deletePricing } from "../controllers/pricingController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllPricing);
router.post("/", requireAuth, requireAdmin, upsertPricing);
router.delete("/:id", requireAuth, requireAdmin, deletePricing);

export default router;