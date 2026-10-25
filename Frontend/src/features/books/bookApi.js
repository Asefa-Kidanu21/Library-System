
import api from "../../services/api.js";

export async function getAllBooks() {
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

// Get categories assigned to a particular book.
export async function getBookCategories(bookId) {
  const response = await api.get(`/book-categories/${bookId}`);
  return response.data;
}

// Assign or replace a book's categories.
export async function updateBookCategories(bookId, categoryIds) {
  const response = await api.put(`/book-categories/${bookId}`, {
    categoryIds,
  });
  return response.data;
}
