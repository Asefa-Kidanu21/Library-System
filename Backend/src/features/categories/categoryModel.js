
import sql from "../../config/db.js";

export async function getAllCategories() {
  return sql`
    SELECT
      c.id,
      c.name,
      c.description,
      c.created_at,
      COUNT(bc.book_id)::int AS book_count
    FROM categories c
    LEFT JOIN book_categories bc ON bc.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
}

export async function getCategoryById(id) {
  const rows = await sql`
    SELECT
      c.id,
      c.name,
      c.description,
      c.created_at,
      COUNT(bc.book_id)::int AS book_count
    FROM categories c
    LEFT JOIN book_categories bc ON bc.category_id = c.id
    WHERE c.id = ${id}
    GROUP BY c.id
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function createCategory(data) {
  const rows = await sql`
    INSERT INTO categories (name, description)
    VALUES (${data.name}, ${data.description})
    RETURNING *
  `;

  return rows[0];
}

export async function updateCategory(id, data) {
  const rows = await sql`
    UPDATE categories
    SET name = ${data.name},
        description = ${data.description}
    WHERE id = ${id}
    RETURNING *
  `;

  return rows[0] || null;
}

export async function deleteCategory(id) {
  const rows = await sql`
    DELETE FROM categories
    WHERE id = ${id}
    RETURNING id
  `;

  return rows[0] || null;
}
