import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { getDashboardStatsController } from "./dashboardController.js";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  requireRole("librarian"),
  getDashboardStatsController
);

export default router;