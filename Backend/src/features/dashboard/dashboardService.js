import { getDashboardStats } from "./dashboardModel.js";

export async function fetchDashboardStats() {
  return await getDashboardStats();
}