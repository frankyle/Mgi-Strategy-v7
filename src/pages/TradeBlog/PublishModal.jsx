import React, { useState } from "react";
import { X, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { setSetupPublished } from "../SetupMatchGrader/SetupMatchGraderService";
import { GRADE_STYLES } from "../SetupMatchGrader/grading";

// Publish flow lives here rather than inline in the table row, since it
// needs the caption textarea + a bit of "here's what your friends will see"
// context before committing a setup to the public blog.
export default function PublishModal({ setup, onClose, onPublished }) {
  const [caption, setCaption] = useState(setup.caption || "");
  const [saving, setSaving] = useState(false);
  const styles = GRADE_STYLES[setup.grade];

  const handlePublish = async () => {
    setSaving(true);
    const result = await setSetupPublished(setup.id, true, caption.trim() || null);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error.message || "Could not publish");
      return;
    }
    toast.success("Published to your Trade Blog");
    onPublished?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Share2 size={16} className="text-indigo-600" /> Publish this setup
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              This adds it to your public Trade Blog link so friends can see the idea — nothing
              else you've logged becomes visible.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-gray-800">{setup.pair}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{setup.htf_timeframe}</span>
          <span
            className={`ml-auto text-xs font-bold px-2 py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text}`}
          >
            {setup.grade === "full" ? "Full Match" : setup.grade === "partial" ? "Partial" : "No Match"}
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
            placeholder="e.g. Watching for a retest of the daily resistance before taking the short — waiting on NY session sweep."
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
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
