// grading.js
// Pure grading logic — no side effects, so it can be reused for the live
// preview in the form AND called again server-side/in tests if needed.
//
// STRATEGY: trade only in the London or New York session. Wait for a
// higher-timeframe (4H or 2H) FVG / IFVG to be retested, then trade the move
// in the OPPOSITE direction from the retest (bounce away from the zone).
// The 1H chart is only used to compare / confirm that same bounce.
//
// Column re-use (no database migration needed):
//   htf_timeframe     -> "4H" or "2H"
//   htf_level_type    -> "Buy FVG" | "Sell FVG" | "Buy IFVG" | "Sell IFVG"
//   htf_level_status  -> Untested / Retested / Broken
//   htf_reaction      -> how price reacted at the retest
//   ltf_session_grab  -> "london" | "newyork" | "none"   (session of the trade)
//   ltf_fvg_tagged    -> true = 1H FVG/IFVG retested and price bounced away
//   ltf_weekly_bias   -> no longer used (stays null; old rows keep blue/red)

// Buy zones are bullish (price bounces UP -> long), Sell zones bearish (short).
export const HTF_ZONE_TYPES = [
  { value: "Buy FVG", label: "Buy FVG (bullish gap)", direction: "long" },
  { value: "Sell FVG", label: "Sell FVG (bearish gap)", direction: "short" },
  { value: "Buy IFVG", label: "Buy IFVG (inverted, support)", direction: "long" },
  { value: "Sell IFVG", label: "Sell IFVG (inverted, resistance)", direction: "short" },
];

export const HTF_TIMEFRAMES = ["4H", "2H"];

export const HTF_REACTIONS = [
  { value: "sweep_reject", label: "Retested, clean bounce away" },
  { value: "engulf", label: "Engulfing candle away from zone" },
  { value: "wick_reject", label: "Wick rejection from zone" },
  { value: "none", label: "No clean reaction" },
];

export const LEVEL_STATUS = ["Untested", "Retested", "Broken"];

// Options shown in the form (only the two sessions you trade).
export const SESSION_OPTIONS = [
  { value: "none", label: "Outside London / New York — no trade" },
  { value: "london", label: "London session" },
  { value: "newyork", label: "New York session" },
];

// Full list used to display saved rows (includes labels of old logs).
export const SESSION_GRAB_OPTIONS = [
  ...SESSION_OPTIONS,
  { value: "asian", label: "Asian session (old log)" },
  { value: "both", label: "Asian + London (old log)" },
];

export function gradeSetup({
  htfLevelStatus,
  htfReaction,
  htfDirection,
  ltfSession,
  ltfBounce,
  ltfDirection,
}) {
  // Phase 1: the 4H/2H FVG/IFVG must have been RETESTED and price must have
  // reacted (moved away) from it.
  const htfConfirmed = htfLevelStatus === "Retested" && htfReaction !== "none";

  // Phase 2: only London or New York count, and the 1H zone must also have
  // been retested with price bouncing away.
  const ltfConfirmed =
    (ltfSession === "london" || ltfSession === "newyork") && Boolean(ltfBounce);

  const directionsAgree =
    Boolean(htfDirection) && Boolean(ltfDirection) && htfDirection === ltfDirection;

  if (htfConfirmed && ltfConfirmed && directionsAgree) {
    return { grade: "full", label: "Full Match" };
  }
  if (htfConfirmed && ltfConfirmed && !directionsAgree) {
    return { grade: "none", label: "No Match" };
  }
  if (htfConfirmed || ltfConfirmed) {
    return { grade: "partial", label: "Partial Match" };
  }
  return { grade: "none", label: "No Match" };
}

export const GRADE_STYLES = {
  full: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
  partial: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  none: {
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-300",
    dot: "bg-rose-500",
  },
};
