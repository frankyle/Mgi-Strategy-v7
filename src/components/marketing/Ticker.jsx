import { tickerPairs } from "../../data/marketingSignals";

export default function Ticker() {
  const row = [...tickerPairs, ...tickerPairs];
  return (
    <div className="border-y border-line bg-panel overflow-hidden">
      <div className="flex gap-10 py-2 px-4 font-mono text-xs whitespace-nowrap animate-[mgiTickerScroll_28s_linear_infinite]">
        {row.map((t, i) => (
          <span key={i} className="text-muted">
            {t.pair}{" "}
            <span className={t.delta.startsWith("-") ? "text-short" : "text-long"}>
              {t.delta}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes mgiTickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[mgiTickerScroll_28s_linear_infinite\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}
