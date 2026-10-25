
import {
  getBookCategories,
  setBookCategories,
} from "./bookCategoryService.js";

export async function getCategoriesForBook(req, res, next) {
  try {
    const categories = await getBookCategories(req.params.bookId);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookCategories(req, res, next) {
  try {
    const { categoryIds } = req.body;

    const categories = await setBookCategories(
      req.params.bookId,
      categoryIds
    );

    return res.status(200).json({
      success: true,
      message: "Book categories updated successfully.",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}
