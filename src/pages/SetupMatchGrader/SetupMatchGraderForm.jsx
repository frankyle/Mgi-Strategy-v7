import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Upload, X, Sparkles } from "lucide-react";
import { HTF_REACTIONS, LEVEL_STATUS, SESSION_GRAB_OPTIONS, gradeSetup, GRADE_STYLES } from "./grading";
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
  htf_level_type: "Resistance",
  htf_level_status: "Retested",
  htf_reaction: "none",
  htf_direction: null,
  ltf_weekly_bias: null,
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
        ltf_weekly_bias: a.ltf_weekly_bias ?? f.ltf_weekly_bias,
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
        htfReaction: form.htf_reaction,
        htfDirection: form.htf_direction,
        ltfWeeklyBias: form.ltf_weekly_bias,
        ltfSessionGrab: form.ltf_session_grab,
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
      toast.error("Pick a direction for both Phase 1 and Phase 2.");
      return;
    }
    if (!form.ltf_weekly_bias) {
      toast.error("Pick which side of the weekly open you're trading — blue or red.");
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

      {/* PHASE 1 */}
      <div className="border-t-2 border-blue-500 rounded-t-lg pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-blue-600 border border-blue-500 rounded px-1.5 py-0.5">
            PHASE 1
          </span>
          <span className="text-sm font-semibold text-gray-800">
            HTF Reversal — Daily / 4H
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
              <option>Daily</option>
              <option>4H</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Level type</label>
            <select
              value={form.htf_level_type}
              onChange={(e) => update("htf_level_type", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
            >
              <option>Support</option>
              <option>Resistance</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Level status</label>
          <select
            value={form.htf_level_status}
            onChange={(e) => update("htf_level_status", e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {LEVEL_STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Reaction at level</label>
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
            Implied direction
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
        </div>

        <div className="mt-3">
          <ChartDrop
            label="Daily / 4H Chart Screenshot"
            helpText="Show the level getting swept, and price moving into the opposite zone — the same 'before and after' shift you'd mark with your two boxes (grey → teal, or the reverse). This is your proof the higher timeframe actually reversed, not just touched a line."
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
            LTF Continuation — Weekly Bias + Session Liquidity Grab
          </span>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">
            Weekly bias — which side of the weekly open?
          </label>
          <div className="flex gap-2">
            <ToggleBtn
              active={form.ltf_weekly_bias === "blue"}
              onClick={() => update("ltf_weekly_bias", "blue")}
              activeClass="border-blue-500 bg-blue-50 text-blue-700"
            >
              BLUE (BUY)
            </ToggleBtn>
            <ToggleBtn
              active={form.ltf_weekly_bias === "red"}
              onClick={() => update("ltf_weekly_bias", "red")}
              activeClass="border-rose-500 bg-rose-50 text-rose-700"
            >
              RED (SELL)
            </ToggleBtn>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Blue = price trading above the weekly open, only look for buys. Red = price trading
            below the weekly open, only look for sells.
          </p>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500">Session liquidity grab</label>
          <select
            value={form.ltf_session_grab}
            onChange={(e) => update("ltf_session_grab", e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {SESSION_GRAB_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            On a blue/buy bias, this should be a sweep of session lows that gets rejected back up.
            On a red/sell bias, a sweep of session highs rejected back down.
          </p>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">
            FVG present &amp; tapped{" "}
            <span className="text-gray-400 font-normal">(optional tag — doesn't affect grade)</span>
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
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Entry direction
          </label>
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
            Should match your weekly bias — blue/buy bias with a LONG entry, red/sell bias with a
            SHORT entry. A mismatch here means the setup won't grade as a match.
          </p>
        </div>

        <div className="mt-3">
          <ChartDrop
            label="LTF Chart Screenshot"
            helpText="Show the weekly open line, the session high/low being swept, and the rejection back in your bias direction. This is your proof the liquidity grab actually happened where you say it did."
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
