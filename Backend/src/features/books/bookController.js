
import {
  listBooks,
  findBook,
  addBook,
  editBook,
  removeBook,
} from "./bookService.js";

export async function getAllBooksController(req, res, next) {
  try {
    const books = await listBooks();

    return res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookByIdController(req, res, next) {
  try {
    const book = await findBook(req.params.id);

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBookController(req, res, next) {
  try {
    const book = await addBook(req.body);

    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookController(req, res, next) {
  try {
    const book = await editBook(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBookController(req, res, next) {
  try {
    const book = await removeBook(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
}
