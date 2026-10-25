
import api from "../../services/api.js";

export async function getAllCategories() {
  const response = await api.get("/categories");
  return response.data;
}

export async function getCategoryById(id) {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await api.post("/categories", categoryData);
  return response.data;
}

export async function updateCategory(id, categoryData) {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
