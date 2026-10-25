


import sql from "./src/config/db.js";

try {
  const result = await sql`SELECT current_database() AS database_name`;

  console.log("Database connected:", result[0].database_name);
} catch (error) {
  console.error("Database connection failed:", error.message);
} finally {
  await sql.end();
}