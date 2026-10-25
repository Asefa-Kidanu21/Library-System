
import { useEffect, useState } from "react";
import {
  BookOpen,
  BookMarked,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getMyLoans } from "./loanApi";

export default function MyLoansPage({ onBrowseBooks }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLoans() {
    try {
      setLoading(true);
      setError("");

      const result = await getMyLoans();

      if (result?.success === false) {
        throw new Error(result.message || "Failed to load your loans.");
      }

      const loanData = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setLoans(loanData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your borrowed books."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  function getLoanStatus(loan) {
    if (loan.returned_at) return "Returned";
    if (new Date(loan.due_at) < new Date()) return "Overdue";
    return "Active";
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString();
  }

  function getBookTitle(loan) {
    return (
      loan.book_title ||
      loan.title ||
      loan.book?.title ||
      "Book title unavailable"
    );
  }

  function getBarcode(loan) {
    return loan.barcode || loan.book_barcode || "—";
  }

  const activeLoans = loans.filter(
    (loan) => getLoanStatus(loan) === "Active"
  );

  const overdueLoans = loans.filter(
    (loan) => getLoanStatus(loan) === "Overdue"
  );

  const returnedLoans = loans.filter(
    (loan) => getLoanStatus(loan) === "Returned"
  );

  return (
    <div className="space-y-6">
      {/* Page heading — top Browse Books button removed */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          My Loans
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View your borrowed books, due dates, and borrowing history.
        </p>
      </div>

      {/* Keep the lower Explore Library button */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-gray-900">
            Looking for another book?
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Explore the library catalog and discover your next book.
          </p>
        </div>

        <button
          type="button"
          onClick={onBrowseBooks}
          className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
        >
          Explore Library
        </button>
      </div>

      {/* Loan statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Loans"
          value={loans.length}
          icon={<BookMarked size={22} />}
        />

        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          icon={<BookOpen size={22} />}
        />

        <StatCard
          title="Overdue Books"
          value={overdueLoans.length}
          icon={<AlertCircle size={22} />}
        />

        <StatCard
          title="Returned Books"
          value={returnedLoans.length}
          icon={<CheckCircle size={22} />}
        />
      </div>

      {/* Loan history */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Borrowing History
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              All your current and previous loans.
            </p>
          </div>

          <button
            type="button"
            onClick={loadLoans}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your borrowed books...
            </p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle
              size={40}
              className="mx-auto text-red-500"
            />

            <h3 className="mt-3 font-semibold text-gray-900">
              Unable to load your loans
            </h3>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadLoans}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen
              size={44}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              You haven't borrowed any books yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Browse the library to discover books you might enjoy.
            </p>

            <button
              type="button"
              onClick={onBrowseBooks}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <BookOpen size={18} />
              Browse Books
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Book</TableHeader>
                  <TableHeader>Barcode</TableHeader>
                  <TableHeader>Borrowed Date</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Returned Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => {
                  const status = getLoanStatus(loan);

                  return (
                    <tr
                      key={loan.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <BookOpen size={20} />
                          </div>

                          <span className="font-medium text-gray-900">
                            {getBookTitle(loan)}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {getBarcode(loan)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(loan.borrowed_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(loan.due_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {formatDate(loan.returned_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <LoanStatus status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && loans.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-3 text-sm text-gray-500">
            Showing {loans.length} loan
            {loans.length === 1 ? "" : "s"}.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}

function LoanStatus({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
    Returned: "bg-gray-100 text-gray-700",
  };

  const icons = {
    Active: <Clock size={14} />,
    Overdue: <AlertCircle size={14} />,
    Returned: <CheckCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.Active
      }`}
    >
      {icons[status] || icons.Active}
      {status}
    </span>
  );
}
