// ReportReviewModal.jsx
// Edit the review fields of a report row: A-checks, mood, plan, result (R), notes.
import React, { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { A_CHECKS, MOODS, normalizeJournal } from "./JournalSection";
import { updateReportJournal } from "./TradersReportService";

const field =
  "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400";

function ReportReviewModal({ report, onClose, onSaved }) {
  const [j, setJ] = useState(() => normalizeJournal(report.journal));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setJ((p) => ({ ...p, [k]: v }));
  const toggleCheck = (i) =>
    setJ((p) => ({ ...p, checks: p.checks.map((c, idx) => (idx === i ? !c : c)) }));
  const passed = j.checks.filter(Boolean).length;

  const save = async () => {
    setSaving(true);
    const res = await updateReportJournal(report.id, j);
    setSaving(false);
    if (!res.success) {
      toast.error(res.error.message || "Could not save");
      return;
    }
    toast.success("Review saved");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Review this trade</h2>
            <p className="text-sm text-gray-500">
              {report.pair} · {report.signal?.toUpperCase()} · {report.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">Was it really an A setup?</h3>
              <span
                className={`text-sm font-semibold ${
                  passed === A_CHECKS.length ? "text-green-600" : "text-amber-600"
                }`}
              >
                {passed}/{A_CHECKS.length}
              </span>
            </div>
            <div className="space-y-2">
              {A_CHECKS.map((c, i) => (
                <label key={c} className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={j.checks[i]}
                    onChange={() => toggleCheck(i)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-gray-600">
              Mood
              <select className={field} value={j.mood} onChange={(e) => set("mood", e.target.value)}>
                {MOODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Followed plan?
              <select
                className={field}
                value={String(j.followed_plan)}
                onChange={(e) => set("followed_plan", e.target.value === "true")}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Result (R)
              <input
                type="number"
                step="0.1"
                className={`${field} ${j.result_r === "" ? "border-amber-400 bg-amber-50" : ""}`}
                placeholder="e.g. 3 or -1"
                value={j.result_r}
                onChange={(e) => set("result_r", e.target.value)}
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-gray-600">
            What I learned
            <textarea
              rows={3}
              className={field}
              value={j.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportReviewModal;
