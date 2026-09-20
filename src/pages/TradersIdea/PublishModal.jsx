import React, { useState } from "react";
import { X, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { setIdeaPublished } from "./TradersIdeaService";

// Same flow as TradeBlog/PublishModal.jsx (caption + confirm), plus a
// package picker. The package is a display badge only ("Pro", etc. shown
// on the card) — it doesn't restrict who can open the public link.
export const PACKAGE_OPTIONS = [
  { value: "", label: "No badge" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "mentorship", label: "Mentorship" },
];

export default function PublishModal({ idea, onClose, onPublished }) {
  const [caption, setCaption] = useState(idea.caption || "");
  const [pkg, setPkg] = useState(idea.package || "");
  const [saving, setSaving] = useState(false);

  const handlePublish = async () => {
    setSaving(true);
    const result = await setIdeaPublished(idea.id, true, caption.trim() || null, pkg);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error.message || "Could not publish");
      return;
    }
    toast.success("Published to your Traders Blog");
    onPublished?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Share2 size={16} className="text-indigo-600" /> Publish this idea
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              This adds it to your public Traders Blog link so friends can see the idea —
              nothing else you've logged becomes visible.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-gray-800">{idea.pair}</span>
          <span className="text-gray-400">·</span>
          <span
            className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
              idea.signal?.toLowerCase() === "buy"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {idea.signal?.toUpperCase()}
          </span>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Idea for the week <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="e.g. Watching for a retest before taking the entry — see the daily images below."
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Package badge <span className="text-gray-400 font-normal">(optional label only — link stays public)</span>
          </label>
          <select
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
          >
            {PACKAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
