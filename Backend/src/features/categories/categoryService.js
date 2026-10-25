
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryModel.js";

function validateId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw Object.assign(
      new Error("Category ID must be a positive integer."),
      { statusCode: 400 }
    );
  }

  return id;
}

function validateCategory(data) {
  const name = String(data.name ?? "").trim();
  const description = String(data.description ?? "").trim();

  if (!name) {
    throw Object.assign(new Error("Category name is required."), {
      statusCode: 400,
    });
  }

  if (name.length > 100) {
    throw Object.assign(
      new Error("Category name cannot exceed 100 characters."),
      { statusCode: 400 }
    );
  }

  if (description.length > 0 && description.length > 10000) {
    throw Object.assign(
      new Error("Description is too long."),
      { statusCode: 400 }
    );
  }

  return {
    name,
    description: description || null,
  };
}

export async function listCategories() {
  return getAllCategories();
}

export async function findCategory(id) {
  const categoryId = validateId(id);
  const category = await getCategoryById(categoryId);

  if (!category) {
    throw Object.assign(new Error("Category not found."), {
      statusCode: 404,
    });
  }

  return category;
}

export async function addCategory(data) {
  return createCategory(validateCategory(data));
}

export async function editCategory(id, data) {
  const categoryId = validateId(id);
  const validated = validateCategory(data);

  const existing = await getCategoryById(categoryId);

  if (!existing) {
    throw Object.assign(new Error("Category not found."), {
      statusCode: 404,
    });
  }

  return updateCategory(categoryId, validated);
}

export async function removeCategory(id) {
  const categoryId = validateId(id);
  const existing = await getCategoryById(categoryId);

  if (!existing) {
    throw Object.assign(new Error("Category not found."), {
      statusCode: 404,
    });
  }

  try {
    return await deleteCategory(categoryId);
  } catch (error) {
    if (error.code === "23503") {
      throw Object.assign(
        new Error("This category cannot be deleted because it is in use."),
        { statusCode: 409 }
      );
    }

    throw error;
  }
}
