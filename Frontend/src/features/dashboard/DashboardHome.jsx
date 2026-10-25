
import { useEffect, useState } from "react";
import { getDashboardStats } from "./dashboardApi.js";

export default function DashboardHome({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load dashboard statistics."
        );
      }

      setStats(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Books",
      value: stats?.total_books ?? 0,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Copies",
      value: stats?.total_copies ?? 0,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Active Loans",
      value: stats?.active_loans ?? 0,
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Registered Users",
      value: stats?.registered_users ?? 0,
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {user.name}!
        </h2>

        <p className="mt-2 text-gray-600">
          Here is an overview of your library.
        </p>

        <span className="mt-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium capitalize text-indigo-700">
          {user.role} account
        </span>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Library Overview
          </h2>

          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="rounded-lg bg-white p-6 text-gray-600 shadow-sm">
            Loading dashboard statistics...
          </p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-medium">Unable to load statistics</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={loadStats}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <p
                  className={`mt-3 inline-flex rounded-lg px-3 py-2 text-2xl font-bold ${card.color}`}
                >
                  {card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
