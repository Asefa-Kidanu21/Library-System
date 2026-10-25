
import { clerkClient, getAuth } from "@clerk/express";
import * as userService from "./userService.js";

function handleError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists.",
    });
  }

  if (error.code === "23503") {
    return res.status(409).json({
      success: false,
      message: "Related records prevent this operation.",
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode === 500) {
    console.error("Users API error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "An internal server error occurred."
        : error.message,
  });
}

// POST /api/users/sync
export async function syncCurrentUser(req, res) {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      return res.status(401).json({
        success: false,
        message: "Please sign in first.",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const primaryEmail = clerkUser.emailAddresses.find(
      (item) => item.id === clerkUser.primaryEmailAddressId
    );

    if (
      !primaryEmail ||
      primaryEmail.verification?.status !== "verified"
    ) {
      return res.status(403).json({
        success: false,
        message: "Please verify your primary email first.",
      });
    }

    const name = [
      clerkUser.firstName,
      clerkUser.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please add your name to your Clerk profile.",
      });
    }

    const user = await userService.syncClerkUser({
      clerkUserId: userId,
      name,
      email: primaryEmail.emailAddress,
    });

    return res.status(200).json({
      success: true,
      message: "Your account was synchronized successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/users
export async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/users
export async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  try {
    const user = await userService.deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
