import { Link } from "react-router-dom";
import Ticker from "../components/marketing/Ticker";
import PreviewSignalCard from "../components/marketing/PreviewSignalCard";
import { previewSignals } from "../data/marketingSignals";

const previewSignal = previewSignals[0];

const steps = [
  {
    step: "1",
    title: "Pick a plan",
    body: "Start free for daily forex setups, or go Pro for forex, stocks, and commodities together.",
  },
  {
    step: "2",
    title: "Get the call",
    body: "Every setup ships with an entry, stop-loss, and take-profit level — no guessing what to do with it.",
  },
  {
    step: "3",
    title: "Manage the trade",
    body: "Follow the note on why the setup triggered, and your dashboard updates the moment it closes.",
  },
];

export default function Landing() {
  return (
    <>
      <Ticker />

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Trade calls with a level, not a guess.
          </h1>
          <p className="text-muted mt-5 text-lg leading-relaxed max-w-md">
            MGI Strategy posts entry, stop-loss, and take-profit levels for forex
            and stock setups — tracked, graded, and journaled in one dashboard,
            so you know exactly where you're in and exactly where you're out.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              to="/signup"
              className="bg-long text-base px-6 py-3 rounded-sm font-medium hover:bg-long/90 transition-colors"
            >
              Start free — get today's setup
            </Link>
            <Link
              to="/pricing"
              className="border border-line px-6 py-3 rounded-sm font-medium text-muted hover:text-ink hover:border-muted transition-colors"
            >
              See plans
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Example signal</p>
          <PreviewSignalCard signal={previewSignal} />
        </div>
      </section>

      <section className="border-y border-line bg-panel">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <span className="font-mono text-muted text-sm mt-1">{s.step}</span>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold mb-4">
            Built on a trading desk's habits, not a marketing team's.
          </h2>
          <p className="text-muted leading-relaxed">
            Every call comes from the same read of price action we'd use on our
            own accounts: structure, session timing, and where the risk actually
            sits — written out in plain language, then tracked all the way
            through to a graded outcome in the journal.
          </p>
        </div>
      </section>

      <section className="bg-panel border-y border-line">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
            Your next setup is already loading.
          </h2>
          <Link
            to="/signup"
            className="inline-block bg-long text-base px-6 py-3 rounded-sm font-medium hover:bg-long/90 transition-colors mt-2"
          >
            Create your free account
          </Link>
        </div>
      </section>
    </>
  );
}
