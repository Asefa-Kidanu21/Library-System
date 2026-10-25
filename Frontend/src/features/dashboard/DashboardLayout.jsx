import { useEffect, useState } from "react";
import { Menu, Bell, Search, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/react";

import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";

import BooksPage from "../books/BooksPage";
import BookCopiesPage from "../bookCopies/BookCopiesPage";
import CategoriesPage from "../categories/CategoriesPage";
import UsersPage from "../users/UsersPage";
import LoansPage from "../loans/LoansPage";
import MyLoansPage from "../loans/MyLoansPage";
import LoanRequestsPage from "../loans/LoanRequestsPage";

export default function DashboardLayout({ user }) {
  const isLibrarian = user?.role === "librarian";

  const [activePage, setActivePage] = useState(
    isLibrarian ? "dashboard" : "books"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setActivePage(isLibrarian ? "dashboard" : "books");
  }, [isLibrarian]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function handlePageChange(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Sparkles size={26} />
          </div>
          <p className="mt-4 font-semibold text-slate-800">
            Preparing your library...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Loading your account and workspace.
          </p>
        </div>
      </div>
    );
  }

  const pageTitles = {
    dashboard: "Dashboard",
    books: isLibrarian ? "Manage Books" : "Browse Books",
    "book-copies": "Book Copies",
    categories: "Categories",
    users: "Manage Users",
    loans: "Manage Loans",
    "my-loans": "My Loans",
    "loan-requests": "Loan Requests",
  };

  const pageDescriptions = {
    dashboard: "Monitor your library and track its activity.",
    books: isLibrarian
      ? "Organize and maintain your book collection."
      : "Discover your next favorite book.",
    "book-copies": "Manage physical copies and availability.",
    categories: "Organize books into meaningful categories.",
    users: "Manage library members and their accounts.",
    loans: "Track borrowed books and their return dates.",
    "my-loans": "View your borrowed books and loan history.",
    "loan-requests": "Review and manage borrowing requests.",
  };

  function AccessDenied() {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Bell size={28} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Access denied
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your account doesn't have permission to access this section.
        </p>

        <button
          type="button"
          onClick={() =>
            handlePageChange(isLibrarian ? "dashboard" : "books")
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Return to {isLibrarian ? "Dashboard" : "Books"}
        </button>
      </div>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return isLibrarian ? <DashboardHome /> : <AccessDenied />;

      case "books":
        return <BooksPage user={user} isLibrarian={isLibrarian} />;

      case "book-copies":
        return isLibrarian ? (
          <BookCopiesPage user={user} />
        ) : (
          <AccessDenied />
        );

      case "categories":
        return isLibrarian ? (
          <CategoriesPage user={user} />
        ) : (
          <AccessDenied />
        );

      case "users":
        return isLibrarian ? (
          <UsersPage user={user} />
        ) : (
          <AccessDenied />
        );

      case "loans":
        return isLibrarian ? (
          <LoansPage user={user} />
        ) : (
          <AccessDenied />
        );

      case "my-loans":
        return !isLibrarian ? (
          <MyLoansPage
            user={user}
            onBrowseBooks={() => handlePageChange("books")}
          />
        ) : (
          <AccessDenied />
        );

      case "loan-requests":
        return isLibrarian ? (
          <LoanRequestsPage user={user} />
        ) : (
          <AccessDenied />
        );

      default:
        return isLibrarian ? (
          <DashboardHome />
        ) : (
          <BooksPage user={user} isLibrarian={false} />
        );
    }
  }

  const title = pageTitles[activePage] || "Library Management";
  const description =
    pageDescriptions[activePage] ||
    "Your library workspace, all in one place.";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        activePage={activePage}
        setActivePage={handlePageChange}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="min-h-screen lg:pl-70">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-19 items-center justify-between gap-3 px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                    {title}
                  </h1>

                  <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex">
                    Workspace
                  </span>
                </div>

                <p className="mt-1 hidden truncate text-xs text-slate-500 sm:block sm:text-sm">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                <Search size={15} className="text-slate-400" />
                <span className="text-xs text-slate-500">
                  Library workspace
                </span>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
                <Bell size={19} />
              </div>

              <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="hidden text-right sm:block">
                  <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                    {user?.name || user?.email || "Library User"}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-slate-500">
                    {user?.role || "User"}
                  </p>
                </div>

                <div className="rounded-full ring-2 ring-slate-100 ring-offset-2">
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main page */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
          <div className="animate-[fadeIn_0.35s_ease-out]">
            {renderPage()}
          </div>

          <footer className="mt-12 border-t border-slate-200/80 py-5">
            <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
              <p>© {new Date().getFullYear()} Library Management System</p>
              <p className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Your library workspace
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}