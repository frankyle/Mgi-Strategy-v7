import React, { useMemo } from "react";
import { GRADE_STYLES } from "./grading";

const CHIPS = [
  { grade: "full", label: "Full Match" },
  { grade: "partial", label: "Partial" },
  { grade: "none", label: "No Match" },
];

export default function SetupMatchGraderStats({ setups, filter, onFilterChange }) {
  const counts = useMemo(() => {
    const c = { full: 0, partial: 0, none: 0 };
    setups.forEach((s) => {
      if (c[s.grade] !== undefined) c[s.grade] += 1;
    });
    return c;
  }, [setups]);

  const fullRate = setups.length
    ? Math.round((counts.full / setups.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
        Alignment Stats
      </h3>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-bold text-gray-900">{fullRate}%</span>
        <span className="text-sm text-gray-500">of logged setups were Full Match</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map(({ grade, label }) => {
          const styles = GRADE_STYLES[grade];
          const active = filter === grade;
          return (
            <button
              key={grade}
              onClick={() => onFilterChange(active ? "all" : grade)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                active ? `${styles.border} ${styles.bg} ${styles.text}` : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
              {label}
              <span className="font-bold">{counts[grade]}</span>
            </button>
          );
        })}
        {setups.length < 30 && (
          <span className="text-xs text-gray-400 self-center ml-1">
            {30 - setups.length} more to a reliable read
          </span>
        )}
      </div>
    </div>
  );
}
