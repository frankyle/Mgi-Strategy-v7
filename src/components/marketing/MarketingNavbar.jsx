import { Link } from "react-router-dom";
import { useAuthProfile } from "../../hooks/useAuthProfile";

export default function MarketingNavbar() {
  const { session } = useAuthProfile();

  return (
    <header className="border-b border-line bg-base sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="font-display font-semibold text-lg tracking-tight text-ink">
          MGI <span className="text-long">Strategy</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/pricing" className="text-muted hover:text-ink transition-colors">
            Pricing
          </Link>
          {session ? (
            <Link
              to="/dashboard"
              className="bg-long text-base px-4 py-2 rounded-sm font-medium hover:bg-long/90 transition-colors"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/signin" className="text-muted hover:text-ink transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-long text-base px-4 py-2 rounded-sm font-medium hover:bg-long/90 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
