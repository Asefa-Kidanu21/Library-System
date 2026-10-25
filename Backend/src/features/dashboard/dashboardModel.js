import sql from "../../config/db.js";

export async function getDashboardStats() {
  const result = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM books)
        AS total_books,

      (SELECT COUNT(*)::int FROM book_copies)
        AS total_copies,

      (SELECT COUNT(*)::int
       FROM loans
       WHERE returned_at IS NULL)
        AS active_loans,

      (SELECT COUNT(*)::int FROM users)
        AS registered_users
  `;

  return result[0];
}