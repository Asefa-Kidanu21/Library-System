


import { useEffect, useState } from "react";

import { getBooks } from "../books/bookApi.js";
import { getCategories } from "../categories/categoryApi.js";

import {
  getBookCategories,
  replaceBookCategories,
} from "./bookCategoryApi.js";

function BookCategoriesPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [bookId, setBookId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [booksData, categoriesData] =
          await Promise.all([
            getBooks(),
            getCategories(),
          ]);

        setBooks(booksData);
        setCategories(categoriesData);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load books and categories."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleBookChange(event) {
    const id = event.target.value;

    setBookId(id);
    setSelectedIds([]);
    setError("");
    setMessage("");

    if (!id) return;

    try {
      const assignedCategories =
        await getBookCategories(id);

      setSelectedIds(
        assignedCategories.map((category) =>
          Number(category.id)
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load assigned categories."
      );
    }
  }

  function handleCategoryChange(categoryId) {
    setSelectedIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    );

    setMessage("");
  }

  async function handleSave() {
    if (!bookId) {
      setError("Please select a book.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updatedCategories =
        await replaceBookCategories(
          bookId,
          selectedIds
        );

      setSelectedIds(
        updatedCategories.map((category) =>
          Number(category.id)
        )
      );

      setMessage("Book categories saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save book categories."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="p-6 text-gray-500">
        Loading books and categories...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Assign Categories to Books
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Select a book and choose one or more categories.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </div>
      )}

      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label
            htmlFor="book"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Book
          </label>

          <select
            id="book"
            value={bookId}
            onChange={handleBookChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose a book</option>

            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} — {book.author}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-gray-800">
            Available Categories
          </h2>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">
              No categories found. Create categories first.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(
                      Number(category.id)
                    )}
                    onChange={() =>
                      handleCategoryChange(
                        Number(category.id)
                      )
                    }
                    disabled={!bookId || saving}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />

                  <span className="text-gray-800">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Selected categories: {selectedIds.length}
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={!bookId || saving}
          className="cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Categories"}
        </button>
      </div>
    </div>
  );
}

export default BookCategoriesPage;
