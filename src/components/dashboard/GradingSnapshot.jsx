import React, { useMemo } from "react";
import { motion } from "framer-motion";

const CHIPS = [
  { grade: "full", label: "Full Match", cls: "bg-long" },
  { grade: "partial", label: "Partial Match", cls: "bg-steel" },
  { grade: "none", label: "No Match", cls: "bg-short" },
];

export default function GradingSnapshot({ setups }) {
  const counts = useMemo(() => {
    const c = { full: 0, partial: 0, none: 0 };
    setups.forEach((s) => {
      if (c[s.grade] !== undefined) c[s.grade] += 1;
    });
    return c;
  }, [setups]);

  const total = setups.length;
  const fullRate = total ? Math.round((counts.full / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-panel border border-line"
    >
      <div className="p-5 sm:p-6 border-b border-line">
        <h2 className="font-display text-lg font-semibold text-ink">Grading Snapshot</h2>
        <p className="text-xs text-muted mt-0.5">All setups logged in Setup Match Grader</p>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl text-ink">{fullRate}%</span>
          <span className="text-sm text-muted">of logged setups were Full Match</span>
        </div>

        {CHIPS.map(({ grade, label, cls }, i) => {
          const pct = total ? Math.round((counts[grade] / total) * 100) : 0;
          return (
            <motion.div
              key={grade}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-ink flex items-center gap-1.5">
                  <span className={`w-2 h-2 ${cls}`} />
                  {label}
                </span>
                <span className="text-sm font-mono text-ink">
                  {counts[grade]} · {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-panel2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                  className={`h-full ${cls}`}
                />
              </div>
            </motion.div>
          );
        })}

        {total < 30 && (
          <p className="text-xs text-muted pt-1">
            {30 - total} more logged setup{30 - total === 1 ? "" : "s"} to a reliable read.
          </p>
        )}
      </div>
    </motion.div>
  );
}
