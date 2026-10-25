
import sql from "../../config/db.js";

export async function getAllBooks() {
  return await sql`
    SELECT
      b.id,
      b.title,
      b.author,
      b.isbn,
      b.description,
      b.published_year,
      b.created_at,
      b.updated_at,
      COUNT(bc.id)::int AS total_copies,
      COUNT(bc.id) FILTER (
        WHERE bc.status = 'available'
      )::int AS available_copies
    FROM books b
    LEFT JOIN book_copies bc ON bc.book_id = b.id
    GROUP BY b.id
    ORDER BY b.id DESC
  `;
}

export async function getBookById(id) {
  const result = await sql`
    SELECT
      b.id,
      b.title,
      b.author,
      b.isbn,
      b.description,
      b.published_year,
      b.created_at,
      b.updated_at,
      COUNT(bc.id)::int AS total_copies,
      COUNT(bc.id) FILTER (
        WHERE bc.status = 'available'
      )::int AS available_copies
    FROM books b
    LEFT JOIN book_copies bc ON bc.book_id = b.id
    WHERE b.id = ${id}
    GROUP BY b.id
  `;

  return result[0] || null;
}

export async function createBook(data) {
  const result = await sql`
    INSERT INTO books (
      title,
      author,
      isbn,
      description,
      published_year
    )
    VALUES (
      ${data.title},
      ${data.author},
      ${data.isbn},
      ${data.description},
      ${data.published_year}
    )
    RETURNING *
  `;

  return result[0];
}

export async function updateBook(id, data) {
  const result = await sql`
    UPDATE books
    SET
      title = ${data.title},
      author = ${data.author},
      isbn = ${data.isbn},
      description = ${data.description},
      published_year = ${data.published_year},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  return result[0] || null;
}

export async function deleteBook(id) {
  const result = await sql`
    DELETE FROM books
    WHERE id = ${id}
    RETURNING id
  `;

  return result[0] || null;
}
