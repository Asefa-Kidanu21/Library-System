
import { Router } from "express";

import {
  getAllBookCopiesController,
  getBookCopyByIdController,
  createBookCopyController,
  updateBookCopyController,
  deleteBookCopyController,
} from "./bookCopyController.js";

import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.use(requireAuth);

// Authenticated students and librarians can view copies.
router.get("/", getAllBookCopiesController);
router.get("/:id", getBookCopyByIdController);

// Librarians manage physical copies.
router.post(
  "/",
  requireRole("librarian"),
  createBookCopyController
);

router.put(
  "/:id",
  requireRole("librarian"),
  updateBookCopyController
);

router.delete(
  "/:id",
  requireRole("librarian"),
  deleteBookCopyController
);

export default router;
