import { motion } from "framer-motion";

// Semantic, not decorative: green/red track whether the number is actually
// good or bad news (P&L sign), steel/muted are neutral counts.
const COLOR_MAP = {
  green: "text-long border-long/40",
  red: "text-short border-short/40",
  blue: "text-steel border-steel/50",
  purple: "text-ink border-line",
  orange: "text-long border-long/40",
  indigo: "text-ink border-line",
};

export function MetricCard({ title, value, icon: Icon, trend, trendLabel, delay = 0, color = "blue" }) {
  const accent = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="border border-line bg-panel p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-muted">{title}</h3>
        <div className={`h-8 w-8 border flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="font-mono text-2xl text-ink">{value}</div>

      {(trend || trendLabel) && (
        <p
          className={`text-xs mt-1.5 font-mono ${
            trend ? (trend.isPositive ? "text-long" : "text-short") : "text-muted"
          }`}
        >
          {trend ? (
            <>
              {trend.isPositive ? "↑ " : "↓ "}
              {Math.abs(trend.value)}% {trendLabel || "vs last period"}
            </>
          ) : (
            trendLabel
          )}
        </p>
      )}
    </motion.div>
  );
}
