
import {
  listCategories,
  findCategory,
  addCategory,
  editCategory,
  removeCategory,
} from "./categoryService.js";

function handleError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A category with this name already exists.",
    });
  }

  const status = error.statusCode || 500;

  if (status === 500) {
    console.error("Category error:", error);
  }

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "An unexpected server error occurred."
        : error.message,
  });
}

export async function getCategories(req, res) {
  try {
    const categories = await listCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getCategory(req, res) {
  try {
    const category = await findCategory(req.params.id);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createCategory(req, res) {
  try {
    const category = await addCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await editCategory(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteCategory(req, res) {
  try {
    await removeCategory(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}
