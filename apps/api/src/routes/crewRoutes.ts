// apps/api/src/routes/crewRoutes.ts
import { Router } from "express";
import { 
  getCrewData,
  updateCrewSettings,
  saveTeam,
  saveMember,
  deleteTeam,
  deleteMember
} from "../controllers/crewController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public: Get all crew data for the frontend UI
router.get("/", getCrewData);

// Protected Admin Routes: Save data
router.post("/settings", requireAuth, requireAdmin, updateCrewSettings);
router.post("/team", requireAuth, requireAdmin, saveTeam);
router.post("/member", requireAuth, requireAdmin, saveMember);

// Protected Admin Routes: Delete data
router.delete("/team/:id", requireAuth, requireAdmin, deleteTeam);
router.delete("/member/:id", requireAuth, requireAdmin, deleteMember);

export default router;