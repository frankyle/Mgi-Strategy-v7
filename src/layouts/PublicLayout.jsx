import { Outlet } from "react-router-dom";
import MarketingNavbar from "../components/marketing/MarketingNavbar";
import MarketingFooter from "../components/marketing/MarketingFooter";

// Chrome for anonymous/marketing pages (Landing, Pricing) — deliberately
// separate from DashboardLayout (sidebar + app header), which is only for
// the signed-in app under /dashboard.
//
// Works two ways: as a react-router layout Route (renders its matched child
// via <Outlet/>, e.g. for /pricing), or as a plain wrapper with an explicit
// `children` prop (used by RootRoute, which isn't itself a Route with nested
// children — it just needs the same chrome around <Landing/>).
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-base text-ink">
      <MarketingNavbar />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <MarketingFooter />
    </div>
  );
}
