
import { useCallback, useEffect, useState } from "react";
import { BookOpen, RotateCcw, Plus, Search } from "lucide-react";

import {
  getAllLoans,
  createLoan,
  returnLoan,
} from "./loanApi.js";

import { getAllUsers } from "../users/userApi.js";
import { getAllBookCopies } from "../bookCopies/bookCopyApi.js";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [copies, setCopies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    book_copy_id: "",
    due_at: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [loanResult, userResult, copyResult] = await Promise.all([
        getAllLoans(),
        getAllUsers(),
        getAllBookCopies(),
      ]);

      setLoans(loanResult.data || []);

      setStudents(
        (userResult.data || []).filter(
          (user) => user.role === "student"
        )
      );

      setCopies(
        (copyResult.data || []).filter(
          (copy) => copy.status === "available"
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load loans. Please check your connection and permissions."
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

  async function handleIssue(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.user_id || !form.book_copy_id || !form.due_at) {
      setError("Please complete all fields.");
      return;
    }

    const dueDate = new Date(form.due_at);

    if (
      Number.isNaN(dueDate.getTime()) ||
      dueDate.getTime() <= Date.now()
    ) {
      setError("Choose a due date and time in the future.");
      return;
    }

    setSaving(true);

    try {
      const result = await createLoan({
        user_id: Number(form.user_id),
        book_copy_id: Number(form.book_copy_id),
        due_at: dueDate.toISOString(),
      });

      setMessage(result.message || "Book issued successfully.");

      setForm({
        user_id: "",
        book_copy_id: "",
        due_at: "",
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to issue this book."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReturn(loan) {
    const confirmed = window.confirm(
      `Confirm the return of "${loan.book_title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const result = await returnLoan(loan.id);
      setMessage(result.message || "Book returned successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to process this return."
      );
    }
  }

  const filteredLoans = loans.filter((loan) => {
    const searchText = search.toLowerCase();

    return (
      String(loan.student_name || "").toLowerCase().includes(searchText) ||
      String(loan.student_email || "").toLowerCase().includes(searchText) ||
      String(loan.book_title || "").toLowerCase().includes(searchText) ||
      String(loan.barcode || "").toLowerCase().includes(searchText)
    );
  });

  const activeCount = loans.filter(
    (loan) => loan.loan_status === "active"
  ).length;

  const overdueCount = loans.filter(
    (loan) => loan.loan_status === "overdue"
  ).length;

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function statusStyle(status) {
    if (status === "returned") {
      return "bg-green-100 text-green-700";
    }

    if (status === "overdue") {
      return "bg-red-100 text-red-700";
    }

    return "bg-blue-100 text-blue-700";
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Loans Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Issue books and manage borrowing records.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
            setMessage("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Issue Book
        </button>
      </div>

      {/* Notifications */}
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

      {/* Issue form */}
      {showForm && (
        <form
          onSubmit={handleIssue}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            Issue a Book
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="user_id"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Student
              </label>

              <select
                id="user_id"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              >
                <option value="">Select student</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="book_copy_id"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Available Book Copy
              </label>

              <select
                id="book_copy_id"
                name="book_copy_id"
                value={form.book_copy_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              >
                <option value="">Select book copy</option>

                {copies.map((copy) => (
                  <option key={copy.id} value={copy.id}>
                    {copy.title} — {copy.barcode}
                  </option>
                ))}
              </select>

              {copies.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No available copies. Register a copy or process a return first.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="due_at"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Due Date and Time
              </label>

              <input
                id="due_at"
                type="datetime-local"
                name="due_at"
                value={form.due_at}
                onChange={handleChange}
                min={new Date(Date.now() + 60000)
                  .toISOString()
                  .slice(0, 16)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || students.length === 0 || copies.length === 0}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Issuing..." : "Confirm Issue"}
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

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Loans"
          value={loans.length}
          icon={<BookOpen size={22} />}
        />

        <SummaryCard
          title="Active Loans"
          value={activeCount}
          icon={<BookOpen size={22} />}
        />

        <SummaryCard
          title="Overdue Loans"
          value={overdueCount}
          icon={<RotateCcw size={22} />}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Search size={19} className="text-gray-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student, email, book, or barcode..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Loans table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="font-semibold text-gray-800">
            Borrowing Records
          </h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">
            Loading loans...
          </p>
        ) : filteredLoans.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No loan records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Book</th>
                  <th className="px-5 py-3 font-medium">Barcode</th>
                  <th className="px-5 py-3 font-medium">Borrowed</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {loan.student_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.student_email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {loan.book_title}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {loan.barcode}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(loan.borrowed_at)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(loan.due_at)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(loan.loan_status)}`}
                      >
                        {loan.loan_status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {loan.loan_status !== "returned" ? (
                        <button
                          onClick={() => handleReturn(loan)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <RotateCcw size={14} />
                          Return
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Returned {formatDate(loan.returned_at)}
                        </span>
                      )}
                    </td>
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

function SummaryCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
