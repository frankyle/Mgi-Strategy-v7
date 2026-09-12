import React, { useState } from "react";
import { Calendar, EyeOff, CheckCircle2, XCircle, MinusCircle, Clock3 } from "lucide-react";

const GRADE_META = {
  full: { label: "Full Match", cls: "text-long border-long/40 bg-long/10" },
  partial: { label: "Partial Match", cls: "text-steel border-steel/50 bg-steel/10" },
  none: { label: "No Match", cls: "text-short border-short/40 bg-short/10" },
};

const OUTCOME_META = {
  win: { label: "Win", icon: CheckCircle2, cls: "text-long border-long/40 bg-long/10" },
  loss: { label: "Loss", icon: XCircle, cls: "text-short border-short/40 bg-short/10" },
  breakeven: { label: "Breakeven", icon: MinusCircle, cls: "text-muted border-line bg-panel2" },
  pending: { label: "Still open", icon: Clock3, cls: "text-muted border-line bg-panel2" },
};

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// direction shown to readers is the Phase 2 entry direction — that's the
// actual trade being called, Phase 1 is just the reasoning behind it.
export default function TradeIdeaCard({ setup, onUnpublish, readOnly = false }) {
  const [zoomImg, setZoomImg] = useState(null);
  const gradeMeta = GRADE_META[setup.grade] || GRADE_META.none;
  const isLong = setup.ltf_direction === "long";
  const dirColor = isLong ? "text-long border-long/40" : "text-short border-short/40";

  return (
    <div className="bg-panel border border-line overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-semibold text-ink">{setup.pair}</h3>
              <span className={`text-xs font-mono border px-2 py-0.5 ${dirColor}`}>
                {isLong ? "LONG" : "SHORT"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1.5">
              <Calendar size={12} />
              {formatDate(setup.published_at || setup.created_at)}
              <span className="text-line">·</span>
              {setup.htf_timeframe} setup
            </div>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 border shrink-0 ${gradeMeta.cls}`}>
            {gradeMeta.label}
          </span>
        </div>

        {setup.caption && (
          <p className="text-sm text-ink/90 bg-panel2 border border-line p-3 mb-4 leading-relaxed">
            {setup.caption}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
          <div>
            <dt className="text-muted mb-0.5 uppercase tracking-wide">HTF Level</dt>
            <dd className="text-ink">{setup.htf_level_type} · {setup.htf_level_status}</dd>
          </div>
          <div>
            <dt className="text-muted mb-0.5 uppercase tracking-wide">Weekly Bias</dt>
            <dd className={setup.ltf_weekly_bias === "blue" ? "text-long" : "text-short"}>
              {setup.ltf_weekly_bias === "blue" ? "Blue / Buy side" : setup.ltf_weekly_bias === "red" ? "Red / Sell side" : "—"}
            </dd>
          </div>
        </dl>

        {(setup.htf_chart_url || setup.ltf_chart_url) && (
          <div className="grid grid-cols-2 gap-3">
            {setup.htf_chart_url && (
              <button onClick={() => setZoomImg(setup.htf_chart_url)} className="block group">
                <img
                  src={setup.htf_chart_url}
                  alt={`${setup.pair} ${setup.htf_timeframe} chart`}
                  className="w-full h-32 sm:h-40 object-cover border border-line group-hover:border-muted transition-colors"
                />
                <span className="text-[10px] text-muted mt-1 block font-mono">Daily / 4H</span>
              </button>
            )}
            {setup.ltf_chart_url && (
              <button onClick={() => setZoomImg(setup.ltf_chart_url)} className="block group">
                <img
                  src={setup.ltf_chart_url}
                  alt={`${setup.pair} LTF chart`}
                  className="w-full h-32 sm:h-40 object-cover border border-line group-hover:border-muted transition-colors"
                />
                <span className="text-[10px] text-muted mt-1 block font-mono">LTF trigger</span>
              </button>
            )}
          </div>
        )}

        {/* Trade outcome — added mid-week or once the trade's closed out */}
        {setup.outcome_status && setup.outcome_status !== "pending" && (
          <div className="mt-4 pt-4 border-t border-line">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wide text-muted font-semibold">
                Outcome
              </span>
              {(() => {
                const meta = OUTCOME_META[setup.outcome_status] || OUTCOME_META.pending;
                const Icon = meta.icon;
                return (
                  <span className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 border ${meta.cls}`}>
                    <Icon size={12} /> {meta.label}
                  </span>
                );
              })()}
            </div>
            {setup.outcome_notes && (
              <p className="text-sm text-ink/90 mb-3">{setup.outcome_notes}</p>
            )}
            {setup.outcome_image_url && (
              <button onClick={() => setZoomImg(setup.outcome_image_url)} className="block group">
                <img
                  src={setup.outcome_image_url}
                  alt={`${setup.pair} result`}
                  className="w-full h-32 sm:h-40 object-cover border border-line group-hover:border-muted transition-colors"
                />
                <span className="text-[10px] text-muted mt-1 block font-mono">Result screenshot</span>
              </button>
            )}
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-end mt-4 pt-3 border-t border-line">
            <button
              onClick={() => onUnpublish?.(setup.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-short transition-colors"
            >
              <EyeOff size={13} /> Remove from blog
            </button>
          </div>
        )}
      </div>

      {zoomImg && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} alt="Zoomed chart" className="max-h-[85vh] max-w-full border border-line" />
        </div>
      )}
    </div>
  );
}
