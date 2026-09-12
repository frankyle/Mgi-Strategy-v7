// LoansTab.jsx
// Tracks money YOU borrow — from people, banks, or loan companies: who/what
// you borrowed from, the principal, the interest you're being charged,
// payments you make toward it, and the running balance you still owe
// (principal + accrued interest - paid so far).
import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, HandCoins } from "lucide-react";
import toast from "react-hot-toast";
import {
  addLoan,
  deleteLoan,
  updateLoan,
  addRepayment,
  deleteRepayment,
  computeLoanSummary,
  todayStr,
  LENDER_TYPES,
} from "./financeService";

function fmt(n) {
  return "TZS " + Math.round(n || 0).toLocaleString();
}

const initialLoanForm = {
  lenderName: "",
  lenderType: "Individual",
  principal: "",
  interestRate: "",
  interestType: "monthly", // flat | monthly | annual
  dateBorrowed: todayStr(),
  dueDate: "",
  notes: "",
};

const STATUS_STYLES = {
  Active: "bg-blue-100 text-blue-700",
  Overdue: "bg-red-100 text-red-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

function LoanCard({ loan, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayStr());
  const summary = computeLoanSummary(loan);
  const lenderName = loan.lenderName || loan.borrower || "Unnamed lender";

  const handleStatusChange = async (status) => {
    const result = await updateLoan(loan.id, { status, paidDate: status === "Paid" ? todayStr() : loan.paidDate });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to update.");
      return;
    }
    onChange && onChange();
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a payment amount.");
      return;
    }
    const result = await addRepayment(loan.id, { amount: payAmount, date: payDate });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to save payment.");
      return;
    }
    toast.success("Payment logged.");
    setPayAmount("");
    onChange && onChange();
  };

  const handleDeletePayment = async (id) => {
    const result = await deleteRepayment(loan.id, id);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete.");
      return;
    }
    onChange && onChange();
  };

  const handleDeleteLoan = async () => {
    if (!window.confirm(`Delete the loan record for ${lenderName}? This removes all payments too.`))
      return;
    const result = await deleteLoan(loan.id);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete.");
      return;
    }
    toast.success("Loan deleted.");
    onChange && onChange();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-900">{lenderName}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {loan.lenderType || "Individual"}
            </span>
            <select
              value={loan.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border-0 cursor-pointer ${STATUS_STYLES[loan.status]}`}
            >
              <option value="Active">Active</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span>Borrowed: {loan.dateBorrowed || loan.dateGiven}</span>
            {loan.dueDate && <span>Due: {loan.dueDate}</span>}
            <span>
              Interest: {loan.interestRate}% ({loan.interestType})
            </span>
          </div>
          {loan.notes && <p className="mt-1.5 text-sm text-gray-600">{loan.notes}</p>}

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-400">Principal</div>
              <div className="font-bold text-gray-800">{fmt(summary.principal)}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="text-amber-600">Interest Accrued</div>
              <div className="font-bold text-amber-700">{fmt(summary.interestOwed)}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2">
              <div className="text-emerald-600">Paid So Far</div>
              <div className="font-bold text-emerald-700">{fmt(summary.totalRepaid)}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-red-600">You Still Owe</div>
              <div className="font-bold text-red-700">{fmt(summary.balanceRemaining)}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            aria-label="Toggle payments"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={handleDeleteLoan}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete loan"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Payments You've Made
          </h4>
          {(loan.repayments || []).length === 0 ? (
            <p className="text-xs text-gray-400">No payments logged yet.</p>
          ) : (
            <div className="space-y-1.5">
              {loan.repayments.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold text-emerald-700">{fmt(r.amount)}</span>
                  <span className="text-gray-400">{r.date}</span>
                  {r.note && <span className="text-gray-500 truncate max-w-[40%]">{r.note}</span>}
                  <button
                    onClick={() => handleDeletePayment(r.id)}
                    className="text-gray-300 hover:text-red-600"
                    aria-label="Delete payment"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddPayment} className="flex flex-wrap gap-2 pt-1">
            <input
              type="number"
              min="0"
              placeholder="Amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="flex-1 min-w-[100px] border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> Log Payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function LoansTab({ loans, onChange }) {
  const [form, setForm] = useState(initialLoanForm);
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lenderName.trim()) {
      toast.error("Enter who or what you borrowed from.");
      return;
    }
    if (!form.principal || Number(form.principal) <= 0) {
      toast.error("Enter the loan amount.");
      return;
    }
    setSaving(true);
    const result = await addLoan(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to save loan.");
      return;
    }
    toast.success(`Loan from ${form.lenderName} logged.`);
    setForm(initialLoanForm);
    onChange && onChange();
  };

  const sorted = [...loans].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <HandCoins size={18} /> Log Money You've Borrowed
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Borrowed From
            </label>
            <input
              type="text"
              value={form.lenderName}
              onChange={(e) => set("lenderName", e.target.value)}
              placeholder="e.g. John Mwakalinga or CRDB Bank"
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Lender Type
            </label>
            <select
              value={form.lenderType}
              onChange={(e) => set("lenderType", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {LENDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Principal (TZS)
            </label>
            <input
              type="number"
              min="0"
              value={form.principal}
              onChange={(e) => set("principal", e.target.value)}
              placeholder="0"
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Interest Rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.interestRate}
              onChange={(e) => set("interestRate", e.target.value)}
              placeholder="0"
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Interest Type
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {[
              { v: "flat", l: "Flat (one-off)" },
              { v: "monthly", l: "% per month" },
              { v: "annual", l: "% per year" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => set("interestType", opt.v)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  form.interestType === opt.v
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date Borrowed
            </label>
            <input
              type="date"
              value={form.dateBorrowed}
              onChange={(e) => set("dateBorrowed", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder="Optional"
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <Plus size={18} />
          {saving ? "Saving…" : "Add Loan"}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Loans You've Taken</h3>
        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No loans logged yet.
          </div>
        ) : (
          sorted.map((loan) => <LoanCard key={loan.id} loan={loan} onChange={onChange} />)
        )}
      </div>
    </div>
  );
}

export default LoansTab;
