


import { getAuth } from "@clerk/express";

export function requireAuth(req, res, next) {
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated || !userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in.",
    });
  }

  req.clerkUserId = userId;

  next();
}