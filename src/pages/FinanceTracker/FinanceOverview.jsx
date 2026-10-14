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
  Landmark,
  AlertTriangle,
} from "lucide-react";
import {
  computeTransactionStats,
  computeLoansOverview,
  computeInvestmentsOverview,
  computeInvestmentTotal,
  computeProjectedOverview,
  computeAccountSummary,
  LEGACY_INVESTMENT_CATEGORY,
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

// A total with the lines that make it up.
function FlowCard({ icon: Icon, label, total, color, lines }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
        <Icon size={14} /> {label}
      </div>
      <div className="mt-2 text-xl sm:text-2xl font-extrabold">{fmt(total)}</div>
      <div className="mt-2 space-y-0.5 text-xs">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3 opacity-80">
            <span>{l.label}</span>
            <span className="font-semibold">{fmt(l.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceOverview({ transactions, loans, investments, ledger, month }) {
  // Period figures (follow the month filter)
  const account = computeAccountSummary(ledger, month);
  const txStatsMonth = computeTransactionStats(transactions, month);

  // "Right now" figures (never filtered by month — they are today's position)
  const accountNow = computeAccountSummary(ledger, "All");
  const txStatsAll = computeTransactionStats(transactions, "All");
  const loansOv = computeLoansOverview(loans);
  const invOv = computeInvestmentsOverview(investments);
  const projected = computeProjectedOverview(
    txStatsAll,
    investments,
    loans,
    accountNow.balanceEnd
  );

  const legacyInvestmentExpenses = transactions.filter(
    (t) => t.type === "Expense" && t.category === LEGACY_INVESTMENT_CATEGORY
  );
  const legacyInvestmentTotal = legacyInvestmentExpenses.reduce((s, t) => s + (t.amount || 0), 0);

  const hasMovements = ledger.entries.length > 0;
  const showProjection =
    projected.incomeExpected > 0 ||
    projected.expensesOwed > 0 ||
    projected.investmentsRemaining > 0 ||
    projected.loansRemaining > 0;

  return (
    <div className="space-y-6">
      {hasMovements && !ledger.hasOpening && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 flex gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Set your starting bank balance</p>
            <p className="mt-0.5 text-xs">
              Go to Income &amp; Expenses, choose <span className="font-semibold">Income</span> and
              the category <span className="font-semibold">Opening Balance</span>, and enter what
              was in the bank when you started tracking. Until then the balance below only
              counts what you have logged.
            </p>
          </div>
        </div>
      )}

      {legacyInvestmentExpenses.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 flex gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {fmt(legacyInvestmentTotal)} is logged as an "Investment" expense
            </p>
            <p className="mt-0.5 text-xs">
              Investments now come off your bank balance automatically from the Investments tab.
              If you also logged these as contributions there, delete the old expense so the
              money isn't counted twice. If not, log them as contributions and then delete the
              expense.
            </p>
          </div>
        </div>
      )}

      {/* Bank balance */}
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
          <Landmark size={14} />
          {month === "All" ? "Bank balance now" : `Bank balance at end of ${month}`}
        </div>
        <div
          className={`mt-2 text-3xl font-extrabold ${
            account.balanceEnd >= 0 ? "text-blue-900" : "text-red-700"
          }`}
        >
          {fmt(account.balanceEnd)}
        </div>
        <p className="text-xs text-blue-600 mt-1">
          {month === "All" ? "Opening" : "Start of month"} {fmt(account.balanceStart)} + money in{" "}
          {fmt(account.moneyIn)} − money out {fmt(account.moneyOut)}
        </p>
      </div>

      {/* Money in / out for the period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FlowCard
          icon={TrendingUp}
          label={month === "All" ? "Money In" : `Money In — ${month}`}
          total={account.moneyIn}
          color="green"
          lines={[
            { label: "Income received", value: account.income },
            { label: "Loans received", value: account.loansReceived },
          ]}
        />
        <FlowCard
          icon={TrendingDown}
          label={month === "All" ? "Money Out" : `Money Out — ${month}`}
          total={account.moneyOut}
          color="red"
          lines={[
            { label: "Expenses paid", value: account.expenses },
            { label: "Invested", value: account.invested },
            { label: "Loan payments", value: account.loanPayments },
          ]}
        />
      </div>

      {showProjection && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            <Target size={14} /> If Everything Settles
          </div>
          <p className="text-xs text-indigo-500 mt-1">
            Your bank balance now, plus income still to arrive, minus expenses still unpaid,
            investment targets still to fund and loans still owed. Money already invested or
            already paid on loans has left the bank, so it isn't taken off twice.
          </p>
          <div className="mt-2 text-3xl font-extrabold text-indigo-900">
            {fmt(projected.projectedFinalBalance)}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-indigo-700">
            <div>
              <div className="font-bold">{fmt(projected.bankBalance)}</div>
              <div className="opacity-70">Bank balance now</div>
            </div>
            <div>
              <div className="font-bold">+ {fmt(projected.incomeExpected)}</div>
              <div className="opacity-70">Income expected</div>
            </div>
            <div>
              <div className="font-bold">− {fmt(projected.expensesOwed)}</div>
              <div className="opacity-70">Expenses still owed</div>
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

      {txStatsAll.totalIncomeExpected > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={Clock}
            label="Income Expected"
            value={fmt(txStatsAll.totalIncomeExpected)}
            color="amber"
            sub="Logged but not received yet"
          />
        </div>
      )}

      {(txStatsAll.totalOutstanding > 0 || txStatsAll.totalPlanned > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={ListTodo}
            label="Planned (Not Yet Sent)"
            value={fmt(txStatsAll.totalPlanned)}
            color="amber"
            sub="Expenses marked Planned"
          />
          <StatCard
            icon={ListTodo}
            label="Still Owed on Expenses"
            value={fmt(txStatsAll.totalOutstanding)}
            color="amber"
            sub="Planned + remaining half of Half Paid"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={Wallet}
          label="Personal Usage"
          value={fmt(txStatsMonth.personalExpenses)}
          color="indigo"
          sub="Spent on yourself"
        />
        <StatCard
          icon={Users}
          label="Family Usage"
          value={fmt(txStatsMonth.familyExpenses)}
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
          sub={`${invOv.count} investment${invOv.count === 1 ? "" : "s"} tracked · all time`}
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
                      toward your total and comes off your bank balance.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {txStatsMonth.byCategory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Spending by Category
          </h3>
          <div className="space-y-2">
            {txStatsMonth.byCategory.map((c) => {
              const pct =
                txStatsMonth.totalExpenses > 0 ? (c.amount / txStatsMonth.totalExpenses) * 100 : 0;
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
