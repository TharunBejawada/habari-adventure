// apps/api/src/routes/blogRoutes.ts
import { Router } from "express";
import { 
  getBlogs, 
  getBlogByIdOrSlug, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from "../controllers/blogController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public routes for the main website
router.get("/", getBlogs);
router.get("/:idOrSlug", getBlogByIdOrSlug);

// Protected routes for the Admin Dashboard
router.post("/", requireAuth, requireAdmin, createBlog);
router.put("/:id", requireAuth, requireAdmin, updateBlog);
router.delete("/:id", requireAuth, requireAdmin, deleteBlog);

export default router;