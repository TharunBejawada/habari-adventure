// apps/api/src/routes/userRoutes.ts
import { Router } from "express";
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from "../controllers/userController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// All user management routes require both a valid token AND an Admin role
router.use(requireAuth, requireAdmin);

router.route("/")
  .get(getAllUsers)
  .post(createUser);

router.route("/:id")
  .put(updateUser)
  .delete(deleteUser);

export default router;