
import { Router } from "express";

import {
  getAllBooksController,
  getBookByIdController,
  createBookController,
  updateBookController,
  deleteBookController,
} from "./bookController.js";

import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

// All book endpoints require authentication.
router.use(requireAuth);

// Students and librarians can browse books.
router.get("/", getAllBooksController);
router.get("/:id", getBookByIdController);

// Only librarians can manage book records.
router.post("/", requireRole("librarian"), createBookController);
router.put("/:id", requireRole("librarian"), updateBookController);
router.delete("/:id", requireRole("librarian"), deleteBookController);

export default router;
