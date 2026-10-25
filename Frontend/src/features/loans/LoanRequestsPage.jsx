
import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";

import {
  getAllLoanRequests,
  reviewLoanRequest,
} from "./loanRequestApi";

export default function LoanRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [notes, setNotes] = useState({});

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllLoanRequests();

      const rows = Array.isArray(response)
        ? response
        : response.data;

      setRequests(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load loan requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleReview(request, status) {
    const action = status === "approved" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} this request?`
      )
    ) {
      return;
    }

    try {
      setProcessingId(request.id);
      setError("");

      await reviewLoanRequest(
        request.id,
        status,
        notes[request.id] || ""
      );

      setNotes((previous) => {
        const updated = { ...previous };
        delete updated[request.id];
        return updated;
      });

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} this request.`
      );
    } finally {
      setProcessingId(null);
    }
  }

  const pending = requests.filter(
    (item) => item.status === "pending"
  ).length;

  const approved = requests.filter(
    (item) => item.status === "approved"
  ).length;

  const rejected = requests.filter(
    (item) => item.status === "rejected"
  ).length;

  function studentName(request) {
    return (
      request.student_name ||
      request.user_name ||
      request.user?.name ||
      request.email ||
      request.user?.email ||
      "Unknown student"
    );
  }

  function bookTitle(request) {
    return (
      request.book_title ||
      request.book?.title ||
      request.title ||
      "Unknown book"
    );
  }

  function dateText(date) {
    return date ? new Date(date).toLocaleDateString() : "—";
  }

  function statusClass(status) {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-800";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Loan Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage student borrowing requests.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending"
          count={pending}
          icon={<Clock size={22} />}
          color="text-yellow-600"
        />
        <StatCard
          title="Approved"
          count={approved}
          icon={<CheckCircle size={22} />}
          color="text-green-600"
        />
        <StatCard
          title="Rejected"
          count={rejected}
          icon={<XCircle size={22} />}
          color="text-red-600"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All Student Requests
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />
            <h3 className="font-semibold text-gray-800">
              No requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              New student requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Book</th>
                  <th className="px-5 py-3">Request date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Review note</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {studentName(request)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {bookTitle(request)}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {dateText(request.requested_at)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {request.status === "pending" ? (
                        <input
                          value={notes[request.id] || ""}
                          onChange={(event) =>
                            setNotes((previous) => ({
                              ...previous,
                              [request.id]: event.target.value,
                            }))
                          }
                          placeholder="Optional note"
                          className="w-36 rounded-lg border px-2 py-2 outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-gray-500">
                          {request.review_note || "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {request.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleReview(request, "approved")
                            }
                            disabled={processingId !== null}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleReview(request, "rejected")
                            }
                            disabled={processingId !== null}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Already reviewed
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

function StatCard({ title, count, icon, color }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className={color}>{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {count}
      </p>
    </div>
  );
}
