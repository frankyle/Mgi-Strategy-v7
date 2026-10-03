import { Link } from "react-router-dom";
import { plans } from "../data/plans";
import PlanCard from "../components/marketing/PlanCard";
import { CandleStrip } from "../components/marketing/CandleChart";

export default function Pricing() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(47,191,113,0.15),transparent_70%)]" />
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-long mb-3">Plans</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Pick how deep you want to go</h1>
          <p className="text-muted mt-4 text-lg">
            Start free, upgrade when you're ready for stocks and commodities alongside forex.
            Cancel any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-panel/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <p className="font-display text-xl font-semibold">Not sure which plan fits?</p>
            <p className="text-muted text-sm mt-1">
              Create a free account. Our customer support contact is available inside the app once you log in.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-long text-base font-semibold px-6 py-3 rounded-xl hover:bg-long/90 transition-colors shrink-0"
          >
            Create free account
          </Link>
        </div>
      </section>
      <CandleStrip className="absolute bottom-0 inset-x-0 opacity-20" seed={5} />
    </div>
  );
}
