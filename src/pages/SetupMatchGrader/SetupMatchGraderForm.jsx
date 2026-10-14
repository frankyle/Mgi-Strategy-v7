import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Upload, X, Sparkles } from "lucide-react";
import {
  HTF_REACTIONS,
  HTF_TIMEFRAMES,
  HTF_ZONE_TYPES,
  LEVEL_STATUS,
  SESSION_OPTIONS,
  gradeSetup,
  GRADE_STYLES,
} from "./grading";
import { addSetup, uploadSetupImage, getAuthUserId } from "./SetupMatchGraderService";
import { getWatchlistPairs } from "./pairWatchlist";
import PairSelect from "./PairSelect";

// Reads a File object into the raw base64 string the AI endpoint expects
// (strips the "data:image/png;base64," prefix that readAsDataURL adds).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  pair: getWatchlistPairs()[0] || "XAUUSD",
  htf_timeframe: "4H",
  htf_level_type: "Buy FVG",
  htf_level_status: "Retested",
  htf_reaction: "none",
  htf_direction: "long",
  ltf_weekly_bias: null, // no longer used — kept null so the column stays valid
  ltf_session_grab: "none",
  ltf_fvg_tagged: false,
  ltf_direction: null,
  // Legacy fields kept only so old NOT NULL columns are satisfied — no
  // longer shown in the UI and no longer used for grading.
  ltf_structure_break: false,
  ltf_ema200_reclaim: false,
};

