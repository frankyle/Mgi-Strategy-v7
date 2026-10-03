import React, { useState } from "react";
import { X, ImagePlus, CheckCircle2, XCircle, MinusCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateSetupOutcome,
  uploadSetupImage,
  deleteSetupImage,
  getAuthUserId,
} from "./SetupMatchGraderService";

const STATUS_OPTIONS = [
  { value: "pending", label: "Still open", icon: Clock, color: "text-gray-500 border-gray-200 bg-gray-50" },
  { value: "win", label: "Win", icon: CheckCircle2, color: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  { value: "loss", label: "Loss", icon: XCircle, color: "text-rose-700 border-rose-200 bg-rose-50" },
  { value: "breakeven", label: "Breakeven", icon: MinusCircle, color: "text-amber-700 border-amber-200 bg-amber-50" },
];

// Meant to be reopened as many times as needed — log it mid-week as "still
// open", then come back at the end of the week and flip it to win/loss with
// the closing screenshot.
export default function OutcomeModal({ setup, onClose, onSaved }) {
  const [status, setStatus] = useState(setup.outcome_status || "pending");
  const [notes, setNotes] = useState(setup.outcome_notes || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(setup.outcome_image_url || null);
  const [saving, setSaving] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = setup.outcome_image_url;

      if (file) {
        const userId = await getAuthUserId();
        if (!userId) {
          toast.error("You need to be signed in.");
          setSaving(false);
          return;
        }
        const path = `${userId}/setup-matches/${Date.now()}_outcome_${file.name}`;
        const uploadResult = await uploadSetupImage(file, path);
        if (!uploadResult.success) {
          toast.error(uploadResult.error.message || "Image upload failed");
          setSaving(false);
          return;
        }
        // Replaced an existing outcome image — clean up the old one.
        if (setup.outcome_image_url) deleteSetupImage(setup.outcome_image_url);
        imageUrl = uploadResult.url;
      }

      const result = await updateSetupOutcome(setup.id, { status, notes: notes.trim(), imageUrl });
      if (!result.success) {
        toast.error(result.error.message || "Could not save outcome");
        setSaving(false);
        return;
      }

      toast.success("Outcome saved");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Trade outcome</h3>
            <p className="text-xs text-gray-500 mt-1">
              {setup.pair} · {setup.htf_timeframe} setup — log how it played out. If this setup is
              published, this shows up on your Trade Blog too.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">Result</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                    active ? opt.color : "text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Hit TP1 on the NY session push, closed for +2.4R."
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5">
            Result screenshot <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Outcome preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 text-gray-500 hover:text-rose-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 rounded-xl h-28 cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-500">
              <ImagePlus size={20} />
              <span className="text-xs">Tap to upload screenshot</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save outcome"}
          </button>
        </div>
      </div>
    </div>
  );
}
