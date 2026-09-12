// api/analyze-setup.js
//
// Frank uploads a chart screenshot (or two) in SetupMatchGraderForm.
// This function sends them to Claude (Anthropic's AI, with vision) and
// gets back the exact field values the form needs, plus a plain
// buy/sell/wait call and what to watch for next.
//
// Required Vercel env var:
//   ANTHROPIC_API_KEY  - from console.anthropic.com > API Keys
//                         (server-side only — never exposed to the browser)

const ANTHROPIC_MODEL = "claude-sonnet-5";

// This mirrors the exact dropdown/toggle values in SetupMatchGraderForm.jsx
// and grading.js — the AI is told to only ever use these strings, so
// whatever comes back can be dropped straight into form state.
const SYSTEM_PROMPT = `You are reading trading chart screenshots for a personal trading journal that follows a specific two-phase ICT-style strategy. You must respond with ONLY a single JSON object — no markdown fences, no commentary before or after.

PHASE 1 (Higher Timeframe reversal — Daily/4H chart):
- htf_level_type: "Support" or "Resistance" — which kind of level is in play
- htf_level_status: one of "Untested", "Retested", "Broken"
- htf_reaction: one of "sweep_reject" (liquidity sweep then reject), "engulf" (engulfing candle at the level), "wick_reject" (wick rejection), "none" (no clean reaction)
- htf_direction: "long" or "short" — the direction implied by the HTF reaction, or null if no HTF chart was given or no clean reaction

PHASE 2 (Lower Timeframe continuation — weekly bias + session liquidity grab):
- ltf_weekly_bias: "blue" (price trading above the weekly open — only buys valid) or "red" (price trading below the weekly open — only sells valid), or null if not visible/not provided
- ltf_session_grab: one of "none", "asian" (Asian session high/low swept and rejected), "newyork" (New York session swept and rejected), "both"
- ltf_fvg_tagged: true or false — whether a fair value gap was tapped as part of the move (this is informational only, it doesn't affect the trade call)
- ltf_direction: "long" or "short", or null if not visible/not provided — must line up with weekly bias (blue=long, red=short) to be a valid trigger

FINAL CALL:
- recommendation: "buy", "sell", or "wait" — "wait" whenever Phase 1 and Phase 2 aren't BOTH confirmed and pointing the same direction, or whenever a required chart wasn't provided
- watch_for: a short, concrete sentence describing exactly what still needs to happen on the lower timeframe before entry (e.g. "Wait for a sweep of the Asian session low with a clean rejection back above [level], confirming the blue/buy bias."). Use null only if recommendation is "buy" or "sell" with both phases already confirmed.
- notes: 1-2 sentences explaining your read of the chart(s) in plain language

Only fill in fields you can actually see evidence for in the image(s) provided. If a phase's chart wasn't included, set that phase's fields to null (or "none" for the reaction/session-grab fields) and address it in watch_for instead of guessing.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY env var.");
    res.status(500).json({ error: "Server misconfigured. Check Vercel env vars." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Body was not valid JSON." });
      return;
    }
  }

  const { pair, htf_image_base64, htf_image_media_type, ltf_image_base64, ltf_image_media_type } = body || {};

  if (!htf_image_base64 && !ltf_image_base64) {
    res.status(400).json({ error: "Provide at least one chart image (HTF or LTF)." });
    return;
  }

  const content = [
    {
      type: "text",
      text: `Pair: ${pair || "unknown"}. Analyze the chart screenshot(s) below according to the system instructions and return the JSON object.`,
    },
  ];

  if (htf_image_base64) {
    content.push({ type: "text", text: "This is the Phase 1 (HTF, Daily/4H) chart:" });
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: htf_image_media_type || "image/png",
        data: htf_image_base64,
      },
    });
  }

  if (ltf_image_base64) {
    content.push({ type: "text", text: "This is the Phase 2 (LTF) chart:" });
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: ltf_image_media_type || "image/png",
        data: ltf_image_base64,
      },
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      res.status(502).json({ error: "AI analysis failed. Try again." });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) {
      res.status(502).json({ error: "AI returned no text response." });
      return;
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI JSON:", cleaned);
      res.status(502).json({ error: "AI response wasn't valid JSON." });
      return;
    }

    res.status(200).json({ success: true, analysis: parsed });
  } catch (err) {
    console.error("Request to Anthropic failed:", err);
    res.status(500).json({ error: "Could not reach AI service." });
  }
};
