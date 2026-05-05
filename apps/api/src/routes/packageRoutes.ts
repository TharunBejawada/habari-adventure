// apps/api/src/routes/packageRoutes.ts
import { Router } from "express";
import { 
  createPackage,
    getPackages,
    getPackageBySlug,
    updatePackage,
    deletePackage,
    getPackagesByLocation,
    deletePackageTranslation
} from "../controllers/packageController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, requireAdmin, createPackage);
router.get("/", getPackages);
// router.get("/:slug", getPackageBySlug);
router.get("/location/:location", getPackagesByLocation);
router.put("/:id", requireAuth, requireAdmin, updatePackage);
router.delete("/:id", requireAuth, requireAdmin, deletePackage);
router.delete("/:id/translations/:lang", requireAuth, requireAdmin, deletePackageTranslation);

router.get(/^\/(.+)$/, getPackageBySlug);

export default router;