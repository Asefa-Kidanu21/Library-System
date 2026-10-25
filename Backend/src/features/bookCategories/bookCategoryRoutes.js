
import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

import {
  getCategoriesForBook,
  updateBookCategories,
} from "./bookCategoryController.js";

const router = Router();

router.use(requireAuth);

// Retrieve categories assigned to a book.
router.get("/:bookId", getCategoriesForBook);

// Only librarians can assign or replace categories.
router.put(
  "/:bookId",
  requireRole("librarian"),
  updateBookCategories
);

export default router;
