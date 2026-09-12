// dashboardStats.js
// Small, defensive helpers for the dashboard's top metric cards. Kept
// separate from PersonalAccount/FundedAccount's own tradeStats files since
// those assume every trade has a signal set — here we combine both books
// and can't guarantee that.

function monthKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function isWithinLastDays(dateStr, days) {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export function combineTrades(personalTrades = [], fundedTrades = []) {
  return [...personalTrades, ...fundedTrades];
}

export function calcNetProfit(trades) {
  return trades.reduce((sum, t) => sum + ((+t.gain_usd || 0) - (+t.risk_usd || 0)), 0);
}

export function calcWinRate(trades) {
  if (!trades.length) return 0;
  const wins = trades.filter((t) => (+t.gain_usd || 0) > (+t.risk_usd || 0)).length;
  return Math.round((wins / trades.length) * 100);
}

export function tradesForMonth(trades, offsetMonths = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return trades.filter((t) => monthKey(t.date) === key);
}

export function setupsInLastDays(setups, days) {
  return setups.filter((s) => isWithinLastDays(s.created_at, days));
}

// percentage change from `previous` to `current`, null when there's nothing to compare against
export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}
