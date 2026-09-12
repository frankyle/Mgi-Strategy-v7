import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight, Star } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "full", label: "Full Match" },
  { key: "partial", label: "Partial" },
  { key: "none", label: "No Match" },
];

const GRADE_CLS = {
  full: "text-long border-long/40 bg-long/10",
  partial: "text-steel border-steel/50 bg-steel/10",
  none: "text-short border-short/40 bg-short/10",
};

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function WatchlistPanel({ pairs, setups }) {
  const [filter, setFilter] = useState("all");

  // Latest setup per pair — setups already come sorted newest-first.
  const latestByPair = useMemo(() => {
    const map = {};
    setups.forEach((s) => {
      if (!map[s.pair]) map[s.pair] = s;
    });
    return map;
  }, [setups]);

  const rows = pairs.map((pair) => ({ pair, setup: latestByPair[pair] || null }));

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.setup && r.setup.grade === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-panel border border-line"
    >
      <div className="p-5 sm:p-6 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-long" />
          <h2 className="font-display text-lg font-semibold text-ink">Your Pairs</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 border transition-colors ${
                filter === f.key
                  ? "bg-long border-long text-base"
                  : "border-line text-muted hover:border-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-line">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No pairs match this filter yet.
          </div>
        ) : (
          filtered.map(({ pair, setup }) => {
            const gradeCls = setup ? GRADE_CLS[setup.grade] : null;
            const isLong = setup?.ltf_direction === "long";
            return (
              <div key={pair} className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 border border-line text-ink font-mono text-xs flex items-center justify-center">
                    {pair.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{pair}</p>
                    {setup ? (
                      <p className="text-xs text-muted flex items-center gap-1">
                        {isLong ? (
                          <TrendingUp size={12} className="text-long" />
                        ) : (
                          <TrendingDown size={12} className="text-short" />
                        )}
                        {setup.htf_timeframe} · {timeAgo(setup.created_at)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">No setup logged yet</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {gradeCls && (
                    <span className={`hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 border ${gradeCls}`}>
                      {setup.grade === "full" ? "Full Match" : setup.grade === "partial" ? "Partial" : "No Match"}
                    </span>
                  )}
                  <Link
                    to="/dashboard/setup-match-grader"
                    className="h-8 w-8 flex items-center justify-center text-muted hover:text-long hover:bg-panel2 transition-colors"
                    title="Open Setup Match Grader"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
