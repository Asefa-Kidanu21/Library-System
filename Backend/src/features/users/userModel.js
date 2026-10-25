
import sql from "../../config/db.js";

// Synchronize a Clerk user with PostgreSQL.
// New users receive the default role: student.
export async function syncClerkUser({ clerkUserId, name, email }) {
  const users = await sql`
    INSERT INTO users (clerk_user_id, name, email, role)
    VALUES (${clerkUserId}, ${name}, ${email}, 'student')
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, clerk_user_id, name, email, role,
              created_at, updated_at
  `;

  return users[0];
}

// Get all users
export async function getAllUsers() {
  return await sql`
    SELECT id, clerk_user_id, name, email, role,
           created_at, updated_at
    FROM users
    ORDER BY id DESC
  `;
}

// Get user by database ID
export async function getUserById(id) {
  const users = await sql`
    SELECT id, clerk_user_id, name, email, role,
           created_at, updated_at
    FROM users
    WHERE id = ${id}
  `;

  return users[0] || null;
}

// Create a user through librarian management
export async function createUser({ name, email, role }) {
  const users = await sql`
    INSERT INTO users (name, email, role)
    VALUES (${name}, ${email}, ${role})
    RETURNING id, clerk_user_id, name, email, role,
              created_at, updated_at
  `;

  return users[0];
}

// Update a user's library information
export async function updateUser(id, { name, email, role }) {
  const users = await sql`
    UPDATE users
    SET name = ${name},
        email = ${email},
        role = ${role},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, clerk_user_id, name, email, role,
              created_at, updated_at
  `;

  return users[0] || null;
}

// Delete a user
export async function deleteUser(id) {
  const users = await sql`
    DELETE FROM users
    WHERE id = ${id}
    RETURNING id, clerk_user_id, name, email, role
  `;

  return users[0] || null;
}
