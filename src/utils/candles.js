// Tiny deterministic candle generator (same output every render) used only for
// the animated decoration on the public website. Not real market data.
const prng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// loop:true  -> the series ends where it starts (seamless horizontal scroll)
export function makeCandles(n, seed = 7, { start = 100, amp = 6, cycles = 2, noise = 2, wick = 2.5, trend = 0, loop = false } = {}) {
  const rnd = prng(seed);
  const closes = Array.from({ length: n }, (_, i) => {
    const wave = amp * Math.sin((2 * Math.PI * cycles * (i + 1)) / n);
    return start + trend * i + wave + (rnd() - 0.5) * 2 * noise;
  });
  if (loop) closes[n - 1] = closes[0] - (closes[1] - closes[0]) * 0.2; // soften the seam
  return closes.map((close, i) => {
    const open = i === 0 ? (loop ? closes[n - 1] : start) : closes[i - 1];
    return {
      open,
      close,
      high: Math.max(open, close) + rnd() * wick,
      low: Math.min(open, close) - rnd() * wick,
    };
  });
}

export const priceRange = (candles, extra = []) => {
  const all = [...candles.flatMap((c) => [c.high, c.low]), ...extra];
  return { min: Math.min(...all), max: Math.max(...all) };
};
