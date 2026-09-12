// FinanceTracker.jsx
import React, { useEffect, useState, useCallback } from "react";
import { LayoutGrid, ListChecks, HandCoins, Rocket, Loader2, AlertTriangle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { getTransactions, getLoans, getInvestments, getAvailableMonths } from "./financeService";
import FinanceOverview from "./FinanceOverview";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";
import LoansTab from "./LoansTab";
import InvestmentsTab from "./InvestmentsTab";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "transactions", label: "Income & Expenses", icon: ListChecks },
  { key: "loans", label: "Loans", icon: HandCoins },
  { key: "investments", label: "Investments", icon: Rocket },
];

function FinanceTracker() {
  const [tab, setTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [month, setMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    const [txRes, loanRes, invRes] = await Promise.all([
      getTransactions(),
      getLoans(),
      getInvestments(),
    ]);

    const failed = [txRes, loanRes, invRes].find((r) => !r.success);
    if (failed) {
      setError(failed.error?.message || "Failed to load your finance data.");
      setLoading(false);
      return;
    }

    setTransactions(txRes.data);
    setLoans(loanRes.data);
    setInvestments(invRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const months = getAvailableMonths(transactions);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-[300px] text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading your finance data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Couldn't load your finance data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">💵 Finance Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track income, day-to-day expenses (personal & family, same account), loans you've
          borrowed with interest, and your investments — like the dehydration machine build and
          the prop firm account. Synced to your account via Supabase.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}

        {tab === "overview" && months.length > 0 && (
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="ml-auto border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Time</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === "overview" && (
        <FinanceOverview
          transactions={transactions}
          loans={loans}
          investments={investments}
          month={month}
        />
      )}

      {tab === "transactions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <TransactionForm onSaved={refresh} />
          <TransactionTable transactions={transactions} onChange={refresh} />
        </div>
      )}

      {tab === "loans" && <LoansTab loans={loans} onChange={refresh} />}

      {tab === "investments" && <InvestmentsTab investments={investments} onChange={refresh} />}
    </div>
  );
}

export default FinanceTracker;
