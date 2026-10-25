
import { useCallback, useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./userApi.js";

const initialForm = {
  name: "",
  email: "",
  role: "student",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // READ: Fetch all users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllUsers();
      setUsers(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  // CREATE / UPDATE
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };

      if (editingId !== null) {
        await updateUser(editingId, data);
        setMessage("User updated successfully.");
      } else {
        await createUser(data);
        setMessage("User created successfully.");
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  // Load selected user into the form
  function handleEdit(user) {
    setEditingId(user.id);

    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // DELETE
  async function handleDelete(user) {
    if (!window.confirm(`Delete user ${user.name}?`)) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteUser(user.id);

      setUsers((previous) =>
        previous.filter((item) => item.id !== user.id)
      );

      if (editingId === user.id) {
        resetForm();
      }

      setMessage("User deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete user."
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          User Management
        </h1>

        <p className="mt-2 text-gray-500">
          Manage students and librarians.
        </p>
      </div>

      {/* CREATE / UPDATE FORM */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">
          {editingId !== null ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Enter full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                maxLength={255}
                required
                placeholder="user@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update User"
                  : "Add User"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* FEEDBACK */}
      {message && (
        <div
          role="status"
          className="rounded-lg bg-green-50 p-4 text-green-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <h2 className="text-xl font-semibold">
            All Users ({users.length})
          </h2>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">{user.id}</td>

                    <td className="px-5 py-4 font-medium">
                      {user.name}
                    </td>

                    <td className="px-5 py-4">{user.email}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "librarian"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-md bg-amber-100 px-3 py-2 text-amber-800 hover:bg-amber-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded-md bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
