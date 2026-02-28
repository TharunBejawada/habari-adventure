// apps/api/src/routes/index.ts
import { Router, Request, Response } from "express";
import authRoutes from "./authRoutes"; // Import the new auth routes
import userRoutes from "./userRoutes";
import blogRoutes from "./blogRoutes";

const router = Router();

// ==========================================
// API Routing Master File
// All routes will eventually be prefixed with /api/v1 (set in main index.ts)
// ==========================================

// --- 1. Auth & Admin Routes (Coming in Phase 2) ---
router.use("/auth", authRoutes);

router.use("/users", userRoutes);

router.use("/blogs", blogRoutes);

// --- 2. Package & Location Routes ---
router.use("/packages", (req: Request, res: Response) => {
    res.status(200).json({ message: "Packages endpoints will go here" });
});

// --- 3. Itinerary Routes ---
router.use("/itineraries", (req: Request, res: Response) => {
    res.status(200).json({ message: "Itineraries endpoints will go here" });
});

// --- 4. Blog Routes ---
router.use("/blogs", (req: Request, res: Response) => {
    res.status(200).json({ message: "Blog endpoints will go here" });
});

// --- 5. Crew Routes ---
router.use("/crew", (req: Request, res: Response) => {
    res.status(200).json({ message: "Crew endpoints will go here" });
});

export default router;