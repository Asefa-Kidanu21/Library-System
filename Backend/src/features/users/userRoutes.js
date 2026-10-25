
import { Router } from "express";

import {
  syncCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./userController.js";

import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

// A signed-in user can synchronize their own account.
router.post("/sync", requireAuth, syncCurrentUser);

// The remaining user-management endpoints are librarian-only.
router.use(requireAuth, requireRole("librarian"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
