// FinanceOverview.jsx
import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  HandCoins,
  Rocket,
  ListTodo,
  Clock,
  Target,
} from "lucide-react";
import {
  computeTransactionStats,
  computeLoansOverview,
  computeInvestmentsOverview,
  computeInvestmentTotal,
  computeProjectedOverview,
} from "./financeService";

function fmt(n) {
  return "TZS " + Math.round(n || 0).toLocaleString();
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
        <Icon size={14} /> {label}
      </div>
      <div className="mt-2 text-xl sm:text-2xl font-extrabold">{value}</div>
      {sub && <div className="mt-0.5 text-xs opacity-70">{sub}</div>}
    </div>
  );
}

function FinanceOverview({ transactions, loans, investments, month }) {
  const txStats = computeTransactionStats(transactions, month);
  const loansOv = computeLoansOverview(loans);
  const invOv = computeInvestmentsOverview(investments);
  const projected = computeProjectedOverview(txStats, investments, loans);

  return (
    <div className="space-y-6">
      {/* Real cash right now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Income Received"
          value={fmt(txStats.totalIncomeReceived)}
          color="green"
          sub="Actual cash in so far"
        />
        <StatCard
          icon={TrendingDown}
          label="Expenses (Paid)"
          value={fmt(txStats.totalExpenses)}
          color="red"
          sub="Actual cash out so far"
        />
        <StatCard
          icon={Wallet}
          label="Net Balance"
          value={fmt(txStats.net)}
          color={txStats.net >= 0 ? "blue" : "red"}
          sub="Received minus paid, right now"
        />
      </div>

      {(txStats.totalIncomeExpected > 0 || projected.investmentsRemaining > 0 || projected.loansRemaining > 0) && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            <Target size={14} /> If Everything Settles
          </div>
          <p className="text-xs text-indigo-500 mt-1">
            What you'd be left with once all expected income arrives, every expense is paid,
            every investment target is fully funded, and every loan is paid off.
          </p>
          <div className="mt-2 text-3xl font-extrabold text-indigo-900">
            {fmt(projected.projectedFinalBalance)}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-indigo-700">
            <div>
              <div className="font-bold">{fmt(txStats.totalIncome)}</div>
              <div className="opacity-70">Income (all)</div>
            </div>
            <div>
              <div className="font-bold">− {fmt(txStats.totalExpensesFull)}</div>
              <div className="opacity-70">Expenses (all)</div>
            </div>
            <div>
              <div className="font-bold">− {fmt(projected.investmentsRemaining)}</div>
              <div className="opacity-70">Still to invest</div>
            </div>
            <div>
              <div className="font-bold">− {fmt(projected.loansRemaining)}</div>
              <div className="opacity-70">Still owed on loans</div>
            </div>
          </div>
        </div>
      )}

      {txStats.totalIncomeExpected > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={Clock}
            label="Income Expected"
            value={fmt(txStats.totalIncomeExpected)}
            color="amber"
            sub="Logged but not received yet"
          />
        </div>
      )}

      {(txStats.totalOutstanding > 0 || txStats.totalPlanned > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={ListTodo}
            label="Planned (Not Yet Sent)"
            value={fmt(txStats.totalPlanned)}
            color="amber"
            sub="Expenses marked Planned"
          />
          <StatCard
            icon={ListTodo}
            label="Still Owed on Expenses"
            value={fmt(txStats.totalOutstanding)}
            color="amber"
            sub="Planned + remaining half of Half Paid"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={Wallet}
          label="Personal Usage"
          value={fmt(txStats.personalExpenses)}
          color="indigo"
          sub="Spent on yourself"
        />
        <StatCard
          icon={Users}
          label="Family Usage"
          value={fmt(txStats.familyExpenses)}
          color="purple"
          sub="Spent on family — same account"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={HandCoins}
          label="Loans — You Still Owe"
          value={fmt(loansOv.totalOutstanding)}
          color="amber"
          sub={`${loansOv.activeCount} active · incl. ${fmt(loansOv.totalInterestAccrued)} interest accrued`}
        />
        <StatCard
          icon={Rocket}
          label="Total Invested"
          value={fmt(invOv.totalInvested)}
          color="blue"
          sub={`${invOv.count} investment${invOv.count === 1 ? "" : "s"} tracked`}
        />
      </div>

      {investments && investments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Investments — Contributed vs Target
          </h3>
          <div className="space-y-3">
            {investments.map((inv) => {
              const contributed = computeInvestmentTotal(inv);
              const target = inv.targetAmount || 0;
              const pct = target > 0 ? Math.min(100, (contributed / target) * 100) : 0;
              return (
                <div key={inv.id}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{inv.name}</span>
                    <span>
                      {fmt(contributed)}
                      {target > 0 ? ` / ${fmt(target)}` : " (no target set)"}
                    </span>
                  </div>
                  {target > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  )}
                  {contributed === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">
                      No contributions logged yet — add one from the Investments tab so it counts
                      toward your total.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {txStats.byCategory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Spending by Category
          </h3>
          <div className="space-y-2">
            {txStats.byCategory.map((c) => {
              const pct = txStats.totalExpenses > 0 ? (c.amount / txStats.totalExpenses) * 100 : 0;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{c.category}</span>
                    <span>{fmt(c.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceOverview;
