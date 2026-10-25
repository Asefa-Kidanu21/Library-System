

import sql from "../../config/db.js";

// Get all borrowing requests for librarians
export async function getAllLoanRequests() {
  return await sql`
    SELECT
      lr.id,
      lr.user_id,
      u.name AS student_name,
      u.email AS student_email,
      lr.book_id,
      b.title AS book_title,
      b.author AS book_author,
      lr.status,
      lr.requested_at,
      lr.reviewed_at,
      lr.review_note
    FROM loan_requests lr
    JOIN users u ON u.id = lr.user_id
    JOIN books b ON b.id = lr.book_id
    ORDER BY lr.requested_at DESC
  `;
}

// Get borrowing requests belonging to one student
export async function getLoanRequestsByUserId(userId) {
  return await sql`
    SELECT
      lr.id,
      lr.book_id,
      b.title AS book_title,
      b.author AS book_author,
      lr.status,
      lr.requested_at,
      lr.reviewed_at,
      lr.review_note
    FROM loan_requests lr
    JOIN books b ON b.id = lr.book_id
    WHERE lr.user_id = ${userId}
    ORDER BY lr.requested_at DESC
  `;
}

// Create a borrowing request
export async function createLoanRequest(userId, bookId) {
  const result = await sql`
    INSERT INTO loan_requests (user_id, book_id)
    VALUES (${userId}, ${bookId})
    RETURNING *
  `;

  return result[0];
}

// Find a borrowing request by ID
export async function getLoanRequestById(requestId) {
  const result = await sql`
    SELECT *
    FROM loan_requests
    WHERE id = ${requestId}
    LIMIT 1
  `;

  return result[0] || null;
}

// Approve or reject a borrowing request
export async function reviewLoanRequest(
  requestId,
  status,
  librarianId,
  reviewNote
) {
  const result = await sql`
    UPDATE loan_requests
    SET
      status = ${status},
      reviewed_at = CURRENT_TIMESTAMP,
      reviewed_by = ${librarianId},
      review_note = ${reviewNote || null}
    WHERE id = ${requestId}
      AND status = 'pending'
    RETURNING *
  `;

  return result[0] || null;
}