
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Tags,
  X,
} from "lucide-react";

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryApi.js";

export default function CategoriesPage({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLibrarian = user?.role === "librarian";

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAllCategories();
      setCategories(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateForm() {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
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

    setError("");
    setMessage("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      let result;

      if (editingId !== null) {
        result = await updateCategory(editingId, {
          name,
          description,
        });
      } else {
        result = await createCategory({
          name,
          description,
        });
      }

      setMessage(
        result.message ||
          (editingId !== null
            ? "Category updated successfully."
            : "Category created successfully.")
      );

      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "" });

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const result = await deleteCategory(category.id);
      setMessage(result.message || "Category deleted successfully.");
      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this category."
      );
    }
  }

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      String(category.name || "").toLowerCase().includes(searchText) ||
      String(category.description || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Organize books into categories so they are easier to discover.
          </p>
        </div>

        {isLibrarian && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      {/* Feedback */}
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

      {/* Create/Edit form */}
      {showForm && isLibrarian && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId !== null ? "Edit Category" : "Create Category"}
            </h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <label
              htmlFor="category-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Category Name
            </label>

            <input
              id="category-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              required
              placeholder="e.g. Programming"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="category-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={10000}
              rows={3}
              placeholder="Describe the books in this category..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
                  : "Create Category"}
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Tags size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {categories.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Tags size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Books Categorized</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {categories.reduce(
                (total, category) =>
                  total + Number(category.book_count || 0),
                0
              )}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Category-book relationships
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Search size={19} className="text-gray-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search categories..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Categories table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="font-semibold text-gray-800">
            All Categories
          </h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">
            Loading categories...
          </p>
        ) : filteredCategories.length === 0 ? (
          <div className="p-10 text-center">
            <Tags className="mx-auto text-gray-400" size={40} />

            <p className="mt-3 font-medium text-gray-700">
              No categories found.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try a different search."
                : "Create your first category to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Books</th>
                  {isLibrarian && (
                    <th className="px-5 py-3 font-medium">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <Tags size={18} />
                        </div>

                        <span className="font-medium text-gray-800">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-sm px-5 py-4 text-gray-600">
                      {category.description || "No description"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {category.book_count ?? 0}
                      </span>
                    </td>

                    {isLibrarian && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            title="Edit category"
                            aria-label={`Edit ${category.name}`}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            title="Delete category"
                            aria-label={`Delete ${category.name}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
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
