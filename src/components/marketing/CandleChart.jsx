// CandleChart.jsx — animated candlestick decoration for the public website.
//  <CandleStrip/>  endless, slowly scrolling candles used as a background
//  <LiveChart/>    candles that build themselves, with Entry / SL / TP lines
// Illustration only — none of this is real price data.
import React, { useEffect, useMemo, useState } from "react";
import { makeCandles, priceRange } from "../../utils/candles";

const GREEN = "#2FBF71";
const RED = "#C1502E";

/* ---------- background strip ---------- */
export function CandleStrip({ className = "", count = 46, seed = 11, height = 190 }) {
  const candles = useMemo(
    () => makeCandles(count, seed, { start: 100, amp: 9, cycles: 2.5, noise: 3, wick: 3.5, loop: true }),
    [count, seed]
  );
  const STEP = 20;
  const W = count * STEP;
  const { min, max } = priceRange(candles);
  const y = (v) => height - 14 - ((v - min) / (max - min)) * (height - 28);

  const copy = (offset, key) => (
    <g key={key} transform={`translate(${offset},0)`}>
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? GREEN : RED;
        const x = i * STEP + STEP / 2;
        const top = y(Math.max(c.open, c.close));
        const bodyH = Math.max(3, Math.abs(y(c.open) - y(c.close)));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.6" />
            <rect x={x - 5} y={top} width="10" height={bodyH} rx="1.5" fill={color} />
          </g>
        );
      })}
    </g>
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{
        height,
        WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 45%)",
        maskImage: "linear-gradient(to bottom, transparent, #000 45%)",
      }}
    >
      <svg className="candle-strip" width={W * 2} height={height} viewBox={`0 0 ${W * 2} ${height}`}>
        {copy(0, "a")}
        {copy(W, "b")}
      </svg>
    </div>
  );
}

/* ---------- hero chart ---------- */
const N = 26;
const W = 540;
const H = 320;

export function LiveChart() {
  const [run, setRun] = useState(0);

  // rebuild the chart every few seconds so the candles keep "printing"
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const id = setInterval(() => setRun((r) => r + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const candles = useMemo(
    () => makeCandles(N, 21, { start: 100, trend: 0.9, amp: 4, cycles: 2, noise: 1.6, wick: 2.4 }),
    []
  );
  const entryIdx = 15;
  const entry = candles[entryIdx].close;
  const sl = entry - 9;
  const tp = entry + 18;
  const { min, max } = priceRange(candles, [sl, tp]);
  const padL = 12, padR = 64, padT = 18, padB = 18;
  const step = (W - padL - padR) / N;
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const lineX1 = padL + entryIdx * step;
  const lineX2 = W - padR + 8;
  const last = candles[N - 1];

  const level = (v, color, label, delay) => (
    <g key={label} className="chart-level" style={{ animationDelay: `${delay}s` }}>
      <line x1={lineX1} x2={lineX2} y1={y(v)} y2={y(v)} stroke={color} strokeWidth="1.4" strokeDasharray="5 4" />
      <rect x={lineX2 + 2} y={y(v) - 10} width="50" height="20" rx="4" fill={color} />
      <text x={lineX2 + 27} y={y(v) + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F1720" fontFamily="IBM Plex Mono, monospace">
        {label}
      </text>
    </g>
  );

  return (
    <div className="relative rounded-2xl border border-line bg-panel/80 backdrop-blur p-4 sm:p-5 shadow-[0_20px_80px_-20px_rgba(47,191,113,0.25)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-long opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-long" />
          </span>
          <p className="font-display font-semibold">XAU/USD <span className="text-muted font-normal text-sm">· 15m</span></p>
        </div>
        <span className="font-mono text-[11px] text-long border border-long/40 rounded px-2 py-0.5">LONG</span>
      </div>

      <svg key={run} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Animated example candlestick chart with entry, stop-loss and take-profit levels">
        {[0.2, 0.4, 0.6, 0.8].map((g) => (
          <line key={g} x1="0" x2={W} y1={padT + g * (H - padT - padB)} y2={padT + g * (H - padT - padB)} stroke="rgba(255,255,255,0.05)" />
        ))}
        {candles.map((c, i) => {
          const up = c.close >= c.open;
          const color = up ? GREEN : RED;
          const x = padL + i * step + step / 2;
          const top = y(Math.max(c.open, c.close));
          const bodyH = Math.max(3, Math.abs(y(c.open) - y(c.close)));
          return (
            <g key={i} className={`candle ${i === N - 1 ? "candle-live" : ""}`} style={{ "--d": `${i * 0.07}s` }}>
              <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.8" />
              <rect x={x - step * 0.3} y={top} width={step * 0.6} height={bodyH} rx="1.5" fill={color} />
            </g>
          );
        })}
        {level(tp, GREEN, "TP", 2.1)}
        {level(entry, "#EDEFF2", "ENTRY", 2.4)}
        {level(sl, RED, "SL", 2.7)}
        <g className="chart-level" style={{ animationDelay: "2s" }}>
          <circle cx={padL + (N - 1) * step + step / 2} cy={y(last.close)} r="9" fill={GREEN} opacity="0.25" className="pulse-dot" />
          <circle cx={padL + (N - 1) * step + step / 2} cy={y(last.close)} r="3.5" fill={GREEN} />
        </g>
      </svg>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted font-mono">
        <span>Risk : Reward 1 : 2</span>
        <span>Illustration, not a live price</span>
      </div>
    </div>
  );
}
