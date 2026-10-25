



import api from "../../services/api.js";

// Get dashboard statistics
export async function getDashboardStats() {
  const response = await api.get("/dashboard/stats");
  return response.data;
}

