
import api from "../../services/api.js";

export async function getAllBookCopies() {
  const response = await api.get("/book-copies");
  return response.data;
}

export async function getBookCopyById(id) {
  const response = await api.get(`/book-copies/${id}`);
  return response.data;
}

export async function createBookCopy(copyData) {
  const response = await api.post("/book-copies", copyData);
  return response.data;
}

export async function updateBookCopy(id, copyData) {
  const response = await api.put(`/book-copies/${id}`, copyData);
  return response.data;
}

export async function deleteBookCopy(id) {
  const response = await api.delete(`/book-copies/${id}`);
  return response.data;
}
