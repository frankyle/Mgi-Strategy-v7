// grading.js
// Pure grading logic — no side effects, so it can be reused for the live
// preview in the form AND called again server-side/in tests if needed.

export const HTF_REACTIONS = [
  { value: "sweep_reject", label: "Liquidity sweep + reject" },
  { value: "engulf", label: "Engulfing at level" },
  { value: "wick_reject", label: "Wick rejection" },
  { value: "none", label: "No clean reaction" },
];

export const LEVEL_STATUS = ["Untested", "Retested", "Broken"];

// Phase 2 (LTF) — ICT weekly bias + session liquidity grab model.
// Weekly bias: are we trading above the weekly open ("blue side", buys
// only) or below it ("red side", sells only)? The LTF trigger itself is a
// liquidity grab (a sweep-and-reject of a session high/low) that lines up
// with that bias — Asian session, New York session, or both.
export const WEEKLY_BIAS_OPTIONS = [
  { value: "blue", label: "Above Weekly Open — Blue / Buy Side" },
  { value: "red", label: "Below Weekly Open — Red / Sell Side" },
];

export const SESSION_GRAB_OPTIONS = [
  { value: "none", label: "No session liquidity grab yet" },
  { value: "asian", label: "Asian session Liquidity Grab" },
  { value: "newyork", label: "London session Liquidity Grab" },
  { value: "both", label: "Asian + London Liquidity Grab" },
];

function weeklyBiasToDirection(bias) {
  if (bias === "blue") return "long";
  if (bias === "red") return "short";
  return null;
}

export function gradeSetup({
  htfReaction,
  htfDirection,
  ltfWeeklyBias,
  ltfSessionGrab,
  ltfDirection,
}) {
  const htfConfirmed = htfReaction !== "none";

  // LTF trigger = weekly bias (above/below weekly open) AND a session
  // liquidity grab (Asian and/or New York) that lines up with that bias.
  // A grab that contradicts the weekly bias (e.g. a low sweep while on the
  // red/sell side) doesn't count as a valid trigger.
  const biasDirection = weeklyBiasToDirection(ltfWeeklyBias);
  const ltfConfirmed =
    Boolean(ltfWeeklyBias) &&
    ltfSessionGrab &&
    ltfSessionGrab !== "none" &&
    biasDirection === ltfDirection;

  const directionsAgree = htfDirection === ltfDirection;

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
