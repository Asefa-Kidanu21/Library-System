
import api from "../../services/api.js";

// Synchronize the current Clerk user
export async function syncCurrentUser() {
  const response = await api.post("/users/sync");
  return response.data;
}

// READ: Get all users
export async function getAllUsers() {
  const response = await api.get("/users");
  return response.data;
}

// READ: Get one user
export async function getUserById(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// CREATE: Create a user
export async function createUser(userData) {
  const response = await api.post("/users", userData);
  return response.data;
}

// UPDATE: Update a user
export async function updateUser(id, userData) {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
}

// DELETE: Delete a user
export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
