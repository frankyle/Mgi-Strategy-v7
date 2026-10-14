// JournalSection.jsx
// Trading rules (London / New York + 4H/2H FVG/IFVG retest) and review fields.
// Rendered inside TradersIdeaForm; the data is saved in the `journal` jsonb
// column of trader_ideas.
import React from "react";

export const A_CHECKS = [
  "Monthly, weekly and daily fibs agree on direction",
  "Entry zone sits on a fib level on at least two timeframes",
  "Stop is beyond the swing, not inside the noise",
  "Target gives at least 1:3",
  "Risk is my normal size, not bigger",
];

export const MOODS = ["Calm", "Confident", "Impatient", "Anxious", "Revenge", "FOMO", "Bored"];

export const emptyJournal = () => ({
  entry_type: "daily",
  fib: {
    monthly: { high: "", low: "", level: "0.618", aligned: false },
    weekly: { high: "", low: "", level: "0.618", aligned: false },
    daily: { high: "", low: "", level: "0.618", aligned: false },
  },
  checks: A_CHECKS.map(() => false),
  mood: "Calm",
  followed_plan: true,
  result_r: "",
  notes: "",
});

// Merge saved data over the defaults so older rows (journal = null) still open.
export const normalizeJournal = (j) => {
  const base = emptyJournal();
  if (!j) return base;
  return {
    ...base,
    ...j,
    fib: {
      monthly: { ...base.fib.monthly, ...(j.fib?.monthly || {}) },
      weekly: { ...base.fib.weekly, ...(j.fib?.weekly || {}) },
      daily: { ...base.fib.daily, ...(j.fib?.daily || {}) },
    },
    checks: A_CHECKS.map((_, i) => Boolean(j.checks?.[i])),
  };
};

const field =
  "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

function JournalSection({ value, onChange }) {
  const j = value;
  const set = (k, v) => onChange({ ...j, [k]: v });

  return (
    <div className="space-y-6 pt-4 border-t">
      <p className="text-lg font-bold text-gray-800">📓 Trade Journal</p>

      {/* Trading rules */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <h3 className="text-sm font-bold text-green-800 mb-2">My trading rules</h3>
        <ul className="space-y-1 text-sm text-green-900 list-disc pl-5">
          <li>I only trade during the LONDON session or the NEW YORK session.</li>
          <li>
            I wait for a higher timeframe 4H or 2H FVG / IFVG to be retested, and then we move in
            the opposite direction from the retest.
          </li>
            <li>My Entry is in 1H where i wait for newly formed FVG IFVG</li>
          <li>Also there should be CHoCH or BoS created</li>
        </ul>
      </div>

      <label className="block text-xs font-semibold text-gray-600 sm:max-w-xs">
        Journal entry
        <select className={field} value={j.entry_type} onChange={(e) => set("entry_type", e.target.value)}>
          <option value="daily">End of day</option>
          <option value="weekly">End of week</option>
        </select>
      </label>

      {/* Review */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-xs font-semibold text-gray-600">
          How I felt taking it
          <select className={field} value={j.mood} onChange={(e) => set("mood", e.target.value)}>
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Followed my plan?
          <select className={field} value={String(j.followed_plan)} onChange={(e) => set("followed_plan", e.target.value === "true")}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Result (R)
          <input type="number" step="0.1" className={field} placeholder="e.g. 3 or -1" value={j.result_r} onChange={(e) => set("result_r", e.target.value)} />
        </label>
      </div>

      <label className="block text-xs font-semibold text-gray-600">
        What I learned, and what I will do differently
        <textarea rows={4} className={field} value={j.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
    </div>
  );
}

export default JournalSection;
