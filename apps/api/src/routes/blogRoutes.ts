// apps/api/src/routes/blogRoutes.ts
import { Router } from "express";
import { 
  getBlogs, 
  getBlogByIdOrSlug, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  searchBlogs,
  getBlogsByCategory,
  getBlogsByTag,
  getTopCategories,
  getTopTags
} from "../controllers/blogController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// --- 1. STATS & SPECIFIC ACTION ROUTES (Must be at the top) ---
router.get("/search", searchBlogs);
router.get("/stats/top-categories", getTopCategories);
router.get("/stats/top-tags", getTopTags);

// --- 2. FILTER ROUTES ---
router.get("/category/:category", getBlogsByCategory);
router.get("/tag/:tag", getBlogsByTag);

// --- 3. STANDARD CRUD ROUTES ---
router.get("/", getBlogs);

// Protected Admin Routes
router.post("/", requireAuth, requireAdmin, createBlog);
router.put("/:id", requireAuth, requireAdmin, updateBlog);
router.delete("/:id", requireAuth, requireAdmin, deleteBlog);

// --- 4. DYNAMIC SLUG ROUTE (MUST BE ABSOLUTELY LAST) ---
// If this is higher up, requests to /search will get routed here!
router.get("/:idOrSlug", getBlogByIdOrSlug);

export default router;