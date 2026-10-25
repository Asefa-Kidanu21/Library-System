import { fetchDashboardStats } from "./dashboardService.js";

export async function getDashboardStatsController(req, res, next) {
  try {
    const stats = await fetchDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}