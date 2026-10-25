

import {
  getAllLoanRequests,
  getLoanRequestsByUserId,
  createLoanRequest,
  getLoanRequestById,
  reviewLoanRequest,
} from "./loanRequestModel.js";

import sql from "../../config/db.js";

function validateId(id, name = "ID") {
  const value = Number(id);

  if (!Number.isSafeInteger(value) || value <= 0) {
    const error = new Error(`${name} must be a positive integer.`);
    error.status = 400;
    throw error;
  }

  return value;
}

// Librarian: get all requests
export async function listLoanRequests() {
  return await getAllLoanRequests();
}

// Student: get their own requests
export async function listMyLoanRequests(clerkUserId) {
  const users = await sql`
    SELECT id
    FROM users
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `;

  if (!users[0]) {
    const error = new Error("Library user account not found.");
    error.status = 404;
    throw error;
  }

  return await getLoanRequestsByUserId(users[0].id);
}

// Student: request a book
export async function requestBook(clerkUserId, bookId) {
  const validBookId = validateId(bookId, "Book ID");

  const users = await sql`
    SELECT id
    FROM users
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `;

  if (!users[0]) {
    const error = new Error("Library user account not found.");
    error.status = 404;
    throw error;
  }

  const books = await sql`
    SELECT id
    FROM books
    WHERE id = ${validBookId}
    LIMIT 1
  `;

  if (!books[0]) {
    const error = new Error("Book not found.");
    error.status = 404;
    throw error;
  }

  // Prevent duplicate pending requests for the same book by this student.
  const existing = await sql`
    SELECT id
    FROM loan_requests
    WHERE user_id = ${users[0].id}
      AND book_id = ${validBookId}
      AND status = 'pending'
    LIMIT 1
  `;

  if (existing.length > 0) {
    const error = new Error(
      "You already have a pending request for this book."
    );
    error.status = 409;
    throw error;
  }

  return await createLoanRequest(users[0].id, validBookId);
}

// Librarian: approve or reject a request
export async function processLoanRequest(
  requestId,
  status,
  librarianId,
  reviewNote
) {
  const validRequestId = validateId(requestId, "Request ID");

  if (!["approved", "rejected"].includes(status)) {
    const error = new Error(
      "Status must be approved or rejected."
    );
    error.status = 400;
    throw error;
  }

  const request = await getLoanRequestById(validRequestId);

  if (!request) {
    const error = new Error("Borrowing request not found.");
    error.status = 404;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error(
      "Only pending requests can be reviewed."
    );
    error.status = 409;
    throw error;
  }

  // For now, this records the review.
  // Transaction-safe loan issuance will be added to the approval flow.
  const updated = await reviewLoanRequest(
    validRequestId,
    status,
    librarianId,
    reviewNote
  );

  if (!updated) {
    const error = new Error(
      "This request was already reviewed. Refresh and try again."
    );
    error.status = 409;
    throw error;
  }

  return updated;
}