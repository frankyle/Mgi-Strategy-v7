import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Lightbulb,
  Package,
  X,
  LogOut,
  Target,
  Wallet,
  Newspaper,
  FileText,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuthProfile } from "../../hooks/useAuthProfile";

// adminOnly items only render for the admin account — everyone else who
// signs in only ever sees "Signals" in this list.
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: true },
  { title: "Setup Match Grader", url: "/dashboard/setup-match-grader", icon: Target, adminOnly: true },
  { title: "Signals", url: "/dashboard/signals", icon: Radio, adminOnly: false },
  { title: "Traders Ideas", url: "/dashboard/tradersidea", icon: Lightbulb, adminOnly: true },
  { title: "Weekly Report", url: "/dashboard/weekly-report", icon: FileText, adminOnly: true },
  { title: "Traders Blog", url: "/dashboard/traders-blog", icon: Newspaper, adminOnly: true },
  { title: "Finance Tracker", url: "/dashboard/finance", icon: Wallet, adminOnly: true },
  { title: "Personal Account", url: "/dashboard/personal", icon: DollarSign, adminOnly: true },
  { title: "Funded Account", url: "/dashboard/funded", icon: Package, adminOnly: true },
];

const SupportWhatsApp = lazy(() => import("../common/SupportWhatsApp"));

export function AppSidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin } = useAuthProfile();
  const navigate = useNavigate();

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const initials =
    (user?.user_metadata?.full_name || user?.email || "?")
      .trim()
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div
      className={`
        fixed lg:static z-40 inset-y-0 lg:inset-auto lg:h-auto lg:min-h-screen bg-white border-r border-gray-100 flex flex-col
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "left-0" : "-left-64"}
        lg:left-0
      `}
    >
      {/* Top section */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between h-16 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              M
            </div>
            <h2 className="text-base font-bold text-gray-900 truncate">MGI Trading Journal</h2>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
        )}

        {/* Collapse btn (desktop) */}
        <button
          className="hidden lg:flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Close button (mobile) */}
        <button
          className="lg:hidden text-gray-700"
          onClick={() => setMobileOpen(false)}
        >
          <X />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end
                title={collapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${collapsed ? "justify-center" : ""}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Customer support (signed-in only) */}
        <div className="px-2 pb-2 mt-auto pt-4">
          <Suspense fallback={null}>
            <SupportWhatsApp variant="sidebar" collapsed={collapsed} />
          </Suspense>
        </div>

        {/* User + Logout */}
        <div className="px-2 pt-3 border-t border-gray-100">
          {user && (
            <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {user.user_metadata?.full_name || "Trader"}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
