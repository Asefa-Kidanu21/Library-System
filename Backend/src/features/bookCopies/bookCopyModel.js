
import sql from "../../config/db.js";

export async function getAllBookCopies() {
  return await sql`
    SELECT
      bc.id,
      bc.book_id,
      bc.barcode,
      bc.status,
      bc.created_at,
      b.title,
      b.author,
      b.isbn
    FROM book_copies bc
    JOIN books b ON b.id = bc.book_id
    ORDER BY bc.id DESC
  `;
}

export async function getBookCopyById(id) {
  const result = await sql`
    SELECT
      bc.id,
      bc.book_id,
      bc.barcode,
      bc.status,
      bc.created_at,
      b.title,
      b.author,
      b.isbn
    FROM book_copies bc
    JOIN books b ON b.id = bc.book_id
    WHERE bc.id = ${id}
  `;

  return result[0] || null;
}

export async function createBookCopy(data) {
  const result = await sql`
    INSERT INTO book_copies (
      book_id,
      barcode,
      status
    )
    VALUES (
      ${data.book_id},
      ${data.barcode},
      ${data.status}
    )
    RETURNING *
  `;

  return result[0];
}

export async function updateBookCopy(id, data) {
  const result = await sql`
    UPDATE book_copies
    SET
      book_id = ${data.book_id},
      barcode = ${data.barcode},
      status = ${data.status}
    WHERE id = ${id}
    RETURNING *
  `;

  return result[0] || null;
}

export async function deleteBookCopy(id) {
  const result = await sql`
    DELETE FROM book_copies
    WHERE id = ${id}
    RETURNING id
  `;

  return result[0] || null;
}
