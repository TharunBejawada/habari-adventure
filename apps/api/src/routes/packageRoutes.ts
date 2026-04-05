// apps/api/src/routes/blogRoutes.ts
import { Router } from "express";
import { 
  createPackage,
    getPackages,
    getPackageBySlug,
    updatePackage,
    deletePackage,
    getPackagesByLocation
} from "../controllers/packageController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, requireAdmin, createPackage);
router.get("/", getPackages);
router.get("/:slug", getPackageBySlug);
router.get("/location/:location", getPackagesByLocation);
router.put("/:id", requireAuth, requireAdmin, updatePackage);
router.delete("/:id", deletePackage);

export default router;