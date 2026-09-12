// api/webhook/setup-match.js
//
// Receives a TradingView alert webhook and logs it straight into the
// SetupMatchGrader table (public.setup_matches) using the Supabase
// service role key — so it works with NO logged-in browser session.
//
// Deploys automatically as a Vercel Serverless Function because it lives
// under /api at the repo root. No changes needed to the CRA build itself.
//
// Required Vercel env vars (Project Settings > Environment Variables).
// IMPORTANT: do NOT prefix these with REACT_APP_ — that would bake them
// into the client bundle and leak the service role key to the browser.
//   SUPABASE_URL                 - same value as REACT_APP_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    - Supabase Project Settings > API > service_role secret
//   TRADINGVIEW_WEBHOOK_SECRET   - a random string you make up, shared with your Pine alert
//   MGI_JOURNAL_USER_ID          - your own auth.users UUID (Supabase > Authentication > Users)

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET;
const journalUserId = process.env.MGI_JOURNAL_USER_ID;

// Mirrors src/pages/SetupMatchGrader/grading.js exactly, so an alert-logged
// row gets the same grade a manual entry through the UI would get.
function weeklyBiasToDirection(bias) {
  if (bias === "blue") return "long";
  if (bias === "red") return "short";
  return null;
}

function gradeSetup({ htfReaction, htfDirection, ltfWeeklyBias, ltfSessionGrab, ltfDirection }) {
  const htfConfirmed = htfReaction !== "none";

  const biasDirection = weeklyBiasToDirection(ltfWeeklyBias);
  const ltfConfirmed =
    Boolean(ltfWeeklyBias) &&
    ltfSessionGrab &&
    ltfSessionGrab !== "none" &&
    biasDirection === ltfDirection;

  const directionsAgree = htfDirection === ltfDirection;

  if (htfConfirmed && ltfConfirmed && directionsAgree) return "full";
  if (htfConfirmed && ltfConfirmed && !directionsAgree) return "none";
  if (htfConfirmed || ltfConfirmed) return "partial";
  return "none";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  if (!supabaseUrl || !supabaseServiceKey || !webhookSecret || !journalUserId) {
    console.error(
      "Missing one of SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / TRADINGVIEW_WEBHOOK_SECRET / MGI_JOURNAL_USER_ID env vars."
    );
    res.status(500).json({ error: "Server misconfigured. Check Vercel env vars." });
    return;
  }

  // TradingView sends the alert message body as raw text with
  // Content-Type: text/plain, so it may arrive unparsed.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Body was not valid JSON." });
      return;
    }
  }

  if (!body || body.secret !== webhookSecret) {
    res.status(401).json({ error: "Invalid or missing secret." });
    return;
  }

  const {
    pair,
    htf_timeframe,
    htf_level_type,
    htf_level_status,
    htf_reaction,
    htf_direction,
    ltf_direction,
    ltf_weekly_bias,
    ltf_session_grab = "none",
    ltf_structure_break = false,
    ltf_ema200_reclaim = false,
    ltf_fvg_tagged = false,
    htf_chart_url = null,
    ltf_chart_url = null,
  } = body;

  const required = { pair, htf_timeframe, htf_level_type, htf_level_status, htf_reaction, htf_direction, ltf_direction };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const grade = gradeSetup({
    htfReaction: htf_reaction,
    htfDirection: htf_direction,
    ltfWeeklyBias: ltf_weekly_bias,
    ltfSessionGrab: ltf_session_grab,
    ltfDirection: ltf_direction,
  });

  const row = {
    user_id: journalUserId,
    pair,
    htf_timeframe,
    htf_level_type,
    htf_level_status,
    htf_reaction,
    htf_direction,
    ltf_direction,
    ltf_weekly_bias,
    ltf_session_grab,
    ltf_structure_break,
    ltf_ema200_reclaim,
    ltf_fvg_tagged,
    htf_chart_url,
    ltf_chart_url,
    grade,
    source: "tradingview_alert",
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.from("setup_matches").insert([row]).select();

  if (error) {
    console.error("Supabase insert failed:", error);
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true, data });
};
