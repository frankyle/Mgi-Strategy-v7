// PersonalTradeStatistics.jsx (Optimized for Mobile Grid)
import React from "react";
// Assuming you reuse the generic calculation function
import { calculateTradeStatistics } from "./tradeStats"; 
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap } from 'lucide-react';

const StatCard = ({ title, value, colorClass = "bg-blue-100 text-blue-800", Icon }) => (
  // REVISION: Added flex-row and spacing for better alignment, smaller padding on mobile
  <div className={`p-3 sm:p-4 rounded-xl shadow-lg ${colorClass} transition hover:shadow-xl flex items-center gap-3`}>
    <div className="p-2 rounded-full bg-white/50">
      <Icon size={20} className="opacity-80"/>
    </div>
    <div>
      <p className="text-xs font-medium uppercase opacity-80 leading-tight">{title}</p>
      <p className="text-xl sm:text-2xl font-bold mt-1 leading-none">{value}</p>
    </div>
  </div>
);

function PersonalTradeStatistics({ trades }) {
  const stats = calculateTradeStatistics(trades);
  
  // Determine the color for Net Profit (Green for profit, Red for loss)
  const netProfitClass =
    stats.netProfitUSD > 0
      ? "bg-green-100 text-green-800"
      : stats.netProfitUSD < 0
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  // Determine the color for Win Rate
  const winRateClass = stats.winRate >= 50 ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800";

  return (
    // REVISION: Grid changed to 2 columns on mobile, 3 on md, and 6 on lg
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      <StatCard
        title="Total Trades"
        value={stats.totalTrades}
        colorClass="bg-indigo-100 text-indigo-800"
        Icon={Activity}
      />
      <StatCard
        title="Net Profit (USD)"
        value={`$${stats.netProfitUSD}`}
        colorClass={netProfitClass}
        Icon={DollarSign}
      />
      <StatCard
        title="Win Rate"
        value={`${stats.winRate}%`}
        colorClass={winRateClass}
        Icon={Zap}
      />
      {/* Hidden on smallest screen to keep main stats prominent */}
      <div className="hidden sm:block"> 
        <StatCard
          title="Total Gain (USD)"
          value={`$${stats.totalGainUSD}`}
          colorClass="bg-yellow-100 text-yellow-800"
          Icon={TrendingUp}
        />
      </div>
      <div className="hidden sm:block">
        <StatCard
          title="Total Buy Trades"
          value={stats.totalBuyTrades}
          colorClass="bg-green-100 text-green-800"
          Icon={TrendingUp}
        />
      </div>
      <div className="hidden sm:block">
        <StatCard
          title="Total Sell Trades"
          value={stats.totalSellTrades}
          colorClass="bg-red-100 text-red-800"
          Icon={TrendingDown}
        />
      </div>
    </div>
  );
}

export default PersonalTradeStatistics;