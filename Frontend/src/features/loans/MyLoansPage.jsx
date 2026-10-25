


import { useEffect, useState } from "react";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getMyLoans } from "./loanApi.js";

export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyLoans() {
      try {
        const result = await getMyLoans();
        setLoans(result.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your loans. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMyLoans();
  }, []);

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const activeCount = loans.filter(
    (loan) => loan.loan_status === "active"
  ).length;

  const overdueCount = loans.filter(
    (loan) => loan.loan_status === "overdue"
  ).length;

  const returnedCount = loans.filter(
    (loan) => loan.loan_status === "returned"
  ).length;

  function getStatusStyle(status) {
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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Loans</h2>
        <p className="mt-1 text-sm text-gray-500">
          View your borrowed books and return deadlines.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Active Loans"
          value={activeCount}
          icon={<BookOpen size={22} />}
        />

        <SummaryCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertCircle size={22} />}
        />

        <SummaryCard
          title="Returned"
          value={returnedCount}
          icon={<CheckCircle size={22} />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="font-semibold text-gray-800">
            My Borrowing History
          </h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">
            Loading your loans...
          </p>
        ) : loans.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="mx-auto text-gray-400" size={40} />
            <p className="mt-3 font-medium text-gray-700">
              You have no borrowing records yet.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Visit the Books page to explore the library collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Book</th>
                  <th className="px-5 py-3 font-medium">Author</th>
                  <th className="px-5 py-3 font-medium">Borrowed</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {loan.book_title}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {loan.book_author || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(loan.borrowed_at)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(loan.due_at)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(loan.loan_status)}`}
                      >
                        {loan.loan_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Clock size={20} className="mt-0.5 shrink-0 text-amber-700" />

        <div>
          <p className="font-medium text-amber-900">Remember your due dates</p>
          <p className="mt-1 text-sm text-amber-800">
            Please return borrowed books by their due dates. Contact the
            librarian if you need help with a loan.
          </p>
        </div>
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
