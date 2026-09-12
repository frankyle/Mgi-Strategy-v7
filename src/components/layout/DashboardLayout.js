import { Outlet, Link, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";
import { Menu, Search, Bell } from "lucide-react";
import { useState } from "react";
import { useAuthProfile } from "../../hooks/useAuthProfile";

const TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/personal": "Personal Account",
  "/dashboard/funded": "Funded Account",
  "/dashboard/tradersidea": "Traders Ideas",
  "/dashboard/setup-match-grader": "Setup Match Grader",
  "/dashboard/trade-blog": "Trade Blog",
  "/dashboard/signals": "Signals",
  "/dashboard/finance": "Finance Tracker",
};

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthProfile();
  const location = useLocation();

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const title = TITLES[location.pathname] || "MGI Trading Journal";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-gray-100 bg-white px-4 sm:px-6 shadow-sm justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden text-gray-700 shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          </div>

          {/* Search — desktop only, purely visual quick-jump could be wired up later */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pairs, setups…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              disabled
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!user ? (
              <>
                <Link
                  to="/signin"
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <button
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              </>
            )}
          </div>
        </header>

        <motion.main
          className="flex-1 p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
