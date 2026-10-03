// weekUtils.js
// Shared helpers for grouping Traders Ideas by trading week (Monday–Sunday).
// Nothing is stored separately: every idea you save already lives in the
// trader_ideas table, and the Weekly Report just groups those rows by week.

const pad = (n) => String(n).padStart(2, "0");

const toKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-10-01" -> local Date (avoids the UTC shift of new Date("2026-10-01"))
export const parseLocalDate = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  if (!y) return null;
  return new Date(y, (m || 1) - 1, d || 1);
};

// Monday of the week the date falls in, as "YYYY-MM-DD"
export const weekStartOf = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d) return null;
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toKey(d);
};

export const currentWeekKey = () => weekStartOf(toKey(new Date()));

export const weekLabel = (key) => {
  const start = parseLocalDate(key);
  if (!start) return "Unknown week";
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const f = (d, withYear) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  return `${f(start)} – ${f(end, true)}`;
};

const num = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
};

// Per-idea facts used by the report (reads the raw journal, so old ideas
// without a journal show "–" instead of made-up defaults).
export const ideaFacts = (idea) => {
  const j = idea.journal || null;
  const checksPassed = j?.checks ? j.checks.filter(Boolean).length : null;
  return {
    checksPassed,
    checksTotal: j?.checks ? j.checks.length : 5,
    isASetup: j?.checks ? j.checks.length > 0 && j.checks.every(Boolean) : false,
    mood: j?.mood || null,
    followedPlan: j ? (typeof j.followed_plan === "boolean" ? j.followed_plan : null) : null,
    resultR: j ? num(j.result_r) : null,
    notes: j?.notes || "",
    // the review fields still need filling in when there is no journal
    // or no result (R) has been entered yet
    needsReview: !j || num(j.result_r) === null,
  };
};

export const summarizeWeek = (ideas) => {
  let buys = 0, sells = 0, published = 0, aSetups = 0;
  let planYes = 0, planKnown = 0, totalR = 0, rCount = 0, wins = 0, losses = 0, needsReview = 0;
  const pairs = new Set();

  ideas.forEach((i) => {
    if (i.signal?.toLowerCase() === "buy") buys += 1;
    else sells += 1;
    if (i.is_published) published += 1;
    if (i.pair) pairs.add(i.pair.toUpperCase());
    const f = ideaFacts(i);
    if (f.isASetup) aSetups += 1;
    if (f.needsReview) needsReview += 1;
    if (f.followedPlan !== null) {
      planKnown += 1;
      if (f.followedPlan) planYes += 1;
    }
    if (f.resultR !== null) {
      rCount += 1;
      totalR += f.resultR;
      if (f.resultR > 0) wins += 1;
      else if (f.resultR < 0) losses += 1;
    }
  });

  return {
    count: ideas.length,
    needsReview,
    buys,
    sells,
    published,
    aSetups,
    pairs: [...pairs],
    planPct: planKnown ? Math.round((planYes / planKnown) * 100) : null,
    totalR: rCount ? Math.round(totalR * 100) / 100 : null,
    rCount,
    wins,
    losses,
  };
};

// -> [{ key, label, ideas, summary }] newest week first
export const groupByWeek = (ideas) => {
  const map = new Map();
  ideas.forEach((i) => {
    const key = weekStartOf(i.date);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(i);
  });
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => (a.date < b.date ? -1 : 1));
      return { key, label: weekLabel(key), ideas: sorted, summary: summarizeWeek(sorted) };
    });
};
