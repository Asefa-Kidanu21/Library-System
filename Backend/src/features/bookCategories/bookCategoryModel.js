
import sql from "../../config/db.js";

export async function getCategoriesByBookId(bookId) {
  return await sql`
    SELECT c.id, c.name, c.description
    FROM categories c
    INNER JOIN book_categories bc
      ON bc.category_id = c.id
    WHERE bc.book_id = ${bookId}
    ORDER BY c.name ASC
  `;
}

export async function assignCategoriesToBook(bookId, categoryIds) {
  return await sql.begin(async (tx) => {
    // Lock the book row so assignments are made to an existing book.
    const books = await tx`
      SELECT id
      FROM books
      WHERE id = ${bookId}
      FOR UPDATE
    `;

    if (books.length === 0) {
      const error = new Error("Book not found.");
      error.status = 404;
      throw error;
    }

    // Validate that every category exists.
    if (categoryIds.length > 0) {
      const categories = await tx`
        SELECT id
        FROM categories
        WHERE id IN ${tx(categoryIds)}
      `;

      if (categories.length !== categoryIds.length) {
        const error = new Error(
          "One or more categories do not exist."
        );
        error.status = 400;
        throw error;
      }
    }

    // Replace the book's existing category assignments.
    await tx`
      DELETE FROM book_categories
      WHERE book_id = ${bookId}
    `;

    if (categoryIds.length > 0) {
      await tx`
        INSERT INTO book_categories (book_id, category_id)
        SELECT ${bookId}, category_id
        FROM UNNEST(${tx.array(categoryIds)}::bigint[])
          AS assigned(category_id)
      `;
    }

    return await tx`
      SELECT c.id, c.name, c.description
      FROM categories c
      INNER JOIN book_categories bc
        ON bc.category_id = c.id
      WHERE bc.book_id = ${bookId}
      ORDER BY c.name ASC
    `;
  });
}
