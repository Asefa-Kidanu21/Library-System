
import { useCallback, useEffect, useState } from "react";
import {
  getAllBookCopies,
  createBookCopy,
  updateBookCopy,
  deleteBookCopy,
} from "./bookCopyApi.js";
import { getBooks } from "../books/bookApi.js";

const emptyForm = {
  book_id: "",
  barcode: "",
  status: "available",
};

const statuses = ["available", "borrowed", "lost", "damaged"];

export default function BookCopiesPage({ user }) {
  const isLibrarian = user?.role === "librarian";

  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [copyResult, bookResult] = await Promise.all([
        getAllBookCopies(),
        getBooks(),
      ]);

      setCopies(copyResult.data || []);
      setBooks(bookResult.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load book copies. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(copy) {
    setEditingId(copy.id);

    setForm({
      book_id: String(copy.book_id),
      barcode: copy.barcode,
      status: copy.status,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const copyData = {
        book_id: Number(form.book_id),
        barcode: form.barcode.trim(),
        status: form.status,
      };

      if (editingId !== null) {
        await updateBookCopy(editingId, copyData);
        setMessage("Book copy updated successfully.");
      } else {
        await createBookCopy(copyData);
        setMessage("Book copy registered successfully.");
      }

      cancelForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the book copy."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(copy) {
    const confirmed = window.confirm(
      `Delete barcode "${copy.barcode}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteBookCopy(copy.id);
      setMessage("Book copy deleted successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this copy. It may be linked to a loan."
      );
    }
  }

  const filteredCopies = copies.filter((copy) => {
    const query = search.toLowerCase();

    return (
      copy.barcode.toLowerCase().includes(query) ||
      copy.title.toLowerCase().includes(query) ||
      copy.author.toLowerCase().includes(query) ||
      copy.status.toLowerCase().includes(query)
    );
  });

  const statusStyle = {
    available: "bg-green-100 text-green-700",
    borrowed: "bg-blue-100 text-blue-700",
    lost: "bg-red-100 text-red-700",
    damaged: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Book Copies
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage physical copies and their barcodes.
          </p>
        </div>

        {isLibrarian && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            + Register Copy
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {showForm && isLibrarian && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold">
            {editingId !== null
              ? "Edit Book Copy"
              : "Register Book Copy"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Book *
              </label>

              <select
                name="book_id"
                value={form.book_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-2.5"
              >
                <option value="">Select a book</option>

                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Barcode *
              </label>

              <input
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full rounded-lg border p-2.5"
                placeholder="LIB-COPY-0001"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-2.5"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Copy"
                  : "Register Copy"}
            </button>

            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search barcode, book, author, or status..."
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-gray-500">
            Loading book copies...
          </p>
        ) : filteredCopies.length === 0 ? (
          <p className="p-6 text-gray-500">
            No book copies found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Barcode</th>
                  <th className="p-4">Book</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  {isLibrarian && (
                    <th className="p-4">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCopies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      {copy.barcode}
                    </td>

                    <td className="p-4">{copy.title}</td>

                    <td className="p-4">{copy.author}</td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyle[copy.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {copy.status}
                      </span>
                    </td>

                    {isLibrarian && (
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditForm(copy)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(copy)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
