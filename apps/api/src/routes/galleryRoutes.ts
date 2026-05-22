import { Router } from "express";
import { 
  getAllGalleryItems, 
  createGalleryItem, 
  deleteGalleryItem 
} from "../controllers/galleryController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();


router.get("/", getAllGalleryItems);
router.post("/", requireAuth, requireAdmin, createGalleryItem);
router.delete("/:id", requireAuth, requireAdmin, deleteGalleryItem);

export default router;