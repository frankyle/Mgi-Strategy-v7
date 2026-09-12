// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { DollarSign, Target, CheckCircle2, Percent } from "lucide-react";
import { supabase } from "../supabaseClient";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { MetricCard } from "../components/dashboard/MetricCard";
import WatchlistPanel from "../components/dashboard/WatchlistPanel";
import GradingSnapshot from "../components/dashboard/GradingSnapshot";
import RecentTradeIdeas from "../components/dashboard/RecentTradeIdeas";
import { getSetups } from "./SetupMatchGrader/SetupMatchGraderService";
import { getTrades as getPersonalTrades } from "./PersonalAccount/PersonalAccountService";
import { getTrades as getFundedTrades } from "./FundedAccount/FundedTradeService";
import { getWatchlistPairs } from "./SetupMatchGrader/pairWatchlist";
import {
  combineTrades,
  calcNetProfit,
  calcWinRate,
  tradesForMonth,
  setupsInLastDays,
  percentChange,
} from "../utils/dashboardStats";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [setups, setSetups] = useState([]);
  const [trades, setTrades] = useState([]);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name || user?.email || "";
      setFirstName(name.split(" ")[0].split("@")[0]);

      const [setupsRes, personalRes, fundedRes] = await Promise.all([
        getSetups(),
        getPersonalTrades(),
        getFundedTrades(),
      ]);

      setSetups(setupsRes.success ? setupsRes.data : []);
      setTrades(
        combineTrades(
          personalRes.success ? personalRes.data : [],
          fundedRes.success ? fundedRes.data : []
        )
      );
      setLoading(false);
    };
    load();
  }, []);

  const pairs = getWatchlistPairs();
  const publishedIdeas = setups.filter((s) => s.is_published);

  // ---- Metric 1: Net P&L this month ----
  const thisMonthTrades = tradesForMonth(trades, 0);
  const lastMonthTrades = tradesForMonth(trades, -1);
  const netProfit = calcNetProfit(thisMonthTrades);
  const lastNetProfit = calcNetProfit(lastMonthTrades);
  const netProfitTrend = percentChange(netProfit, lastNetProfit);

  // ---- Metric 2: Win rate, all-time ----
  const winRate = calcWinRate(trades);

  // ---- Metric 3: Setups logged this week vs the week before ----
  const thisWeekSetups = setupsInLastDays(setups, 7);
  const lastWeekSetups = setupsInLastDays(setups, 14).filter(
    (s) => !thisWeekSetups.some((t) => t.id === s.id)
  );
  const setupsTrend = percentChange(thisWeekSetups.length, lastWeekSetups.length);

  // ---- Metric 4: Full match rate, all-time ----
  const fullMatchCount = setups.filter((s) => s.grade === "full").length;
  const fullMatchRate = setups.length ? Math.round((fullMatchCount / setups.length) * 100) : 0;

  return (
    <div className="-m-4 sm:-m-6 bg-base min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
      <DashboardHeader name={firstName} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Net P&L (This Month)"
          value={loading ? "…" : `$${netProfit.toFixed(2)}`}
          icon={DollarSign}
          trend={netProfitTrend !== null ? { value: netProfitTrend, isPositive: netProfitTrend >= 0 } : null}
          trendLabel="vs last month"
          delay={0.1}
          color={netProfit >= 0 ? "green" : "red"}
        />

        <MetricCard
          title="Win Rate (All-Time)"
          value={loading ? "…" : `${winRate}%`}
          icon={Percent}
          trendLabel={`${trades.length} trade${trades.length === 1 ? "" : "s"} logged`}
          delay={0.2}
          color="blue"
        />

        <MetricCard
          title="Setups Logged This Week"
          value={loading ? "…" : thisWeekSetups.length}
          icon={Target}
          trend={setupsTrend !== null ? { value: setupsTrend, isPositive: setupsTrend >= 0 } : null}
          trendLabel="vs last week"
          delay={0.3}
          color="indigo"
        />

        <MetricCard
          title="Full Match Rate"
          value={loading ? "…" : `${fullMatchRate}%`}
          icon={CheckCircle2}
          trendLabel={`${fullMatchCount} of ${setups.length} setups`}
          delay={0.4}
          color="purple"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WatchlistPanel pairs={pairs} setups={setups} />
        </div>
        <div className="space-y-6">
          <GradingSnapshot setups={setups} />
        </div>
      </div>

      <RecentTradeIdeas ideas={publishedIdeas} />
    </div>
  );
};

export default Dashboard;
