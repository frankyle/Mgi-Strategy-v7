import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { getWatchlistPairs, addWatchlistPair, removeWatchlistPair } from "./pairWatchlist";

// Dropdown of pairs to pick from, instead of a free-text box. Also lets the
// user manage which pairs show up in that dropdown (add/remove), so it does
// double duty as the "pairs you're watching" list the old Strategy Tracker
// had — just folded into the one place that actually needs it.
export default function PairSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pairs, setPairs] = useState(getWatchlistPairs());
  const [newPair, setNewPair] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (pair) => {
    onChange(pair);
    setOpen(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newPair.trim()) return;
    const updated = addWatchlistPair(newPair);
    setPairs(updated);
    onChange(newPair.trim().toUpperCase());
    setNewPair("");
  };

  const handleRemove = (pair, e) => {
    e.stopPropagation();
    const updated = removeWatchlistPair(pair);
    setPairs(updated);
    if (value === pair && updated.length) onChange(updated[0]);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 border-b border-gray-200 hover:border-indigo-400 pb-0.5"
      >
        {value}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg p-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Select a pair
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pairs.map((p) => (
              <span
                key={p}
                onClick={() => handleSelect(p)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full cursor-pointer transition-colors ${
                  p === value
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {p}
                <button
                  type="button"
                  onClick={(e) => handleRemove(p, e)}
                  aria-label={`Remove ${p} from watchlist`}
                  className={p === value ? "text-indigo-100 hover:text-white" : "text-indigo-400 hover:text-indigo-700"}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAdd} className="flex gap-1.5">
            <input
              type="text"
              value={newPair}
              onChange={(e) => setNewPair(e.target.value)}
              placeholder="e.g. GBPJPY"
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0"
            >
              <Plus size={13} /> Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
