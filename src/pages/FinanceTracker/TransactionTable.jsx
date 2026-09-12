// TransactionTable.jsx
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteTransaction,
  updateTransaction,
  computePaidAmount,
  computeOutstandingAmount,
  PAYMENT_STATUSES,
  STATUS_LABELS,
  statusLabel,
} from "./financeService";

function fmt(n) {
  return "TZS " + Math.round(n || 0).toLocaleString();
}

const USAGE_STYLES = {
  Personal: "bg-indigo-100 text-indigo-700",
  Family: "bg-purple-100 text-purple-700",
};

const STATUS_STYLES = {
  Planned: "bg-gray-200 text-gray-600",
  "Half Paid": "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

function StatusButtons({ tx, onChange }) {
  const current = tx.paymentStatus || "Paid";
  const labels = STATUS_LABELS[tx.type] || {};

  const handleClick = async (status) => {
    if (status === current) return;
    const result = await updateTransaction(tx.id, { paymentStatus: status });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to update.");
      return;
    }
    toast.success(`Marked as ${labels[status] || status}.`);
    onChange && onChange();
  };

  return (
    <div className="flex gap-1 mt-1.5">
      {PAYMENT_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleClick(s)}
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border transition-colors ${
            current === s
              ? `${STATUS_STYLES[s]} border-transparent`
              : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
          }`}
        >
          {labels[s] || s}
        </button>
      ))}
    </div>
  );
}

function TransactionTable({ transactions, onChange }) {
  const [filter, setFilter] = useState("All"); // All | Income | Expense

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    const result = await deleteTransaction(id);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete.");
      return;
    }
    toast.success("Transaction deleted.");
    onChange && onChange();
  };

  const filtered =
    filter === "All" ? transactions : transactions.filter((t) => t.type === filter);

  const sorted = [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700">Transactions</h3>
        <div className="flex gap-1">
          {["All", "Income", "Expense"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          No transactions logged yet. Use the form to add your first one.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
          {sorted.map((t) => {
            const isExpense = t.type === "Expense";
            const status = t.paymentStatus || "Paid";
            const paid = computePaidAmount(t);
            const outstanding = computeOutstandingAmount(t);

            return (
              <div key={t.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-bold ${
                        t.type === "Income" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "Income" ? "+" : "-"}
                      {fmt(t.amount)}
                    </span>
                    <span className="text-xs text-gray-400">{t.date}</span>
                    {t.usage && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${USAGE_STYLES[t.usage]}`}
                      >
                        {t.usage}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
                    >
                      {statusLabel(t.type, status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{t.category}</span>
                    <span>{t.paymentMethod}</span>
                  </div>
                  {status !== "Paid" && (
                    <div className="mt-1 text-xs text-amber-600">
                      {isExpense
                        ? `Paid so far: ${fmt(paid)} · Still owed: ${fmt(outstanding)}`
                        : `Received so far: ${fmt(paid)} · Still expected: ${fmt(outstanding)}`}
                    </div>
                  )}
                  {t.notes && <p className="mt-1.5 text-sm text-gray-600">{t.notes}</p>}
                  <StatusButtons tx={t} onChange={onChange} />
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
