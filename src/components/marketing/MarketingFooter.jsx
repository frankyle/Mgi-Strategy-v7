export default function MarketingFooter() {
  return (
    <footer className="border-t border-line mt-24 bg-base">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-muted">
        <div>
          <p className="font-display text-ink font-semibold mb-1">MGI Strategy</p>
          <p className="max-w-sm">
            Daily forex, stock, and commodities trade setups with entry, stop-loss,
            and take-profit levels — tracked straight through to your dashboard.
          </p>
        </div>
        <div className="text-xs max-w-sm leading-relaxed">
          <p className="text-ink mb-1">Risk disclosure</p>
          <p>
            Trading forex and stocks carries a high level of risk and may not be
            suitable for everyone. Signals are educational information, not
            individual financial advice. Past results don't guarantee future
            performance — never risk money you can't afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
}
