import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: [
      "1 forex setup per day",
      "Entry, stop-loss, take-profit levels",
      "Community dashboard access",
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    features: [
      "All daily forex setups",
      "Stock and commodity signals",
      "Setup notes explaining each call",
      "Priority updates when trades close",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Mentorship",
    price: "$149",
    period: "/month",
    features: [
      "Everything in Pro",
      "Weekly 1-on-1 review call",
      "Custom risk plan for your account size",
    ],
    cta: "Apply now",
  },
];

export default function Pricing() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="max-w-xl mb-14">
        <h1 className="font-display text-3xl font-semibold mb-3">Plans</h1>
        <p className="text-muted">
          Start free, upgrade when you're ready for stocks and commodities
          alongside forex. Cancel any time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`border p-6 flex flex-col ${
              p.highlight ? "border-long bg-panel" : "border-line bg-panel/50"
            }`}
          >
            <h2 className="font-display text-lg font-semibold">{p.name}</h2>
            <p className="font-mono text-3xl mt-3 mb-6">
              {p.price}
              <span className="text-muted text-sm">{p.period}</span>
            </p>
            <ul className="text-sm text-muted flex flex-col gap-2 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-long">·</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className={`text-center px-4 py-2.5 rounded-sm font-medium transition-colors ${
                p.highlight
                  ? "bg-long text-base hover:bg-long/90"
                  : "border border-line hover:border-muted"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
