import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Newspaper, TrendingUp, TrendingDown } from "lucide-react";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentTradeIdeas({ ideas }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-panel border border-line"
    >
      <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-long" />
          Recently Published
        </h2>
        <Link to="/dashboard/signals" className="text-xs font-medium text-long hover:underline">
          View signals
        </Link>
      </div>

      <div className="p-5 sm:p-6">
        {ideas.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted">
              Nothing published yet — publish a graded setup to share it with members.
            </p>
            <Link
              to="/dashboard/setup-match-grader"
              className="inline-block mt-3 text-xs font-medium text-long hover:underline"
            >
              Go to Setup Match Grader
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {ideas.slice(0, 4).map((idea) => {
              const isLong = idea.ltf_direction === "long";
              return (
                <div key={idea.id} className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 shrink-0 ${isLong ? "bg-long" : "bg-short"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                      {idea.pair}
                      {isLong ? (
                        <TrendingUp size={13} className="text-long" />
                      ) : (
                        <TrendingDown size={13} className="text-short" />
                      )}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {idea.caption || `${idea.htf_timeframe} setup published to Trade Blog`}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted shrink-0">
                    {timeAgo(idea.published_at || idea.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
