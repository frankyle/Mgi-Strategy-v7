import { Link } from "react-router-dom";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-base">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3 text-sm text-muted">
        <div>
          <p className="font-display text-ink font-semibold text-lg mb-2">MGI <span className="text-long">Strategy</span></p>
          <p className="max-w-xs">
            Daily forex, stock, and commodities trade setups with entry, stop-loss, and take-profit
            levels, tracked straight through to your dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-ink font-semibold mb-1">Quick links</p>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <Link to="/signin" className="hover:text-ink">Log in</Link>
          <Link to="/signup" className="hover:text-ink">Create account</Link>
        </div>

        <div className="text-xs leading-relaxed">
          <p className="text-ink font-semibold text-sm mb-1">Risk disclosure</p>
          <p>
            Trading forex and stocks carries a high level of risk and may not be suitable for
            everyone. Signals are educational information, not individual financial advice. Past
            results don't guarantee future performance. Never risk money you can't afford to lose.
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} MGI Strategy. All rights reserved.
      </div>
    </footer>
  );
}
