
import {
  getCategoriesByBookId,
  assignCategoriesToBook,
} from "./bookCategoryModel.js";

function validateId(value, fieldName) {
  const id = Number(value);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    const error = new Error(`${fieldName} must be a positive integer.`);
    error.status = 400;
    throw error;
  }

  return id;
}

export async function getBookCategories(bookId) {
  const id = validateId(bookId, "Book ID");
  return await getCategoriesByBookId(id);
}

export async function setBookCategories(bookId, categoryIds) {
  const id = validateId(bookId, "Book ID");

  if (!Array.isArray(categoryIds)) {
    const error = new Error("categoryIds must be an array.");
    error.status = 400;
    throw error;
  }

  const validatedIds = categoryIds.map((categoryId) =>
    validateId(categoryId, "Category ID")
  );

  if (new Set(validatedIds).size !== validatedIds.length) {
    const error = new Error("Duplicate category IDs are not allowed.");
    error.status = 400;
    throw error;
  }

  return await assignCategoriesToBook(id, validatedIds);
}
