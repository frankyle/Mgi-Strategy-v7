// src/components/dashboard/DashboardHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const DashboardHeader = ({ name }) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
          {getGreeting()}{name ? `, ${name}` : ""}
        </h1>
        <p className="text-muted text-sm mt-1">{today} · Here's how your trading week looks</p>
      </div>

      <Link
        to="/dashboard/setup-match-grader"
        className="inline-flex items-center justify-center gap-2 bg-long text-base text-sm font-medium px-4 py-2.5 hover:bg-long/90 transition-colors shrink-0"
      >
        <Plus size={16} /> Grade a Setup
      </Link>
    </motion.div>
  );
};

export default DashboardHeader;
