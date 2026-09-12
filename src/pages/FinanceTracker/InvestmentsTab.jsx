// InvestmentsTab.jsx
// Tracks investments you're funding out of the same account — e.g. the
// dehydration machine development and the prop firm account purchase.
import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Rocket } from "lucide-react";
import toast from "react-hot-toast";
import {
  addInvestment,
  deleteInvestment,
  updateInvestment,
  addContribution,
  deleteContribution,
  computeInvestmentTotal,
  todayStr,
} from "./financeService";

function fmt(n) {
  return "TZS " + Math.round(n || 0).toLocaleString();
}

const initialForm = {
  name: "",
  category: "",
  targetAmount: "",
  notes: "",
};

const STATUS_STYLES = {
  Planning: "bg-gray-200 text-gray-600",
  "In Progress": "bg-amber-100 text-amber-700",
  Active: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

function InvestmentCard({ investment, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const total = computeInvestmentTotal(investment);
  const pct =
    investment.targetAmount > 0 ? Math.min(100, (total / investment.targetAmount) * 100) : null;

  const handleStatusChange = async (status) => {
    const result = await updateInvestment(investment.id, { status });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to update.");
      return;
    }
    onChange && onChange();
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter an amount.");
      return;
    }
    const result = await addContribution(investment.id, { amount, date });
    if (!result.success) {
      toast.error(result.error?.message || "Failed to save.");
      return;
    }
    toast.success("Contribution logged.");
    setAmount("");
    onChange && onChange();
  };

  const handleDeleteContribution = async (id) => {
    const result = await deleteContribution(investment.id, id);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete.");
      return;
    }
    onChange && onChange();
  };

  const handleDeleteInvestment = async () => {
    if (!window.confirm(`Delete "${investment.name}"? This removes all logged contributions too.`))
      return;
    const result = await deleteInvestment(investment.id);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to delete.");
      return;
    }
    toast.success("Investment deleted.");
    onChange && onChange();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-900">{investment.name}</span>
            <select
              value={investment.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border-0 cursor-pointer ${STATUS_STYLES[investment.status]}`}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {investment.category && (
            <div className="mt-1 text-xs text-gray-500">{investment.category}</div>
          )}
          {investment.notes && <p className="mt-1.5 text-sm text-gray-600">{investment.notes}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs text-gray-400">Total Invested</div>
              <div className="text-lg font-extrabold text-blue-700">{fmt(total)}</div>
            </div>
            {investment.targetAmount > 0 && (
              <div>
                <div className="text-xs text-gray-400">Target</div>
                <div className="text-sm font-semibold text-gray-700">{fmt(investment.targetAmount)}</div>
              </div>
            )}
          </div>

          {pct !== null && (
            <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            aria-label="Toggle contributions"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={handleDeleteInvestment}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete investment"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contributions</h4>
          {(investment.contributions || []).length === 0 ? (
            <p className="text-xs text-gray-400">No contributions logged yet.</p>
          ) : (
            <div className="space-y-1.5">
              {investment.contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold text-blue-700">{fmt(c.amount)}</span>
                  <span className="text-gray-400">{c.date}</span>
                  {c.note && <span className="text-gray-500 truncate max-w-[40%]">{c.note}</span>}
                  <button
                    onClick={() => handleDeleteContribution(c.id)}
                    className="text-gray-300 hover:text-red-600"
                    aria-label="Delete contribution"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddContribution} className="flex flex-wrap gap-2 pt-1">
            <input
              type="number"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 min-w-[100px] border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> Log Contribution
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function InvestmentsTab({ investments, onChange }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Give this investment a name.");
      return;
    }
    setSaving(true);
    const result = await addInvestment(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error?.message || "Failed to save.");
      return;
    }
    toast.success(`"${form.name}" added.`);
    setForm(initialForm);
    onChange && onChange();
  };

  const sorted = [...investments].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Rocket size={18} /> Add an Investment
        </h3>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Dehydration Machine Development"
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Trading / Equipment"
              className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Target Amount (TZS, optional)
            </label>
            <input
              type="number"
              min="0"
              value={form.targetAmount}
              onChange={(e) => set("targetAmount", e.target.value)}
              placeholder="0"
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
          {saving ? "Saving…" : "Add Investment"}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Your Investments</h3>
        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No investments yet.
          </div>
        ) : (
          sorted.map((inv) => <InvestmentCard key={inv.id} investment={inv} onChange={onChange} />)
        )}
      </div>
    </div>
  );
}

export default InvestmentsTab;