function ToggleBtn({ active, onClick, activeClass, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide border transition-colors ${
        active
          ? activeClass
          : "border-gray-200 text-gray-400 hover:border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function ChartDrop({ label, helpText, preview, onFile, onRemove, accentClass }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <p className="text-xs text-gray-400 mb-1.5">{helpText}</p>
      {!preview ? (
        <label
          className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${accentClass}`}
        >
          <Upload size={18} className="text-gray-400" />
          <span className="text-xs text-gray-500">Tap to upload screenshot</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>
      ) : (
        <div className="relative inline-block">
          <img src={preview} alt={label} className="rounded-xl max-h-32 border border-gray-200" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SetupMatchGraderForm({ onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [htfFile, setHtfFile] = useState(null);
  const [htfPreview, setHtfPreview] = useState(null);
  const [ltfFile, setLtfFile] = useState(null);
  const [ltfPreview, setLtfPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { recommendation, watch_for, notes }

  const update = (key, val) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: val }));
  };

  // Picking a zone type also sets the direction: Buy zones -> LONG, Sell zones -> SHORT.
  const updateZoneType = (value) => {
    const zone = HTF_ZONE_TYPES.find((z) => z.value === value);
    setTouched(true);
    setForm((f) => ({
      ...f,
      htf_level_type: value,
      htf_direction: zone ? zone.direction : f.htf_direction,
    }));
  };

  const handleHtfFile = (file) => {
    setHtfFile(file);
    setHtfPreview(URL.createObjectURL(file));
  };
  const handleLtfFile = (file) => {
    setLtfFile(file);
    setLtfPreview(URL.createObjectURL(file));
  };
  const removeHtfFile = () => {
    setHtfFile(null);
    setHtfPreview(null);
  };
  const removeLtfFile = () => {
    setLtfFile(null);
    setLtfPreview(null);
  };

  const handleAnalyze = async () => {
    if (!htfFile && !ltfFile) {
      toast.error("Upload at least one chart screenshot first.");
      return;
    }
    setAnalyzing(true);
    setAiResult(null);

    try {
      const payload = { pair: form.pair };
      if (htfFile) {
        payload.htf_image_base64 = await fileToBase64(htfFile);
        payload.htf_image_media_type = htfFile.type || "image/png";
      }
      if (ltfFile) {
        payload.ltf_image_base64 = await fileToBase64(ltfFile);
        payload.ltf_image_media_type = ltfFile.type || "image/png";
      }

      const response = await fetch("/api/analyze-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "AI analysis failed.");
        setAnalyzing(false);
        return;
      }

      const a = result.analysis;
      setTouched(true);
      setForm((f) => ({
        ...f,
        ...(a.htf_level_type ? { htf_level_type: a.htf_level_type } : {}),
        ...(a.htf_level_status ? { htf_level_status: a.htf_level_status } : {}),
        ...(a.htf_reaction ? { htf_reaction: a.htf_reaction } : {}),
        htf_direction: a.htf_direction ?? f.htf_direction,
        ...(a.ltf_session_grab ? { ltf_session_grab: a.ltf_session_grab } : {}),
        ltf_fvg_tagged: typeof a.ltf_fvg_tagged === "boolean" ? a.ltf_fvg_tagged : f.ltf_fvg_tagged,
        ltf_direction: a.ltf_direction ?? f.ltf_direction,
      }));
      setAiResult({
        recommendation: a.recommendation,
        watch_for: a.watch_for,
        notes: a.notes,
      });
      toast.success("Fields filled in — double-check them before saving.");
    } catch (err) {
      toast.error(err.message || "AI analysis failed.");
    }
    setAnalyzing(false);
  };

  const preview = useMemo(
    () =>
      gradeSetup({
        htfLevelStatus: form.htf_level_status,
        htfReaction: form.htf_reaction,
        htfDirection: form.htf_direction,
        ltfSession: form.ltf_session_grab,
        ltfBounce: form.ltf_fvg_tagged,
        ltfDirection: form.ltf_direction,
      }),
    [form]
  );

  const handleSave = async () => {
    if (!touched) {
      toast.error("Make your selections above before logging a setup.");
      return;
    }
    if (!form.htf_direction || !form.ltf_direction) {
      toast.error("Pick a direction for both the 4H/2H zone and the 1H confirmation.");
      return;
    }

    setSaving(true);

    const userId = await getAuthUserId();
    if (!userId) {
      setSaving(false);
      toast.error("You need to be signed in to upload chart screenshots.");
      return;
    }

    let htf_chart_url = null;
    let ltf_chart_url = null;

    if (htfFile) {
      const path = `${userId}/setup-matches/${Date.now()}_htf_${htfFile.name}`;
      const result = await uploadSetupImage(htfFile, path);
      if (!result.success) {
        setSaving(false);
        toast.error("HTF chart upload failed: " + result.error.message);
        return;
      }
      htf_chart_url = result.url;
    }

    if (ltfFile) {
      const path = `${userId}/setup-matches/${Date.now()}_ltf_${ltfFile.name}`;
      const result = await uploadSetupImage(ltfFile, path);
      if (!result.success) {
        setSaving(false);
        toast.error("LTF chart upload failed: " + result.error.message);
        return;
      }
      ltf_chart_url = result.url;
    }

    const result = await addSetup({
      ...form,
      grade: preview.grade,
      htf_chart_url,
      ltf_chart_url,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error.message || "Could not save setup");
      return;
    }
    toast.success(`Logged as ${preview.label}`);
    setForm(emptyForm);
    setTouched(false);
    removeHtfFile();
    removeLtfFile();
    onSaved?.();
  };

  const styles = GRADE_STYLES[preview.grade];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Grade a Setup
        </h3>
        <PairSelect value={form.pair} onChange={(p) => update("pair", p)} />
      </div>

      {/* STRATEGY RULES */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 space-y-1">
        <p>I only trade during the LONDON session or the NEW YORK session.</p>
        <p>
          I wait for a higher timeframe 4H or 2H FVG / IFVG to be retested, and then we move in the
          opposite direction from the retest.
        </p>
      </div>

      {/* PHASE 1 */}
      <div className="border-t-2 border-blue-500 rounded-t-lg pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-blue-600 border border-blue-500 rounded px-1.5 py-0.5">
            PHASE 1
          </span>
          <span className="text-sm font-semibold text-gray-800">
            HTF Zone Retest — 4H / 2H FVG or IFVG
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500">Timeframe</label>
            <select
              value={form.htf_timeframe}
              onChange={(e) => update("htf_timeframe", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
            >
              {HTF_TIMEFRAMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Zone type</label>
            <select
              value={form.htf_level_type}
              onChange={(e) => updateZoneType(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
            >
              {HTF_ZONE_TYPES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Zone status</label>
          <select
            value={form.htf_level_status}
            onChange={(e) => update("htf_level_status", e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {LEVEL_STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            It only counts when the zone is <span className="font-semibold">Retested</span>. Broken
            means price closed through it.
          </p>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Reaction at the retest</label>
          <select
            value={form.htf_reaction}
            onChange={(e) => update("htf_reaction", e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {HTF_REACTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Direction price moves away from the zone
          </label>
          <div className="flex gap-2">
            <ToggleBtn
              active={form.htf_direction === "long"}
              onClick={() => update("htf_direction", "long")}
              activeClass="border-emerald-500 bg-emerald-50 text-emerald-700"
            >
              LONG
            </ToggleBtn>
            <ToggleBtn
              active={form.htf_direction === "short"}
              onClick={() => update("htf_direction", "short")}
              activeClass="border-rose-500 bg-rose-50 text-rose-700"
            >
              SHORT
            </ToggleBtn>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Set automatically from the zone type: Buy zones bounce up (LONG), Sell zones bounce
            down (SHORT).
          </p>
        </div>

        <div className="mt-3">
          <ChartDrop
            label="4H / 2H Chart Screenshot"
            helpText="Show the 4H or 2H FVG / IFVG, the retest of the zone, and price moving away in the opposite direction. This is your proof the zone was really retested and respected."
            preview={htfPreview}
            onFile={handleHtfFile}
            onRemove={removeHtfFile}
            accentClass="border-blue-200 hover:border-blue-400 hover:bg-blue-50/40"
          />
        </div>
      </div>

      {/* PHASE 2 */}
      <div className="border-t-2 border-green-500 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-green-600 border border-green-500 rounded px-1.5 py-0.5">
            PHASE 2
          </span>
          <span className="text-sm font-semibold text-gray-800">
            1H Confirmation — London / New York Session
          </span>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Session</label>
          <select
            value={form.ltf_session_grab}
            onChange={(e) => update("ltf_session_grab", e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {SESSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Trades are only valid inside the London or New York session.
          </p>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">
            1H FVG / IFVG retested and price bounced away?
          </label>
          <div className="flex gap-2">
            <ToggleBtn
              active={form.ltf_fvg_tagged}
              onClick={() => update("ltf_fvg_tagged", true)}
              activeClass="border-sky-500 bg-sky-50 text-sky-700"
            >
              YES
            </ToggleBtn>
            <ToggleBtn
              active={!form.ltf_fvg_tagged}
              onClick={() => update("ltf_fvg_tagged", false)}
              activeClass="border-gray-400 bg-gray-50 text-gray-600"
            >
              NO
            </ToggleBtn>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            The 1H chart is only used to compare with the 4H/2H read. Say YES only if the 1H zone
            was retested and price moved away from it.
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Entry direction</label>
          <div className="flex gap-2">
            <ToggleBtn
              active={form.ltf_direction === "long"}
              onClick={() => update("ltf_direction", "long")}
              activeClass="border-emerald-500 bg-emerald-50 text-emerald-700"
            >
              LONG
            </ToggleBtn>
            <ToggleBtn
              active={form.ltf_direction === "short"}
              onClick={() => update("ltf_direction", "short")}
              activeClass="border-rose-500 bg-rose-50 text-rose-700"
            >
              SHORT
            </ToggleBtn>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Must match the direction from Phase 1. A mismatch means the setup won't grade as a
            match.
          </p>
        </div>

        <div className="mt-3">
          <ChartDrop
            label="1H Chart Screenshot"
            helpText="Show the 1H FVG / IFVG, the retest inside the London or New York session, and price bouncing away from it."
            preview={ltfPreview}
            onFile={handleLtfFile}
            onRemove={removeLtfFile}
            accentClass="border-green-200 hover:border-green-400 hover:bg-green-50/40"
          />
        </div>
      </div>

      {/* AI ANALYSIS */}
      <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-4">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || (!htfFile && !ltfFile)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Sparkles size={16} />
          {analyzing ? "Reading your charts…" : "Analyze My Charts with AI"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Upload a chart above first. This fills in the dropdowns for you and gives a buy/sell/wait
          call — always double-check its reading before saving.
        </p>

        {aiResult && (
          <div className="mt-3 rounded-lg bg-white border border-purple-200 p-3">
            <div
              className={`text-sm font-bold uppercase tracking-wide ${
                aiResult.recommendation === "buy"
                  ? "text-emerald-700"
                  : aiResult.recommendation === "sell"
                  ? "text-rose-700"
                  : "text-amber-700"
              }`}
            >
              AI call: {aiResult.recommendation}
            </div>
            {aiResult.watch_for && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-semibold">Watch for:</span> {aiResult.watch_for}
              </p>
            )}
            {aiResult.notes && <p className="text-xs text-gray-500 mt-1">{aiResult.notes}</p>}
          </div>
        )}
      </div>

      {/* LIVE PREVIEW + SAVE */}
      {!touched ? (
        <div className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
          <span className="text-sm font-bold text-gray-500">
            Make your selections above — nothing is graded yet
          </span>
          <button
            disabled
            className="bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-not-allowed"
          >
            + Log Graded Setup
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-between rounded-xl border ${styles.border} ${styles.bg} px-4 py-3`}
        >
          <span className={`text-sm font-bold ${styles.text}`}>
            {preview.label}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "+ Log Graded Setup"}
          </button>
        </div>
      )}
    </div>
  );
}
