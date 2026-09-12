// FundedTradeStatistics.jsx
import React from "react";
// Import the stats calculation function
import { calculateTradeStatistics } from "./tradeStats"; // Assuming you saved the file as tradeStats.js

const StatCard = ({ title, value, colorClass = "bg-blue-100 text-blue-800" }) => (
  <div className={`p-4 rounded-xl shadow-lg ${colorClass} transition hover:shadow-xl`}>
    <p className="text-xs font-medium uppercase opacity-80">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

function FundedTradeStatistics({ trades }) {
  const stats = calculateTradeStatistics(trades);
  
  // Determine the color for Net Profit (Green for profit, Red for loss)
  const netProfitClass =
    stats.netProfitUSD > 0
      ? "bg-green-100 text-green-800"
      : stats.netProfitUSD < 0
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total Trades"
        value={stats.totalTrades}
        colorClass="bg-indigo-100 text-indigo-800"
      />
      <StatCard
        title="Net Profit (USD)"
        value={`$${stats.netProfitUSD}`}
        colorClass={netProfitClass}
      />
      <StatCard
        title="Win Rate"
        value={`${stats.winRate}%`}
        colorClass="bg-teal-100 text-teal-800"
      />
      <StatCard
        title="Total Gain (USD)"
        value={`$${stats.totalGainUSD}`}
        colorClass="bg-yellow-100 text-yellow-800"
      />
      <StatCard
        title="Total Buy Trades"
        value={stats.totalBuyTrades}
        colorClass="bg-green-100 text-green-800"
      />
      <StatCard
        title="Total Sell Trades"
        value={stats.totalSellTrades}
        colorClass="bg-red-100 text-red-800"
      />
    </div>
  );
}

export default FundedTradeStatistics;
