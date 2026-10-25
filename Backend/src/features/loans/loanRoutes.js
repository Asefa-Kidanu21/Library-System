
import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

import {
  getAllLoans,
  getMyLoans,
  getLoan,
  createLoan,
  returnBook,
} from "./loanController.js";

const router = Router();

// Every loan route requires authentication.
router.use(requireAuth);

// Students can view their own loans.
router.get("/my", requireRole("student"), getMyLoans);

// Librarian-only routes.
router.get("/", requireRole("librarian"), getAllLoans);
router.get("/:id", requireRole("librarian"), getLoan);
router.post("/", requireRole("librarian"), createLoan);
router.patch("/:id/return", requireRole("librarian"), returnBook);

export default router;
