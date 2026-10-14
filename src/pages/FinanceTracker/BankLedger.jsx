// BankLedger.jsx
// One bank account, everything that moved through it, with a running balance.
// Built from income, expenses, loans received, loan payments and investment
// contributions — nothing is typed in twice.
import React, { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { computeAccountSummary } from "./financeService";

function fmt(n) {
  return "TZS " + Math.round(n || 0).toLocaleString();
}

const KIND_STYLES = {
  opening: { label: "Opening", cls: "bg-blue-100 text-blue-700" },
  income: { label: "Income", cls: "bg-emerald-100 text-emerald-700" },
  loan_in: { label: "Loan in", cls: "bg-amber-100 text-amber-700" },
  expense: { label: "Expense", cls: "bg-red-100 text-red-700" },
  investment: { label: "Invested", cls: "bg-indigo-100 text-indigo-700" },
  loan_out: { label: "Loan paid", cls: "bg-orange-100 text-orange-700" },
};

function BankLedger({ ledger, month }) {
  const [bankBalance, setBankBalance] = useState("");

  const summary = computeAccountSummary(ledger, month);
  const current = computeAccountSummary(ledger, "All").balanceEnd;

  const rows = useMemo(() => {
    const list =
      month === "All"
        ? ledger.entries
        : ledger.entries.filter((e) => (e.date || "").slice(0, 7) === month);
    return [...list].reverse(); // newest first
  }, [ledger, month]);

  const typed = bankBalance === "" ? null : Number(bankBalance);
  const difference = typed === null || Number.isNaN(typed) ? null : typed - current;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
          <Landmark size={14} />
          {month === "All" ? "Bank balance now" : `Bank balance at end of ${month}`}
        </div>
        <div
          className={`mt-2 text-3xl font-extrabold ${
            summary.balanceEnd >= 0 ? "text-blue-900" : "text-red-700"
          }`}
        >
          {fmt(summary.balanceEnd)}
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Money in {fmt(summary.moneyIn)} · Money out {fmt(summary.moneyOut)}
        </p>
      </div>

      {/* Check against the real bank app */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-gray-700">Check against your bank app</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Type the balance your bank shows right now. The difference is money that hasn't been
          logged yet (or something logged twice).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min="0"
            placeholder="Balance in bank app (TZS)"
            value={bankBalance}
            onChange={(e) => setBankBalance(e.target.value)}
            className="flex-1 min-w-[180px] border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {difference !== null && (
            <span
              className={`text-sm font-bold ${
                Math.round(difference) === 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {Math.round(difference) === 0
                ? "Matches ✓"
                : `${difference > 0 ? "Bank has" : "Tracker has"} ${fmt(Math.abs(difference))} more`}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700">Every movement, newest first</h3>
          {ledger.hasOpening && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              Anything dated before your opening balance ({ledger.startDate}) is already inside
              it, so it's greyed out and not counted again.
            </p>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nothing has moved through the account yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
            {rows.map((e) => {
              const k = KIND_STYLES[e.kind];
              return (
                <div
                  key={e.id}
                  className={`px-4 py-3 flex items-center gap-3 ${e.counted ? "" : "opacity-40"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${k.cls}`}
                      >
                        {k.label}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">{e.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {e.date}
                      {e.detail ? ` · ${e.detail}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold ${
                        e.credit > 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {e.credit > 0 ? "+" : "−"}
                      {fmt(e.credit > 0 ? e.credit : e.debit)}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {e.balance === null ? "not counted" : `Bal ${fmt(e.balance)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BankLedger;
