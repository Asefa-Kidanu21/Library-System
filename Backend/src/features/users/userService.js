
import * as userModel from "./userModel.js";

const VALID_ROLES = ["student", "librarian"];

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw createError("User ID must be a positive integer.", 400);
  }

  return parsedId;
}

function validateUserInput(data) {
  const { name, email, role } = data ?? {};

  if (typeof name !== "string" || !name.trim()) {
    throw createError("Name is required.", 400);
  }

  if (name.trim().length > 150) {
    throw createError("Name cannot exceed 150 characters.", 400);
  }

  if (typeof email !== "string" || !email.trim()) {
    throw createError("Email is required.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw createError("Please provide a valid email address.", 400);
  }

  if (!VALID_ROLES.includes(role)) {
    throw createError(
      "Role must be either student or librarian.",
      400
    );
  }

  return {
    name: name.trim(),
    email: normalizedEmail,
    role,
  };
}

// Create or update the database record for the authenticated Clerk user
export async function syncClerkUser(data) {
  const { clerkUserId, name, email } = data;

  if (typeof clerkUserId !== "string" || !clerkUserId.trim()) {
    throw createError("A valid Clerk user ID is required.", 400);
  }

  if (typeof name !== "string" || !name.trim()) {
    throw createError("Your name must be available in Clerk.", 400);
  }

  if (typeof email !== "string" || !email.trim()) {
    throw createError("Your email must be available in Clerk.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    normalizedEmail.length > 255
  ) {
    throw createError("Please provide a valid email address.", 400);
  }

  return await userModel.syncClerkUser({
    clerkUserId: clerkUserId.trim(),
    name: name.trim(),
    email: normalizedEmail,
  });
}

export async function getAllUsers() {
  return await userModel.getAllUsers();
}

export async function getUserById(id) {
  const validId = validateId(id);
  const user = await userModel.getUserById(validId);

  if (!user) {
    throw createError("User not found.", 404);
  }

  return user;
}

export async function createUser(data) {
  return await userModel.createUser(validateUserInput(data));
}

export async function updateUser(id, data) {
  const validId = validateId(id);
  const validatedData = validateUserInput(data);

  const user = await userModel.updateUser(validId, validatedData);

  if (!user) {
    throw createError("User not found.", 404);
  }

  return user;
}

export async function deleteUser(id) {
  const validId = validateId(id);
  const user = await userModel.deleteUser(validId);

  if (!user) {
    throw createError("User not found.", 404);
  }

  return user;
}
