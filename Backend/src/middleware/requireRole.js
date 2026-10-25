

import sql from "../config/db.js";

export function requireRole(...allowedRoles) {
  return async function (req, res, next) {
    try {
      if (!req.clerkUserId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const users = await sql`
        SELECT id, name, email, role, clerk_user_id
        FROM users
        WHERE clerk_user_id = ${req.clerkUserId}
        LIMIT 1
      `;

      const user = users[0];

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "Your account is not linked to a library user record.",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
        });
      }

      req.libraryUser = user;

      next();
    } catch (error) {
      next(error);
    }
  };
}