
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  X,
  LoaderCircle,
  Tags,
} from "lucide-react";

import {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  updateBookCategories,
} from "./bookApi.js";

import { getAllCategories } from "../categories/categoryApi.js";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  published_year: "",
};

export default function BooksPage({ user }) {
  const isLibrarian = user?.role === "librarian";

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [bookResult, categoryResult] = await Promise.all([
        getAllBooks(),
        getAllCategories(),
      ]);

      setBooks(bookResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      console.error("Load books and categories error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load books and categories."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleCategory(categoryId) {
    setSelectedCategories((previous) => {
      const id = String(categoryId);

      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  }

  function openAddForm() {
    setForm(emptyForm);
    setSelectedCategories([]);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function openEditForm(book) {
    setError("");
    setSuccess("");

    try {
      const result = await getBookCategories(book.id);

      setForm({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        description: book.description || "",
        published_year: book.published_year ?? "",
      });

      setSelectedCategories(
        (result.data || []).map((category) => String(category.id))
      );

      setEditingId(book.id);
      setShowForm(true);
    } catch (err) {
      console.error("Load book categories error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load this book's categories."
      );
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedCategories([]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const bookData = {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim() || null,
        description: form.description.trim() || null,
        published_year: form.published_year
          ? Number(form.published_year)
          : null,
      };

      let bookId;

      if (editingId !== null) {
        await updateBook(editingId, bookData);
        bookId = editingId;
      } else {
        const result = await createBook(bookData);

        // The backend returns the created book in result.data.
        bookId = result.data?.id;

        if (!bookId) {
          throw new Error(
            "The book was created, but its ID was not returned by the API."
          );
        }
      }

      // Save the category relationships after saving the book.
      await updateBookCategories(
        bookId,
        selectedCategories.map(Number)
      );

      closeForm();
      await loadData();

      setSuccess(
        editingId !== null
          ? "Book updated successfully."
          : "Book added successfully."
      );
    } catch (err) {
      console.error("Save book error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save the book."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteBook(book.id);
      await loadData();
      setSuccess("Book deleted successfully.");
    } catch (err) {
      console.error("Delete book error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete the book. It may have associated copies or loans."
      );
    }
  }

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText) ||
      book.isbn?.toLowerCase().includes(searchText)
    );
  });

  const totalAvailable = books.reduce(
    (total, book) => total + Number(book.available_copies || 0),
    0
  );

  const totalCopies = books.reduce(
    (total, book) => total + Number(book.total_copies || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Books Library
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage books and organize them into categories.
          </p>
        </div>

        {isLibrarian && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Book
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Titles"
          value={books.length}
          icon={<BookOpen size={22} />}
        />

        <SummaryCard
          title="Total Copies"
          value={totalCopies}
          icon={<BookOpen size={22} />}
        />

        <SummaryCard
          title="Available Copies"
          value={totalAvailable}
          icon={<BookOpen size={22} />}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Search size={20} className="text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Books table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Book</th>
                <th className="px-5 py-4 font-semibold">Author</th>
                <th className="px-5 py-4 font-semibold">ISBN</th>
                <th className="px-5 py-4 font-semibold">Year</th>
                <th className="px-5 py-4 font-semibold">Copies</th>
                <th className="px-5 py-4 font-semibold">Available</th>
                {isLibrarian && (
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isLibrarian ? 7 : 6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    <LoaderCircle
                      size={24}
                      className="mx-auto mb-2 animate-spin"
                    />
                    Loading books...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={isLibrarian ? 7 : 6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {book.title}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {book.author}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {book.isbn || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {book.published_year || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {book.total_copies ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        {book.available_copies ?? 0}
                      </span>
                    </td>

                    {isLibrarian && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(book)}
                            title="Edit book and categories"
                            aria-label={`Edit ${book.title}`}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(book)}
                            title="Delete book"
                            aria-label={`Delete ${book.title}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit book modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingId !== null ? "Edit Book" : "Add New Book"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter book information and select its categories.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Book Title" required>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    className="form-input"
                    placeholder="Enter book title"
                  />
                </FormField>

                <FormField label="Author" required>
                  <input
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="form-input"
                    placeholder="Enter author name"
                  />
                </FormField>

                <FormField label="ISBN">
                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    maxLength={20}
                    className="form-input"
                    placeholder="Enter ISBN"
                  />
                </FormField>

                <FormField label="Published Year">
                  <input
                    type="number"
                    name="published_year"
                    value={form.published_year}
                    onChange={handleChange}
                    min="1"
                    max="9999"
                    className="form-input"
                    placeholder="e.g. 2025"
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  placeholder="Enter a short description"
                />
              </FormField>

              {/* Multiple category selection */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Tags size={17} />
                    Categories
                  </label>

                  <span className="text-xs text-gray-500">
                    {selectedCategories.length} selected
                  </span>
                </div>

                {categories.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                    No categories found. Create categories first in the
                    Categories page.
                  </div>
                ) : (
                  <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                    {categories.map((category) => {
                      const checked = selectedCategories.includes(
                        String(category.id)
                      );

                      return (
                        <label
                          key={category.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                            checked
                              ? "border-blue-300 bg-blue-50 text-blue-800"
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategory(category.id)}
                            className="h-4 w-4 accent-blue-600"
                          />

                          <span className="font-medium">
                            {category.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Select multiple categories if the book belongs to more
                  than one.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}
