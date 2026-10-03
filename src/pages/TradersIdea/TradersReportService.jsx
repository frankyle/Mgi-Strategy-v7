// TradersReportService.jsx
// Weekly Report storage. Sending an idea to the report MOVES it:
// copy into trader_idea_reports, then remove it from trader_ideas.
// Chart images are NOT deleted — the report row keeps pointing at them.
import { supabase } from "../../supabaseClient";
import { deleteIdeaImage } from "./TradersIdeaService";

const fail = (error) => {
  console.error("Report Service Error:", error);
  const message =
    typeof error === "string" ? error : error?.message || "Unknown error occurred.";
  return { success: false, error: { message } };
};

const IMAGE_KEYS = [
  "monday_image", "tuesday_image", "wednesday_image", "thursday_image",
  "friday_image", "saturday_image", "sunday_image",
];

export const sendIdeaToReport = async (idea) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail("Authentication required: User not logged in.");

    const { data: inserted, error: insErr } = await supabase
      .from("trader_idea_reports")
      .insert({
        user_id: user.id,
        original_id: String(idea.id),
        date: idea.date,
        pair: idea.pair,
        signal: idea.signal || null,
        data: idea,
      })
      .select("id")
      .single();
    if (insErr) return fail(insErr);

    const { error: delErr } = await supabase
      .from("trader_ideas")
      .delete()
      .eq("id", idea.id)
      .eq("user_id", user.id);

    if (delErr) {
      // couldn't remove the original — undo the copy so nothing is duplicated
      await supabase.from("trader_idea_reports").delete().eq("id", inserted.id);
      return fail(delErr);
    }
    return { success: true };
  } catch (err) {
    return fail(err);
  }
};

export const getReports = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fail("Authentication required: User not logged in.");

    const { data, error } = await supabase
      .from("trader_idea_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (error) return fail(error);

    // flatten the saved copy so the report can read it like a normal idea
    const rows = (data || []).map((r) => ({
      ...(r.data || {}),
      id: r.id,
      date: r.date,
      pair: r.pair,
      signal: r.signal,
      reported_at: r.reported_at,
    }));
    return { success: true, data: rows };
  } catch (err) {
    return fail(err);
  }
};

// Permanently delete a report row (and its chart images)
export const deleteReport = async (report) => {
  try {
    const { error } = await supabase.from("trader_idea_reports").delete().eq("id", report.id);
    if (error) return fail(error);
    await Promise.all(IMAGE_KEYS.map((k) => deleteIdeaImage(report[k])));
    return { success: true };
  } catch (err) {
    return fail(err);
  }
};

// Save the review fields (A-checks, mood, plan, result, notes) of a report row.
// They live inside data.journal, so we merge into the saved copy of the idea.
export const updateReportJournal = async (reportId, journal) => {
  try {
    const { data: row, error: readErr } = await supabase
      .from("trader_idea_reports")
      .select("data")
      .eq("id", reportId)
      .single();
    if (readErr) return fail(readErr);

    const { error } = await supabase
      .from("trader_idea_reports")
      .update({ data: { ...(row?.data || {}), journal } })
      .eq("id", reportId);
    if (error) return fail(error);
    return { success: true };
  } catch (err) {
    return fail(err);
  }
};
