
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "./bookApi.js";

import {
  getMyLoanRequests,
  createLoanRequest,
} from "../loans/loanRequestApi.js";

export default function BooksPage({ user, isLibrarian: librarianProp }) {
  const isLibrarian =
    librarianProp ?? user?.role === "librarian";

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [requestingId, setRequestingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    published_year: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categoriesError, setCategoriesError] = useState("");

  const normalizeList = (result, key) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.[key])) return result.data[key];
    return [];
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setCategoriesError("");

    const tasks = [
      getBooks(),
      import("../categories/categoryApi.js").then((module) =>
        module.getAllCategories()
      ),
    ];

    if (!isLibrarian) {
      tasks.push(getMyLoanRequests());
    }

    try {
      const results = await Promise.allSettled(tasks);

      if (results[0].status === "fulfilled") {
        setBooks(normalizeList(results[0].value, "books"));
      } else {
        console.error("Load books error:", results[0].reason);
        setError(
          results[0].reason?.response?.data?.message ||
            "Unable to load books."
        );
      }

      if (results[1].status === "fulfilled") {
        setCategories(normalizeList(results[1].value, "categories"));
      } else {
        console.error("Load categories error:", results[1].reason);
        setCategoriesError("Unable to load categories.");
      }

      if (!isLibrarian) {
        if (results[2].status === "fulfilled") {
          setRequests(normalizeList(results[2].value, "requests"));
        } else {
          console.error("Load requests error:", results[2].reason);
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isLibrarian]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingId(null);
    setForm({
      title: "",
      author: "",
      isbn: "",
      description: "",
      published_year: "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(book) {
    setEditingId(book.id);
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      isbn: book.isbn ?? "",
      description: book.description ?? "",
      published_year: book.published_year
        ? String(book.published_year)
        : "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isLibrarian) return;

    setError("");
    setMessage("");

    if (!form.title.trim() || !form.author.trim()) {
      setError("Book title and author are required.");
      return;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || null,
      description: form.description.trim() || null,
      published_year: form.published_year
        ? Number(form.published_year)
        : null,
    };

    if (
      bookData.published_year !== null &&
      (!Number.isInteger(bookData.published_year) ||
        bookData.published_year < 0 ||
        bookData.published_year > 9999)
    ) {
      setError("Enter a valid publication year.");
      return;
    }

    setSaving(true);

    try {
      const result =
        editingId !== null
          ? await updateBook(editingId, bookData)
          : await createBook(bookData);

      setMessage(
        result?.message ||
          (editingId !== null
            ? "Book updated successfully."
            : "Book created successfully.")
      );

      setShowForm(false);
      setEditingId(null);

      await loadData();
    } catch (err) {
      console.error("Save book error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to save book. Check the backend response."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    if (!isLibrarian) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const result = await deleteBook(book.id);
      setMessage(result?.message || "Book deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Delete book error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to delete this book. It may have associated copies or loans."
      );
    }
  }

  async function handleRequest(bookId) {
    if (isLibrarian) return;

    setRequestingId(bookId);
    setError("");
    setMessage("");

    try {
      const result = await createLoanRequest(bookId);
      setMessage(
        result?.message || "Borrowing request submitted successfully."
      );

      const updatedRequests = await getMyLoanRequests();
      setRequests(normalizeList(updatedRequests, "requests"));
    } catch (err) {
      console.error("Create loan request error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to submit your borrowing request."
      );
    } finally {
      setRequestingId(null);
    }
  }

  function findRequest(bookId) {
    return requests.find((request) => {
      const requestBookId =
        request.book_id ??
        request.bookId ??
        request.book?.id;

      return (
        String(requestBookId) === String(bookId) &&
        ["pending", "approved"].includes(
          String(request.status ?? "").toLowerCase()
        )
      );
    });
  }

  const filteredBooks = books.filter((book) => {
    const query = search.toLowerCase();

    return [book.title, book.author, book.isbn].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLibrarian ? "Manage Books" : "Browse Books"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLibrarian
              ? "Add, edit, and manage library books."
              : "Browse books and submit borrowing requests."}
          </p>
        </div>

        <div className="flex gap-2">
          {isLibrarian && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Book
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit book form */}
      {showForm && isLibrarian && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingId !== null ? "Edit Book" : "Add New Book"}
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="book-title" className="mb-1 block text-sm font-medium">
                Title *
              </label>
              <input
                id="book-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={255}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                placeholder="Book title"
              />
            </div>

            <div>
              <label htmlFor="book-author" className="mb-1 block text-sm font-medium">
                Author *
              </label>
              <input
                id="book-author"
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                maxLength={255}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                placeholder="Author name"
              />
            </div>

            <div>
              <label htmlFor="book-isbn" className="mb-1 block text-sm font-medium">
                ISBN
              </label>
              <input
                id="book-isbn"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                maxLength={50}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                placeholder="ISBN"
              />
            </div>

            <div>
              <label htmlFor="book-year" className="mb-1 block text-sm font-medium">
                Publication Year
              </label>
              <input
                id="book-year"
                name="published_year"
                type="number"
                min="0"
                max="9999"
                value={form.published_year}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                placeholder="e.g. 2024"
              />
            </div>
          </div>

          <div>
            <label htmlFor="book-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="book-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              placeholder="Describe the book..."
            />
          </div>

          <p className="text-xs text-gray-500">
            Categories are managed separately on the Categories page.
            Physical copies are managed on the Book Copies page.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Create Book"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Search size={19} className="text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {categoriesError && (
        <p className="text-sm text-amber-700">{categoriesError}</p>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading books...
        </p>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <BookOpen size={40} className="mx-auto text-gray-400" />
          <p className="mt-3 font-medium text-gray-700">
            No books found.
          </p>
          {isLibrarian && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add your first book
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => {
            const request = findRequest(book.id);

            return (
              <article
                key={book.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                    <BookOpen size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-800">
                      {book.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {book.author || "Unknown author"}
                    </p>
                  </div>
                </div>

                {book.isbn && (
                  <p className="mt-3 text-sm text-gray-500">
                    ISBN: {book.isbn}
                  </p>
                )}

                {book.published_year && (
                  <p className="mt-1 text-sm text-gray-500">
                    Published: {book.published_year}
                  </p>
                )}

                {book.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                    {book.description}
                  </p>
                )}

                {isLibrarian ? (
                  <div className="mt-auto flex gap-2 pt-5">
                    <button
                      type="button"
                      onClick={() => openEditForm(book)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(book)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto pt-5">
                    {request ? (
                      <p className="rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium capitalize text-blue-700">
                        Request {request.status}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequest(book.id)}
                        disabled={requestingId === book.id}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {requestingId === book.id
                          ? "Submitting..."
                          : "Request to Borrow"}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
