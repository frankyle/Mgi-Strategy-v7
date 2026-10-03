import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function PlanCard({ plan }) {
  const paid = plan.price !== "Free";
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-1 ${
        plan.highlight
          ? "border-long bg-gradient-to-b from-long/10 to-panel shadow-[0_20px_60px_-20px_rgba(47,191,113,0.35)]"
          : "border-line bg-panel/60"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-6 bg-long text-base text-xs font-bold px-3 py-1 rounded-full">
          Most popular
        </span>
      )}
      <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
      <p className="text-sm text-muted mt-1">{plan.tagline}</p>
      <p className="font-mono text-4xl mt-5 mb-6">
        {plan.price}
        <span className="text-muted text-sm">{plan.period}</span>
      </p>
      <ul className="text-sm text-muted flex flex-col gap-2.5 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check size={16} className="text-long shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`text-center px-4 py-3 rounded-xl font-semibold transition-colors ${
          plan.highlight ? "bg-long text-base hover:bg-long/90" : "border border-line hover:border-muted"
        }`}
      >
        {plan.cta}
      </Link>
      {paid && (
        <p className="text-center text-xs text-muted mt-3">
          Create your account, then reach customer support inside the app.
        </p>
      )}
    </div>
  );
}
