


import api from "../../services/api.js";


export async function getDashboardStats() {
  try {
    const response = await api.get("/dashboard/stats");

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch dashboard statistics:",
      error.response?.data || error.message
    );

    throw error;
  }
}
