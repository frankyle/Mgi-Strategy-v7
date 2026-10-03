// BottomNav.jsx — phone-only tab bar (hidden from the lg breakpoint up).
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, Lightbulb, FileText, Radio, Menu } from "lucide-react";
import { useAuthProfile } from "../../hooks/useAuthProfile";

const ADMIN_TABS = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Grader", url: "/dashboard/setup-match-grader", icon: Target },
  { title: "Ideas", url: "/dashboard/tradersidea", icon: Lightbulb },
  { title: "Report", url: "/dashboard/weekly-report", icon: FileText },
];
const USER_TABS = [{ title: "Signals", url: "/dashboard/signals", icon: Radio }];

export function BottomNav({ onMore }) {
  const { isAdmin } = useAuthProfile();
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch justify-around">
        {tabs.map((t) => (
          <li key={t.url} className="flex-1">
            <NavLink
              to={t.url}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium transition-colors ${
                  isActive ? "text-indigo-600" : "text-gray-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`px-4 py-1 rounded-full ${isActive ? "bg-indigo-50" : ""}`}>
                    <t.icon className="w-5 h-5" />
                  </span>
                  {t.title}
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li className="flex-1">
          <button
            onClick={onMore}
            className="w-full flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium text-gray-500"
          >
            <span className="px-4 py-1">
              <Menu className="w-5 h-5" />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
