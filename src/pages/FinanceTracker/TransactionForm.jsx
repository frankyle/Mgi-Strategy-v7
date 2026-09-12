// TransactionForm.jsx
import React, { useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  addTransaction,
  todayStr,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  USAGE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  STATUS_LABELS,
} from "./financeService";

const initialForm = {
  date: todayStr(),
  type: "Expense",
  usage: "Personal",
  category: EXPENSE_CATEGORIES[0],
  amount: "",
  paymentMethod: "Mobile Money",
  paymentStatus: "Paid",
  notes: "",
};

function SegButton({ options, value, onChange, labels }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            value === opt
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {labels ? labels[opt] || opt : opt}
        </button>
      ))}
    </div>
  );
}

function TransactionForm({ onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      category: type === "Income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter an amount first.");
      return;
    }
    setSaving(true);
    const result = await addTransaction(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to save.");
      return;
    }
    toast.success(`Logged ${form.type.toLowerCase()} of TZS ${Number(form.amount).toLocaleString()}`);
    setForm({
      ...initialForm,
      date: form.date,
      type: form.type,
      usage: form.usage,
      category: form.category,
      paymentStatus: "Paid",
    });
    onSaved && onSaved();
  };

  const categories = form.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5"
    >
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
        💰 Log a Transaction
      </h3>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
        <div className="mt-1.5">
          <SegButton options={["Expense", "Income"]} value={form.type} onChange={handleTypeChange} />
        </div>
      </div>

      {form.type === "Expense" && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Usage — who is this spend for?
          </label>
          <div className="mt-1.5">
            <SegButton options={USAGE_TYPES} value={form.usage} onChange={(v) => set("usage", v)} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Same account, but this lets you split personal vs family spending in the reports.
          </p>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {form.type === "Expense" ? "Payment Status" : "Receipt Status"}
        </label>
        <div className="mt-1.5">
          <SegButton
            options={PAYMENT_STATUSES}
            value={form.paymentStatus}
            onChange={(v) => set("paymentStatus", v)}
            labels={STATUS_LABELS[form.type]}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {form.type === "Expense"
            ? "Planned = not sent yet. Half Paid = roughly half sent. Paid = fully settled. You can change this later from the transaction list."
            : "Expected = you're counting on it but it hasn't landed. Partially Received = some of it has arrived. Received = fully in your account. You can change this later from the transaction list."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Amount (TZS)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0"
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Payment Method
          </label>
          <select
            value={form.paymentMethod}
            onChange={(e) => set("paymentMethod", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Optional — what was this for?"
          className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        <Save size={18} />
        {saving ? "Saving…" : "Save Transaction"}
      </button>
    </form>
  );
}

export default TransactionForm;
