// Read-only preview card for the public homepage. Not connected to Supabase —
// the real, live version of this lives in src/pages/SignalsFeed.

const statusLabel = {
  active: "Active",
  "closed-win": "Closed · Target hit",
  "closed-loss": "Closed · Stopped out",
};

export default function PreviewSignalCard({ signal }) {
  const isLong = signal.direction === "long";
  const dirColor = isLong ? "text-long border-long/40" : "text-short border-short/40";

  return (
    <article className="border border-line bg-panel p-5 flex flex-col gap-4 rounded-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">{signal.market}</p>
          <h3 className="font-display text-xl font-semibold mt-0.5">{signal.pair}</h3>
        </div>
        <span className={`text-xs font-mono border rounded-sm px-2 py-1 ${dirColor}`}>
          {isLong ? "LONG" : "SHORT"}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-3 font-mono text-sm">
        <div>
          <dt className="text-muted text-xs mb-0.5">Entry</dt>
          <dd>{signal.entry}</dd>
        </div>
        <div>
          <dt className="text-muted text-xs mb-0.5">Stop loss</dt>
          <dd className="text-short">{signal.stopLoss}</dd>
        </div>
        <div>
          <dt className="text-muted text-xs mb-0.5">Take profit</dt>
          <dd className="text-long">{signal.takeProfit}</dd>
        </div>
      </dl>

      <p className="text-sm text-muted">{signal.note}</p>

      <div className="flex items-center justify-between text-xs text-muted border-t border-line pt-3">
        <span>{signal.postedAt}</span>
        <span>{statusLabel[signal.status]}</span>
      </div>
    </article>
  );
}
