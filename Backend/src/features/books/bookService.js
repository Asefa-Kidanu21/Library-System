
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "./bookModel.js";

function validateBookId(id) {
  if (!/^[1-9]\d*$/.test(String(id))) {
    const error = new Error("Invalid book ID.");
    error.statusCode = 400;
    throw error;
  }
}

function validateBook(data) {
  const title = data.title?.trim();
  const author = data.author?.trim();

  if (!title || !author) {
    const error = new Error("Title and author are required.");
    error.statusCode = 400;
    throw error;
  }

  if (title.length > 255 || author.length > 150) {
    const error = new Error("Title or author is too long.");
    error.statusCode = 400;
    throw error;
  }

  const isbn = data.isbn?.trim() || null;
  const description = data.description?.trim() || null;

  if (isbn && isbn.length > 20) {
    const error = new Error("ISBN cannot exceed 20 characters.");
    error.statusCode = 400;
    throw error;
  }

  let published_year = null;

  if (
    data.published_year !== undefined &&
    data.published_year !== null &&
    data.published_year !== ""
  ) {
    published_year = Number(data.published_year);

    if (
      !Number.isInteger(published_year) ||
      published_year < 1 ||
      published_year > 9999
    ) {
      const error = new Error(
        "Published year must be a whole number between 1 and 9999."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  return {
    title,
    author,
    isbn,
    description,
    published_year,
  };
}

export async function listBooks() {
  return await getAllBooks();
}

export async function findBook(id) {
  validateBookId(id);

  const book = await getBookById(id);

  if (!book) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }

  return book;
}

export async function addBook(data) {
  return await createBook(validateBook(data));
}

export async function editBook(id, data) {
  validateBookId(id);

  const bookData = validateBook(data);
  const updatedBook = await updateBook(id, bookData);

  if (!updatedBook) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }

  return updatedBook;
}

export async function removeBook(id) {
  validateBookId(id);

  const deletedBook = await deleteBook(id);

  if (!deletedBook) {
    const error = new Error("Book not found.");
    error.statusCode = 404;
    throw error;
  }

  return deletedBook;
}
