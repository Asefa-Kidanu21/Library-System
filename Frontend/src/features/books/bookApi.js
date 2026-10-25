
import api from "../../services/api.js";

export async function getBooks() {
  const response = await api.get("/books");
  return response.data;
}

export async function getBookById(id) {
  const response = await api.get(`/books/${id}`);
  return response.data;
}

export async function createBook(bookData) {
  const response = await api.post("/books", bookData);
  return response.data;
}

export async function updateBook(id, bookData) {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
}

export async function deleteBook(id) {
  const response = await api.delete(`/books/${id}`);
  return response.data;
}
