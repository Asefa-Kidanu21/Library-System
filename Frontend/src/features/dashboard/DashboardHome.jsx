import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Library,
  BookMarked,
  Tags,
  Copy,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import { getDashboardStats } from "./dashboardApi";

const initialStats = {
  totalBooks: 0,
  totalCopies: 0,
  availableCopies: 0,
  totalUsers: 0,
  totalStudents: 0,
  totalLoans: 0,
  activeLoans: 0,
  overdueLoans: 0,
  pendingRequests: 0,
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  theme,
  loading,
}) {
  const themes = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      accent: "bg-blue-500",
      hover: "group-hover:border-blue-200",
      glow: "group-hover:shadow-blue-100",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500",
      hover: "group-hover:border-emerald-200",
      glow: "group-hover:shadow-emerald-100",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      accent: "bg-violet-500",
      hover: "group-hover:border-violet-200",
      glow: "group-hover:shadow-violet-100",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      accent: "bg-amber-500",
      hover: "group-hover:border-amber-200",
      glow: "group-hover:shadow-amber-100",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600",
      accent: "bg-rose-500",
      hover: "group-hover:border-rose-200",
      glow: "group-hover:shadow-rose-100",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-700",
      accent: "bg-cyan-500",
      hover: "group-hover:border-cyan-200",
      glow: "group-hover:shadow-cyan-100",
    },
  };

  const style = themes[theme] || themes.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.hover} ${style.glow}`}
    >
      <div
        className={`absolute left-0 top-0 h-1 w-full ${style.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          {loading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {Number(value ?? 0).toLocaleString()}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${style.icon}`}
        >
          <Icon size={23} strokeWidth={1.9} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${style.icon}`}
        >
          <ArrowUpRight size={12} />
        </span>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, onClick, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    violet:
      "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
    emerald:
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    amber:
      "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition-all duration-200 hover:border-slate-200 hover:shadow-md sm:p-4"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
          colors[color] || colors.blue
        }`}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
      />
    </button>
  );
}

export default function DashboardHome({ onNavigate = () => {} }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();

      const data =
        response?.stats ??
        response?.data?.stats ??
        response?.data ??
        response;

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The dashboard API returned invalid data.");
      }

      const readNumber = (...values) => {
        const value = values.find(
          (item) => item !== undefined && item !== null
        );

        const number = Number(value ?? 0);
        return Number.isFinite(number) ? number : 0;
      };

      setStats({
        totalBooks: readNumber(data.totalBooks, data.total_books),
        totalCopies: readNumber(data.totalCopies, data.total_copies),
        availableCopies: readNumber(
          data.availableCopies,
          data.available_copies
        ),
        totalUsers: readNumber(
          data.totalUsers,
          data.total_users,
          data.registered_users
        ),
        totalStudents: readNumber(data.totalStudents, data.total_students),
        totalLoans: readNumber(data.totalLoans, data.total_loans),
        activeLoans: readNumber(data.activeLoans, data.active_loans),
        overdueLoans: readNumber(data.overdueLoans, data.overdue_loans),
        pendingRequests: readNumber(
          data.pendingRequests,
          data.pending_requests
        ),
      });
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const availabilityPercentage =
    stats.totalCopies > 0
      ? Math.min(
          100,
          Math.round((stats.availableCopies / stats.totalCopies) * 100)
        )
      : 0;

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-7">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 lg:p-9">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />

        <div className="absolute right-8 top-8 hidden h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/5 sm:flex lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:h-36 lg:w-36">
          <Library
            size={72}
            strokeWidth={1}
            className="text-blue-200/80"
          />
        </div>

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-sm">
            <Sparkles size={14} />
            Library overview
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            {greeting}, Librarian!
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7">
            Welcome to your library dashboard. Monitor your collection, manage
            borrowing activity, and keep everything organized in one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("books")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <BookOpen size={17} />
              Manage books
              <ArrowUpRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("loan-requests")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              <ClipboardList size={17} />
              Review requests
            </button>
          </div>
        </div>
      </section>

      {/* Statistics heading */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-blue-600" />
              <h3 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Library at a glance
              </h3>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              An overview of your library's current activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">
                Could not load dashboard statistics
              </p>
              <p className="mt-1 text-sm">{error}</p>

              <button
                type="button"
                onClick={loadStats}
                className="mt-2 text-sm font-bold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            description="Book titles in the catalog"
            icon={BookOpen}
            theme="blue"
            loading={loading}
          />

          <StatCard
            title="Available Copies"
            value={stats.availableCopies}
            description={`${stats.totalCopies.toLocaleString()} copies in total`}
            icon={CheckCircle2}
            theme="emerald"
            loading={loading}
          />

          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            description={`${stats.totalUsers.toLocaleString()} registered users`}
            icon={Users}
            theme="violet"
            loading={loading}
          />

          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            description="Books currently borrowed"
            icon={BookMarked}
            theme="cyan"
            loading={loading}
          />

          <StatCard
            title="Overdue Loans"
            value={stats.overdueLoans}
            description="Loans past their due date"
            icon={Clock}
            theme="rose"
            loading={loading}
          />

          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            description="Requests waiting for review"
            icon={ClipboardList}
            theme="amber"
            loading={loading}
          />
        </div>
      </section>

      {/* Lower dashboard panels */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Availability */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900">
                Collection availability
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Physical copies ready to borrow
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {loading ? "—" : `${availabilityPercentage}%`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                of all copies available
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">
                {loading ? "—" : stats.availableCopies.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Available</p>
            </div>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Available book copies"
            aria-valuenow={loading ? 0 : availabilityPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-500 transition-all duration-700"
              style={{
                width: loading ? "0%" : `${availabilityPercentage}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <span className="text-slate-500">Total copies</span>
            <span className="font-bold text-slate-700">
              {loading ? "—" : stats.totalCopies.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Currently unavailable</span>
            <span className="font-bold text-slate-700">
              {loading
                ? "—"
                : Math.max(
                    0,
                    stats.totalCopies - stats.availableCopies
                  ).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900">
                Quick actions
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Get to important sections faster.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction
              icon={BookOpen}
              title="Manage books"
              description="Add or update book records"
              color="blue"
              onClick={() => onNavigate("books")}
            />

            <QuickAction
              icon={Copy}
              title="Book copies"
              description="Track physical copies"
              color="violet"
              onClick={() => onNavigate("book-copies")}
            />

            <QuickAction
              icon={Tags}
              title="Categories"
              description="Organize your collection"
              color="emerald"
              onClick={() => onNavigate("categories")}
            />

            <QuickAction
              icon={ClipboardList}
              title="Loan requests"
              description={`${stats.pendingRequests} pending review`}
              color="amber"
              onClick={() => onNavigate("loan-requests")}
            />
          </div>
        </div>
      </section>

      {/* Summary strip */}
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Library size={22} />
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Your library, one workspace
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Keep your catalog, members, and borrowing activity organized.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("users")}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white sm:self-auto"
        >
          Manage users
          <ArrowUpRight size={16} />
        </button>
      </section>
    </div>
  );
}