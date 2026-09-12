// Sample/placeholder data for the PUBLIC marketing homepage only (Landing.jsx,
// Ticker.jsx). This has nothing to do with the real signals in the signed-in
// app (see src/pages/SignalsFeed) — it's just what an anonymous visitor sees
// as a preview before they sign up. Safe to edit freely, none of it is wired
// to Supabase.

export const previewSignals = [
  {
    id: "sig-001",
    market: "Forex",
    pair: "EUR/USD",
    direction: "long",
    entry: "1.0842",
    stopLoss: "1.0798",
    takeProfit: "1.0930",
    status: "active",
    postedAt: "2026-09-05 08:14 UTC",
    note: "Reaction off the daily demand zone, London session momentum confirmed.",
  },
  {
    id: "sig-002",
    market: "Forex",
    pair: "GBP/JPY",
    direction: "short",
    entry: "198.40",
    stopLoss: "199.10",
    takeProfit: "196.80",
    status: "active",
    postedAt: "2026-09-05 06:02 UTC",
    note: "Rejection at weekly resistance, RSI diverging on the 4H.",
  },
];

// Scrolling ticker strip on the homepage — cosmetic only, no real prices.
export const tickerPairs = [
  { pair: "EUR/USD", delta: "+0.42%" },
  { pair: "GBP/JPY", delta: "-0.18%" },
  { pair: "XAU/USD", delta: "+0.91%" },
  { pair: "US30", delta: "+0.27%" },
  { pair: "NVDA", delta: "+1.85%" },
  { pair: "USD/CHF", delta: "-0.11%" },
];
