
import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { UserButton } from "@clerk/react";

import Sidebar from "./Sidebar.jsx";
import DashboardHome from "./DashboardHome.jsx";

import BooksPage from "../books/BooksPage.jsx";
import BookCopiesPage from "../bookCopies/BookCopiesPage.jsx";
import UsersPage from "../users/UsersPage.jsx";
import LoansPage from "../loans/LoansPage.jsx";
import MyLoansPage from "../loans/MyLoansPage.jsx";
import CategoriesPage from "../categories/CategoriesPage.jsx";

export default function DashboardLayout({ user }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitles = {
    dashboard: "Dashboard",
    books: "Books",
    "book-copies": "Book Copies",
    users: "Users",
    loans: "Loans Management",
    "my-loans": "My Loans",
    categories: "Categories",
  };

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome user={user} />;

      case "books":
        return <BooksPage user={user} />;

      case "book-copies":
        if (user?.role !== "librarian") {
          return <AccessDenied />;
        }
        return <BookCopiesPage user={user} />;

      case "users":
        if (user?.role !== "librarian") {
          return <AccessDenied />;
        }
        return <UsersPage user={user} />;

      case "loans":
        if (user?.role !== "librarian") {
          return <AccessDenied />;
        }
        return <LoansPage user={user} />;

      case "my-loans":
        if (user?.role !== "student") {
          return <AccessDenied />;
        }
        return <MyLoansPage user={user} />;

      case "categories":
        return <CategoriesPage user={user} />;

      default:
        return <DashboardHome user={user} />;
    }
  }

  function handlePageChange(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activePage={activePage}
        setActivePage={handlePageChange}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="min-h-screen lg:ml-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {pageTitles[activePage] || "Dashboard"}
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Library Management System
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 md:flex">
              <Search size={17} className="text-gray-400" />
              <span className="text-sm text-gray-400">
                Search coming soon
              </span>
            </div>

            <button
              type="button"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
              title="Notifications coming soon"
            >
              <Bell size={20} />
            </button>

            {/* Clerk user profile and sign-out menu */}
            <UserButton />
          </div>
        </header>

        {/* Current page */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-red-600">
        Access Denied
      </h2>

      <p className="mt-2 text-gray-600">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
