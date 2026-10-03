import React, { useState } from "react";
import { Trash2, Share2, EyeOff, CheckCircle2, XCircle, MinusCircle, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { HTF_REACTIONS, SESSION_GRAB_OPTIONS, GRADE_STYLES } from "./grading";
import { deleteSetupById, deleteSetupImage, setSetupPublished } from "./SetupMatchGraderService";
import PublishModal from "../TradeBlog/PublishModal";
import OutcomeModal from "./OutcomeModal";

const OUTCOME_BADGE = {
  win: { label: "Win", icon: CheckCircle2, cls: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  loss: { label: "Loss", icon: XCircle, cls: "text-rose-700 border-rose-200 bg-rose-50" },
  breakeven: { label: "B/E", icon: MinusCircle, cls: "text-amber-700 border-amber-200 bg-amber-50" },
  pending: { label: "Add outcome", icon: Clock3, cls: "text-gray-400 border-gray-200 bg-white" },
};

export default function SetupMatchGraderTable({ setups, onChange }) {
  const [zoomImg, setZoomImg] = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [outcomeTarget, setOutcomeTarget] = useState(null);

  const handleDelete = async (id, htfUrl, ltfUrl) => {
    if (!window.confirm("Remove this logged setup?")) return;
    const result = await deleteSetupById(id);
    if (!result.success) {
      toast.error(result.error.message || "Could not delete");
      return;
    }
    // Best-effort image cleanup — don't block on failures here.
    if (htfUrl) deleteSetupImage(htfUrl);
    if (ltfUrl) deleteSetupImage(ltfUrl);
    onChange?.();
  };

  const handleUnpublish = async (id) => {
    const result = await setSetupPublished(id, false);
    if (!result.success) {
      toast.error(result.error.message || "Could not unpublish");
      return;
    }
    toast.success("Removed from Trade Blog");
    onChange?.();
  };

  if (setups.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
        No setups logged yet. Grade one above to start building your sample.
      </div>
    );
  }

  const gradeLabel = (g) => (g === "full" ? "Full Match" : g === "partial" ? "Partial" : "No Match");
  const sessionLabel = (v) =>
    SESSION_GRAB_OPTIONS.find((o) => o.value === v)
      ?.label.replace(" session grab", "")
      .replace("No session liquidity grab yet", "No grab") || "—";

  return (
    <div>
      {/* ============ PHONE CARDS ============ */}
      <div className="md:hidden space-y-3">
        {setups.map((s) => {
          const styles = GRADE_STYLES[s.grade];
          const badge = OUTCOME_BADGE[s.outcome_status] || OUTCOME_BADGE.pending;
          const BadgeIcon = badge.icon;
          return (
            <div key={s.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${styles.border}`}>
              <div className="p-4 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold text-gray-900 truncate">{s.pair}</p>
                  <p className="text-xs mt-0.5">
                    <span className={s.htf_direction === "long" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {s.htf_direction}
                    </span>
                    {" → "}
                    <span className={s.ltf_direction === "long" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {s.ltf_direction}
                    </span>
                    {s.is_published && (
                      <span className="ml-2 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        Published
                      </span>
                    )}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text}`}>
                  {gradeLabel(s.grade)}
                </span>
              </div>

              <dl className="px-4 pb-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-gray-400 uppercase text-[10px]">HTF</dt>
                  <dd className="text-gray-700">{s.htf_timeframe}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 uppercase text-[10px]">Level</dt>
                  <dd className="text-gray-700">{s.htf_level_type} · {s.htf_level_status}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 uppercase text-[10px]">Reaction</dt>
                  <dd className="text-gray-700">{HTF_REACTIONS.find((r) => r.value === s.htf_reaction)?.label || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 uppercase text-[10px]">LTF trigger</dt>
                  <dd className="text-gray-700">
                    <span className={s.ltf_weekly_bias === "blue" ? "text-blue-600" : "text-rose-600"}>
                      {s.ltf_weekly_bias === "blue" ? "Blue" : s.ltf_weekly_bias === "red" ? "Red" : "—"}
                    </span>
                    {" / "}
                    {sessionLabel(s.ltf_session_grab)}
                    {s.ltf_fvg_tagged ? <span className="text-sky-600"> · FVG</span> : null}
                  </dd>
                </div>
              </dl>

              {(s.htf_chart_url || s.ltf_chart_url) && (
                <div className="px-4 pb-3 flex gap-2">
                  {s.htf_chart_url && (
                    <button onClick={() => setZoomImg(s.htf_chart_url)} className="text-center">
                      <img src={s.htf_chart_url} alt="HTF chart" className="w-20 h-16 object-cover rounded-lg border-2 border-blue-200" />
                      <span className="block text-[10px] text-gray-500 mt-0.5">Daily/4H</span>
                    </button>
                  )}
                  {s.ltf_chart_url && (
                    <button onClick={() => setZoomImg(s.ltf_chart_url)} className="text-center">
                      <img src={s.ltf_chart_url} alt="LTF chart" className="w-20 h-16 object-cover rounded-lg border-2 border-green-200" />
                      <span className="block text-[10px] text-gray-500 mt-0.5">15m</span>
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100 text-[11px] font-semibold">
                <button onClick={() => setOutcomeTarget(s)} className={`flex flex-col items-center gap-1 py-3 active:bg-gray-50 ${badge.cls.split(" ")[0]}`}>
                  <BadgeIcon size={18} /> {badge.label}
                </button>
                {s.is_published ? (
                  <button onClick={() => handleUnpublish(s.id)} className="flex flex-col items-center gap-1 py-3 text-emerald-600 active:bg-emerald-50">
                    <EyeOff size={18} /> Unpublish
                  </button>
                ) : (
                  <button onClick={() => setPublishTarget(s)} className="flex flex-col items-center gap-1 py-3 text-indigo-600 active:bg-indigo-50">
                    <Share2 size={18} /> Publish
                  </button>
                )}
                <button onClick={() => handleDelete(s.id, s.htf_chart_url, s.ltf_chart_url)} className="flex flex-col items-center gap-1 py-3 text-rose-600 active:bg-rose-50">
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============ DESKTOP TABLE ============ */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
            <th className="px-4 py-3">Pair</th>
            <th className="px-4 py-3">HTF</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Reaction</th>
            <th className="px-4 py-3">LTF Trigger</th>
            <th className="px-4 py-3">Direction</th>
            <th className="px-4 py-3">Charts</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Outcome</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {setups.map((s) => {
            const styles = GRADE_STYLES[s.grade];
            return (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">{s.pair}</td>
                <td className="px-4 py-3 text-gray-600">{s.htf_timeframe}</td>
                <td className="px-4 py-3 text-gray-600">
                  {s.htf_level_type} · {s.htf_level_status}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {HTF_REACTIONS.find((r) => r.value === s.htf_reaction)?.label}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <span className={s.ltf_weekly_bias === "blue" ? "text-blue-600" : "text-rose-600"}>
                    {s.ltf_weekly_bias === "blue" ? "Blue" : s.ltf_weekly_bias === "red" ? "Red" : "—"}
                  </span>
                  {" / "}
                  {SESSION_GRAB_OPTIONS.find((o) => o.value === s.ltf_session_grab)?.label.replace(
                    " session grab",
                    ""
                  ).replace("No session liquidity grab yet", "No grab") || "—"}
                  {s.ltf_fvg_tagged ? (
                    <span className="ml-1 text-sky-600" title="FVG present (optional tag)">
                      · FVG
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className={s.htf_direction === "long" ? "text-emerald-600" : "text-rose-600"}>
                    {s.htf_direction}
                  </span>
                  {" → "}
                  <span className={s.ltf_direction === "long" ? "text-emerald-600" : "text-rose-600"}>
                    {s.ltf_direction}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {s.htf_chart_url && (
                      <img
                        src={s.htf_chart_url}
                        alt="HTF chart"
                        onClick={() => setZoomImg(s.htf_chart_url)}
                        className="w-9 h-9 object-cover rounded-md border border-blue-200 cursor-pointer"
                        title="Daily/4H chart"
                      />
                    )}
                    {s.ltf_chart_url && (
                      <img
                        src={s.ltf_chart_url}
                        alt="LTF chart"
                        onClick={() => setZoomImg(s.ltf_chart_url)}
                        className="w-9 h-9 object-cover rounded-md border border-green-200 cursor-pointer"
                        title="15m chart"
                      />
                    )}
                    {!s.htf_chart_url && !s.ltf_chart_url && (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text}`}>
                    {s.grade === "full" ? "Full Match" : s.grade === "partial" ? "Partial" : "No Match"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const badge = OUTCOME_BADGE[s.outcome_status] || OUTCOME_BADGE.pending;
                    const Icon = badge.icon;
                    return (
                      <button
                        onClick={() => setOutcomeTarget(s)}
                        title="Log how this trade played out"
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${badge.cls}`}
                      >
                        <Icon size={12} /> {badge.label}
                      </button>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {s.is_published ? (
                      <button
                        onClick={() => handleUnpublish(s.id)}
                        title="Remove from Trade Blog"
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-rose-600 border border-emerald-200 hover:border-rose-200 rounded-full px-2 py-1"
                      >
                        <EyeOff size={12} /> Published
                      </button>
                    ) : (
                      <button
                        onClick={() => setPublishTarget(s)}
                        title="Publish to Trade Blog"
                        className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 rounded-full px-2 py-1"
                      >
                        <Share2 size={12} /> Publish
                      </button>
                    )}
                    <button onClick={() => handleDelete(s.id, s.htf_chart_url, s.ltf_chart_url)} aria-label="Delete setup">
                      <Trash2 size={15} className="text-gray-300 hover:text-rose-500" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {zoomImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} alt="Zoomed chart" className="max-h-[85vh] max-w-full rounded-xl" />
        </div>
      )}

      {publishTarget && (
        <PublishModal
          setup={publishTarget}
          onClose={() => setPublishTarget(null)}
          onPublished={() => {
            setPublishTarget(null);
            onChange?.();
          }}
        />
      )}

      {outcomeTarget && (
        <OutcomeModal
          setup={outcomeTarget}
          onClose={() => setOutcomeTarget(null)}
          onSaved={() => {
            setOutcomeTarget(null);
            onChange?.();
          }}
        />
      )}
    </div>
  );
}
