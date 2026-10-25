import {
  LayoutDashboard,
  BookOpen,
  Copy,
  Users,
  ClipboardList,
  BookMarked,
  Tags,
  X,
  Library,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  user,
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}) {
  const isLibrarian = user?.role === "librarian";

  const librarianItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "books", label: "Manage Books", icon: BookOpen },
    { id: "book-copies", label: "Book Copies", icon: Copy },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "loans", label: "Manage Loans", icon: ClipboardList },
    { id: "loan-requests", label: "Loan Requests", icon: BookMarked },
  ];

  const studentItems = [
    { id: "books", label: "Browse Books", icon: BookOpen },
    { id: "my-loans", label: "My Loans", icon: BookMarked },
  ];

  const menuItems = isLibrarian ? librarianItems : studentItems;

  function handleClick(page) {
    setActivePage(page);
    setIsOpen(false);
  }

  const displayName = user?.name || user?.email || "Library User";

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-70 flex-col overflow-hidden bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="relative flex h-24 shrink-0 items-center justify-between border-b border-white/10 px-6">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-950/40">
              <Library size={25} strokeWidth={2.2} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white">
                My Library
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {isLibrarian ? "Librarian Portal" : "Student Portal"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="relative rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User profile */}
        <div className="mx-4 mt-6 rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 to-blue-600 text-sm font-bold text-white shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="mt-1 text-xs capitalize text-slate-400">
                {user?.role || "User"}
              </p>
            </div>

            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-900 ${
                isLibrarian ? "bg-violet-400" : "bg-emerald-400"
              }`}
              title="Account role"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {isLibrarian ? "Library management" : "Your library"}
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40"
                    : "text-slate-400 hover:translate-x-1 hover:bg-white/6 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-white/80" />
                )}

                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={`shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:scale-110 group-hover:text-blue-300"
                  }`}
                />

                <span className="flex-1">{item.label}</span>

                {isActive && (
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-white/80"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom information card */}
        <div className="shrink-0 px-4 pb-5">
          <div className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-linear-to-br from-blue-500/15 to-indigo-500/10 p-4">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative flex items-center gap-2">
              <Sparkles size={17} className="text-blue-300" />
              <span className="text-xs font-semibold text-white">
                Your knowledge hub
              </span>
            </div>

            <p className="relative mt-2 text-xs leading-5 text-slate-400">
              Discover books, manage resources, and keep your library organized.
            </p>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 text-center">
            <p className="text-[10px] font-medium tracking-wide text-slate-500">
              LIBRARY MANAGEMENT SYSTEM
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              Learn something new every day.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}