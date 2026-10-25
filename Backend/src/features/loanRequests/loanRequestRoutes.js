

import express from "express";

import {
  getAllRequests,
  getMyRequests,
  createRequest,
  reviewRequest,
} from "./loanRequestController.js";

import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = express.Router();

router.use(requireAuth);

// Students: view their requests
router.get(
  "/my",
  requireRole("student"),
  getMyRequests
);

// Librarians: view all requests
router.get(
  "/",
  requireRole("librarian"),
  getAllRequests
);

// Students: request a book
router.post(
  "/",
  requireRole("student"),
  createRequest
);

// Librarians: approve or reject a request
router.patch(
  "/:id/review",
  requireRole("librarian"),
  reviewRequest
);

export default router;