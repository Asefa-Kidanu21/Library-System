
import {
  listBookCopies,
  findBookCopy,
  addBookCopy,
  editBookCopy,
  removeBookCopy,
} from "./bookCopyService.js";

function handleError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "This barcode is already registered.",
    });
  }

  if (error.code === "23503") {
    return res.status(409).json({
      success: false,
      message:
        "This operation conflicts with a related book or loan record.",
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : "An unexpected server error occurred.",
  });
}

export async function getAllBookCopiesController(req, res) {
  try {
    const copies = await listBookCopies();

    return res.status(200).json({
      success: true,
      data: copies,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getBookCopyByIdController(req, res) {
  try {
    const copy = await findBookCopy(req.params.id);

    return res.status(200).json({
      success: true,
      data: copy,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createBookCopyController(req, res) {
  try {
    const copy = await addBookCopy(req.body);

    return res.status(201).json({
      success: true,
      message: "Book copy registered successfully.",
      data: copy,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateBookCopyController(req, res) {
  try {
    const copy = await editBookCopy(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Book copy updated successfully.",
      data: copy,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteBookCopyController(req, res) {
  try {
    const copy = await removeBookCopy(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Book copy deleted successfully.",
      data: copy,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
