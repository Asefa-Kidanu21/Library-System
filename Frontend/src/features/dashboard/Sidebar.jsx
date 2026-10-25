
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookMarked,
  Tags,
  X,
  Library,
  Copy,
} from "lucide-react";

const librarianItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "books",
    label: "Books",
    icon: BookOpen,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "loans",
    label: "Loans",
    icon: BookMarked,
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
  },
  {
  id: "book-copies",
  label: "Book Copies",
  icon: Copy,
},
];

const studentItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "books",
    label: "Books",
    icon: BookOpen,
  },
  {
    id: "my-loans",
    label: "My Loans",
    icon: BookMarked,
  },
];

export default function Sidebar({
  user,
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}) {
  const isLibrarian = user?.role === "librarian";

  const menuItems = isLibrarian
    ? librarianItems
    : studentItems;

  function handleNavigation(page) {
    setActivePage(page);

    if (setIsOpen) {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              <Library size={22} />
            </div>

            <div>
              <h1 className="font-bold">Library System</h1>
              <p className="text-xs text-slate-400">
                Management Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User information */}
        <div className="border-b border-slate-700 px-5 py-4">
          <p className="truncate font-medium">
            {user?.name || "Library User"}
          </p>

          <p className="mt-1 text-xs capitalize text-slate-400">
            {user?.role || "student"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          <p className="text-xs text-slate-400">
            Library Management System
          </p>
        </div>
      </aside>
    </>
  );
}
