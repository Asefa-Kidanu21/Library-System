


import api from "../../api.js";

export async function getBookCategories(bookId) {
  const response = await api.get(
    `/book-categories/books/${bookId}`
  );

  return response.data.data;
}

export async function replaceBookCategories(
  bookId,
  categoryIds
) {
  const response = await api.put(
    `/book-categories/books/${bookId}`,
    { categoryIds }
  );

  return response.data.data;
}
