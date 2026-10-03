import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  ShieldCheck,
  NotebookPen,
  Layers,
  TrendingUp,
  Zap,
  ChevronDown,
} from "lucide-react";
import Ticker from "../components/marketing/Ticker";
import PreviewSignalCard from "../components/marketing/PreviewSignalCard";
import PlanCard from "../components/marketing/PlanCard";
import { CandleStrip, LiveChart } from "../components/marketing/CandleChart";
import { previewSignals } from "../data/marketingSignals";
import { plans } from "../data/plans";

const steps = [
  { icon: Layers, title: "Pick a plan", body: "Start free for daily forex setups, or go Pro for forex, stocks, and commodities together." },
  { icon: Target, title: "Get the call", body: "Every setup ships with an entry, stop-loss, and take-profit level. No guessing what to do with it." },
  { icon: TrendingUp, title: "Manage the trade", body: "Follow the note on why the setup triggered, and your dashboard updates the moment it closes." },
];

const features = [
  { icon: Target, title: "Three levels on every call", body: "Entry, stop-loss and take-profit, written out before the trade, never after." },
  { icon: ShieldCheck, title: "Risk you can see", body: "Each setup shows where it's wrong, so you size the trade before you click." },
  { icon: NotebookPen, title: "Journaled and graded", body: "Every call is tracked through to an outcome so the results speak for themselves." },
  { icon: Zap, title: "Plain-language notes", body: "A short note on why it triggered: structure, session timing, and where risk sits." },
];

const faqs = [
  { q: "What markets do the setups cover?", a: "Forex on the free plan. Pro adds stocks and commodities such as gold and indices." },
  { q: "How do I pay for Pro or Mentorship?", a: "Create your account and log in. Our customer support contact is shown inside the app, and they'll guide you through payment and upgrade your account." },
  { q: "Can I try it before paying?", a: "Yes. The Starter plan is free and gives you one forex setup per day with full levels." },
  { q: "Are the signals financial advice?", a: "No. They are educational trade ideas. Trading carries risk, so never risk money you can't afford to lose." },
];

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl bg-panel/60">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-medium">
        {q}
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-muted leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(47,191,113,0.16),transparent_55%),radial-gradient(ellipse_at_90%_30%,rgba(62,92,118,0.28),transparent_55%)]" />
        <CandleStrip className="absolute bottom-0 inset-x-0 opacity-25" height={220} />

        <div className="relative max-w-6xl mx-auto px-4 pt-14 md:pt-24 pb-24 md:pb-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-xs font-mono text-long border border-long/30 bg-long/10 rounded-full px-3 py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-long" /> Forex · Stocks · Commodities
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] mt-5"
            >
              Trade calls with a <span className="text-long">level</span>, not a guess.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.6 }}
              className="text-muted mt-6 text-base sm:text-lg leading-relaxed max-w-lg"
            >
              MGI Strategy posts entry, stop-loss, and take-profit levels for forex and stock setups,
              tracked, graded, and journaled in one dashboard, so you know exactly where you're in
              and exactly where you're out.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 mt-8"
            >
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-long text-base px-7 py-3.5 rounded-xl font-semibold hover:bg-long/90 transition-colors shadow-[0_10px_40px_-10px_rgba(47,191,113,0.6)]">
                Start free, get today's setup <ArrowRight size={18} />
              </Link>
<Link to="/pricing" className="inline-flex items-center justify-center gap-2 border border-line px-7 py-3.5 rounded-xl font-semibold text-ink hover:border-long hover:text-long transition-colors">
                See plans
              </Link>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md text-center sm:text-left">
              {[["3", "levels per call"], ["3", "markets covered"], ["1", "dashboard"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-mono text-2xl text-ink">{n}</p>
                  <p className="text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }} className="float-y">
            <LiveChart />
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <Reveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-long mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">From signal to closed trade in three steps</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-line bg-panel/60 p-6 hover:border-long/50 transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <span className="h-11 w-11 rounded-xl bg-long/10 text-long flex items-center justify-center"><s.icon size={22} /></span>
                  <span className="font-mono text-4xl text-white/10">0{i + 1}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= EXAMPLE SIGNALS ================= */}
      <section className="border-y border-line bg-panel/40">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-long mb-3">What you receive</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">A call you can act on in seconds</h2>
            <p className="text-muted leading-relaxed max-w-md">
              Direction, entry, where it's wrong, where it pays, and a one-line reason. Every call
              is written the same way so you never have to decode it.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {previewSignals.slice(0, 2).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.12}>
                <PreviewSignalCard signal={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <Reveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-long mb-3">Why MGI Strategy</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Built on a trading desk's habits, not a marketing team's</h2>
          <p className="text-muted mt-4 leading-relaxed">
            Every call comes from the same read of price action we'd use on our own accounts,
            written in plain language and tracked through to a graded outcome.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-line p-6 bg-gradient-to-b from-panel/80 to-transparent">
                <f.icon className="text-long mb-4" size={26} />
                <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PLANS ================= */}
      <section className="border-t border-line bg-panel/30">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest text-long mb-3">Plans</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Start free. Upgrade when you're ready.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <PlanCard plan={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="max-w-3xl mx-auto px-4 py-20 md:py-24">
        <Reveal className="text-center mb-10">
          <h2 className="font-display text-3xl font-semibold">Questions, answered</h2>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((f) => (
            <Faq key={f.q} {...f} />
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(47,191,113,0.14),transparent_65%)]" />
        <CandleStrip className="absolute bottom-0 inset-x-0 opacity-25" seed={29} height={200} />
        <Reveal className="relative max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-semibold">Your next setup is already loading.</h2>
          <p className="text-muted mt-4 text-lg">Create a free account and get today's setup.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/signup" className="bg-long text-base px-8 py-3.5 rounded-xl font-semibold hover:bg-long/90 transition-colors">
              Create your free account
            </Link>
<Link to="/pricing" className="inline-flex items-center justify-center border border-line px-8 py-3.5 rounded-xl font-semibold text-ink hover:border-long hover:text-long transition-colors">
              See plans
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
