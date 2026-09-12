// pairWatchlist.js
// Local list of pairs the user picks from instead of typing one in by hand.
// Kept as plain localStorage (same key the old Strategy Tracker watchlist
// used) so anyone who already had pairs saved keeps them automatically.

const PAIRS_KEY = "mgi_strategy_tracker_pairs";

const DEFAULT_PAIRS = ["XAUUSD", "BTCUSD", "EURUSD", "GBPUSD", "USDJPY", "US30", "NAS100"];

export function getWatchlistPairs() {
  try {
    const raw = localStorage.getItem(PAIRS_KEY);
    if (!raw) {
      localStorage.setItem(PAIRS_KEY, JSON.stringify(DEFAULT_PAIRS));
      return [...DEFAULT_PAIRS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_PAIRS];
  } catch {
    return [...DEFAULT_PAIRS];
  }
}

export function addWatchlistPair(pair) {
  const clean = (pair || "").trim().toUpperCase();
  if (!clean) return getWatchlistPairs();
  const pairs = getWatchlistPairs();
  if (!pairs.includes(clean)) {
    pairs.push(clean);
    localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
  }
  return pairs;
}

export function removeWatchlistPair(pair) {
  const pairs = getWatchlistPairs().filter((p) => p !== pair);
  localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
  return pairs;
}
