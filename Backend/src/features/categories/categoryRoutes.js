
import { Router } from "express";

import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post("/", requireRole("librarian"), createCategory);
router.put("/:id", requireRole("librarian"), updateCategory);
router.delete("/:id", requireRole("librarian"), deleteCategory);

export default router;
