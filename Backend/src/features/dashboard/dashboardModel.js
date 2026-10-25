

import sql from "../../config/db.js";

export async function getDashboardStats() {
  const result = await sql`
    SELECT
      (SELECT COUNT(*)::int
       FROM books)
        AS "totalBooks",

      (SELECT COUNT(*)::int
       FROM book_copies)
        AS "totalCopies",

      (SELECT COUNT(*)::int
       FROM book_copies
       WHERE status = 'available')
        AS "availableCopies",

      (SELECT COUNT(*)::int
       FROM users)
        AS "totalUsers",

      (SELECT COUNT(*)::int
       FROM users
       WHERE role = 'student')
        AS "totalStudents",

      (SELECT COUNT(*)::int
       FROM loans)
        AS "totalLoans",

      (SELECT COUNT(*)::int
       FROM loans
       WHERE returned_at IS NULL)
        AS "activeLoans",

      (SELECT COUNT(*)::int
       FROM loans
       WHERE returned_at IS NULL
         AND due_at < CURRENT_TIMESTAMP)
        AS "overdueLoans",

      (SELECT COUNT(*)::int
       FROM loan_requests
       WHERE status = 'pending')
        AS "pendingRequests"
  `;

  return result[0];
}