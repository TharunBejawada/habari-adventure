import express from "express";
import { createBooking, getAllBookings } from "../controllers/bookingController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", createBooking);
router.get("/", requireAuth, requireAdmin, getAllBookings);

export default router;