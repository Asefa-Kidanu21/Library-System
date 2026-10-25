
import {
  getAllBookCopies,
  getBookCopyById,
  createBookCopy,
  updateBookCopy,
  deleteBookCopy,
} from "./bookCopyModel.js";

const allowedStatuses = [
  "available",
  "borrowed",
  "lost",
  "damaged",
];

function validateId(id) {
  if (!/^[1-9]\d*$/.test(String(id))) {
    const error = new Error("Invalid book copy ID.");
    error.statusCode = 400;
    throw error;
  }
}

function validateBookCopy(data) {
  const book_id = Number(data.book_id);
  const barcode = data.barcode?.trim();
  const status = data.status || "available";

  if (
    !Number.isSafeInteger(book_id) ||
    book_id <= 0
  ) {
    const error = new Error("A valid book ID is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!barcode) {
    const error = new Error("Barcode is required.");
    error.statusCode = 400;
    throw error;
  }

  if (barcode.length > 100) {
    const error = new Error(
      "Barcode cannot exceed 100 characters."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid book copy status.");
    error.statusCode = 400;
    throw error;
  }

  return {
    book_id,
    barcode,
    status,
  };
}

export async function listBookCopies() {
  return await getAllBookCopies();
}

export async function findBookCopy(id) {
  validateId(id);

  const copy = await getBookCopyById(id);

  if (!copy) {
    const error = new Error("Book copy not found.");
    error.statusCode = 404;
    throw error;
  }

  return copy;
}

export async function addBookCopy(data) {
  return await createBookCopy(validateBookCopy(data));
}

export async function editBookCopy(id, data) {
  validateId(id);

  const copyData = validateBookCopy(data);
  const updatedCopy = await updateBookCopy(id, copyData);

  if (!updatedCopy) {
    const error = new Error("Book copy not found.");
    error.statusCode = 404;
    throw error;
  }

  return updatedCopy;
}

export async function removeBookCopy(id) {
  validateId(id);

  const deletedCopy = await deleteBookCopy(id);

  if (!deletedCopy) {
    const error = new Error("Book copy not found.");
    error.statusCode = 404;
    throw error;
  }

  return deletedCopy;
}
