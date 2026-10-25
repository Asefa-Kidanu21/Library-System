
import sql from "../../config/db.js";

// Get all loans with student and book details.
export async function getAllLoans() {
  return sql`
    SELECT
      l.id,
      l.user_id,
      l.book_copy_id,
      l.borrowed_at,
      l.due_at,
      l.returned_at,
      u.name AS student_name,
      u.email AS student_email,
      b.title AS book_title,
      bc.barcode,
      bc.status AS copy_status,
      CASE
        WHEN l.returned_at IS NOT NULL THEN 'returned'
        WHEN l.due_at < CURRENT_TIMESTAMP THEN 'overdue'
        ELSE 'active'
      END AS loan_status
    FROM loans l
    JOIN users u ON u.id = l.user_id
    JOIN book_copies bc ON bc.id = l.book_copy_id
    JOIN books b ON b.id = bc.book_id
    ORDER BY l.id DESC
  `;
}

// Get loans belonging to one student.
export async function getLoansByUserId(userId) {
  return sql`
    SELECT
      l.id,
      l.user_id,
      l.book_copy_id,
      l.borrowed_at,
      l.due_at,
      l.returned_at,
      b.title AS book_title,
      b.author AS book_author,
      bc.barcode,
      CASE
        WHEN l.returned_at IS NOT NULL THEN 'returned'
        WHEN l.due_at < CURRENT_TIMESTAMP THEN 'overdue'
        ELSE 'active'
      END AS loan_status
    FROM loans l
    JOIN book_copies bc ON bc.id = l.book_copy_id
    JOIN books b ON b.id = bc.book_id
    WHERE l.user_id = ${userId}
    ORDER BY l.id DESC
  `;
}

// Get one loan by ID.
export async function getLoanById(id) {
  const rows = await sql`
    SELECT
      l.*,
      u.name AS student_name,
      u.email AS student_email,
      b.title AS book_title,
      bc.barcode,
      bc.status AS copy_status
    FROM loans l
    JOIN users u ON u.id = l.user_id
    JOIN book_copies bc ON bc.id = l.book_copy_id
    JOIN books b ON b.id = bc.book_id
    WHERE l.id = ${id}
    LIMIT 1
  `;

  return rows[0] || null;
}

// Issue a book using a transaction.
export async function createLoan({ userId, bookCopyId, dueAt }) {
  return sql.begin(async (tx) => {
    // Lock the copy so two requests cannot issue it together.
    const copies = await tx`
      SELECT id, status
      FROM book_copies
      WHERE id = ${bookCopyId}
      FOR UPDATE
    `;

    const copy = copies[0];

    if (!copy) {
      throw Object.assign(new Error("Book copy not found."), {
        statusCode: 404,
      });
    }

    if (copy.status !== "available") {
      throw Object.assign(
        new Error("This book copy is not available."),
        { statusCode: 409 }
      );
    }

    const users = await tx`
      SELECT id
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!users[0]) {
      throw Object.assign(new Error("Student not found."), {
        statusCode: 404,
      });
    }

    const inserted = await tx`
      INSERT INTO loans (user_id, book_copy_id, due_at)
      VALUES (${userId}, ${bookCopyId}, ${dueAt})
      RETURNING id
    `;

    await tx`
      UPDATE book_copies
      SET status = 'borrowed'
      WHERE id = ${bookCopyId}
    `;

    // Return the complete loan record.
    const rows = await tx`
      SELECT
        l.*,
        u.name AS student_name,
        u.email AS student_email,
        b.title AS book_title,
        bc.barcode,
        bc.status AS copy_status
      FROM loans l
      JOIN users u ON u.id = l.user_id
      JOIN book_copies bc ON bc.id = l.book_copy_id
      JOIN books b ON b.id = bc.book_id
      WHERE l.id = ${inserted[0].id}
    `;

    return rows[0];
  });
}

// Return a borrowed book.
export async function returnLoan(id) {
  return sql.begin(async (tx) => {
    const loans = await tx`
      SELECT id, book_copy_id, returned_at
      FROM loans
      WHERE id = ${id}
      FOR UPDATE
    `;

    const loan = loans[0];

    if (!loan) {
      throw Object.assign(new Error("Loan not found."), {
        statusCode: 404,
      });
    }

    if (loan.returned_at) {
      throw Object.assign(new Error("This book has already been returned."), {
        statusCode: 409,
      });
    }

    // Lock the corresponding copy before changing its status.
    await tx`
      SELECT id
      FROM book_copies
      WHERE id = ${loan.book_copy_id}
      FOR UPDATE
    `;

    const updated = await tx`
      UPDATE loans
      SET returned_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    await tx`
      UPDATE book_copies
      SET status = 'available'
      WHERE id = ${loan.book_copy_id}
    `;

    return updated[0];
  });
}
