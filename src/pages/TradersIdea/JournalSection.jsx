// JournalSection.jsx
// Psychology reminders, top-down Fibonacci (Monthly > Weekly > Daily), A-setup
// checklist and review fields. Rendered inside TradersIdeaForm; the data is
// saved in the `journal` jsonb column of trader_ideas.
import React from "react";

export const A_CHECKS = [
  "Monthly, weekly and daily fibs agree on direction",
  "Entry zone sits on a fib level on at least two timeframes",
  "Stop is beyond the swing, not inside the noise",
  "Target gives at least 1:3",
  "Risk is my normal size, not bigger",
];

const FIB_LEVELS = ["0.382", "0.5", "0.618", "0.786", "Other"];
const MOODS = ["Calm", "Confident", "Impatient", "Anxious", "Revenge", "FOMO", "Bored"];

const TIMEFRAMES = [
  { key: "monthly", label: "Monthly", job: "Find the big swing. Draw the fib from the last major high to low." },
  { key: "weekly", label: "Weekly", job: "Is price reacting at a monthly level? Redraw on the current weekly leg." },
  { key: "daily", label: "Daily", job: "Does the entry zone sit on a weekly level? This is where you pull the trigger." },
];

const MIND_NOTES = [
  "A setups only. If it is not an A, it is not a trade.",
  "A swing trade needs room. Do not manage a weekly idea off a small candle.",
  "Waiting is a position. I do not have to be in the market.",
  "Before I move a stop, ask: did the plan change, or did I?",
  "A loss that followed the plan is a good trade. Log it the same way.",
  "Same size, same rules, every time.",
];

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
  const setFib = (tf, k, v) =>
    onChange({ ...j, fib: { ...j.fib, [tf]: { ...j.fib[tf], [k]: v } } });
  const toggleCheck = (i) =>
    onChange({ ...j, checks: j.checks.map((c, idx) => (idx === i ? !c : c)) });

  const passed = j.checks.filter(Boolean).length;

  return (
    <div className="space-y-6 pt-4 border-t">
      <p className="text-lg font-bold text-gray-800">📓 Trade Journal</p>

      {/* Psychology */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <h3 className="text-sm font-bold text-green-800 mb-2">Read this before you journal</h3>
        <ul className="space-y-1 text-sm text-green-900 list-disc pl-5">
          {MIND_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <label className="block text-xs font-semibold text-gray-600 sm:max-w-xs">
        Journal entry
        <select className={field} value={j.entry_type} onChange={(e) => set("entry_type", e.target.value)}>
          <option value="daily">End of day</option>
          <option value="weekly">End of week</option>
        </select>
      </label>

      {/* Fibonacci */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Fibonacci, top down</h3>
        {TIMEFRAMES.map((tf) => (
          <div key={tf.key} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">{tf.label}</span>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={j.fib[tf.key].aligned}
                  onChange={(e) => setFib(tf.key, "aligned", e.target.checked)}
                />
                Aligned with trade
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-2">{tf.job}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={field} placeholder="Swing high" value={j.fib[tf.key].high} onChange={(e) => setFib(tf.key, "high", e.target.value)} />
              <input className={field} placeholder="Swing low" value={j.fib[tf.key].low} onChange={(e) => setFib(tf.key, "low", e.target.value)} />
              <select className={field} value={j.fib[tf.key].level} onChange={(e) => setFib(tf.key, "level", e.target.value)}>
                {FIB_LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* A setup check */}
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-800">Is it really an A setup?</h3>
          <span className={`text-sm font-semibold ${passed === A_CHECKS.length ? "text-green-600" : "text-amber-600"}`}>
            {passed}/{A_CHECKS.length}
          </span>
        </div>
        <div className="space-y-2">
          {A_CHECKS.map((c, i) => (
            <label key={c} className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" className="mt-1" checked={j.checks[i]} onChange={() => toggleCheck(i)} />
              {c}
            </label>
          ))}
        </div>
        {passed < A_CHECKS.length && (
          <p className="mt-3 text-xs text-amber-600">Not every box is ticked. Be honest about whether this was an A.</p>
        )}
      </div>

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
