import express from "express";
import { getAllLocations, getLocationBySlug, createLocation, updateLocation, deleteLocation } from "../controllers/locationController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllLocations);
router.get("/:slug", getLocationBySlug);
router.post("/", requireAuth, requireAdmin, createLocation);
router.put("/:id", requireAuth, requireAdmin, updateLocation);
router.delete("/:id", requireAuth, requireAdmin, deleteLocation);

export default router;