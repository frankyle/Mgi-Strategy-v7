import { supabase } from "../../supabaseClient";

const SETUP_BUCKET = "mgi-images"; // reusing the same Storage bucket as MGI Strategy

const formatError = (error) => ({
  success: false,
  error: {
    message: error?.message || "Unknown error",
    details: error?.details || null,
    hint: error?.hint || null,
    code: error?.code || null,
    status: error?.status || 500,
  },
});

export const getAuthUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
};

// Upload a chart screenshot to Supabase Storage and return its public URL.
// IMPORTANT: path must start with the user's own auth UID — the bucket's RLS
// policy checks that the first path segment matches auth.uid(), same as the
// pattern used by MGI Strategy's image uploads.
export const uploadSetupImage = async (file, path) => {
  if (!file) return formatError("No file provided for upload.");
  try {
    const { error: uploadError } = await supabase.storage
      .from(SETUP_BUCKET)
      .upload(path, file, { upsert: true });
    if (uploadError) return formatError(uploadError);

    const { data: urlData } = supabase.storage.from(SETUP_BUCKET).getPublicUrl(path);
    if (!urlData.publicUrl) return formatError("Failed to retrieve public URL after upload.");

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return formatError(err);
  }
};

// Best-effort delete — used when a setup row (and its images) is removed.
export const deleteSetupImage = async (url) => {
  if (!url) return { success: true };
  try {
    const publicMarker = "/object/public/";
    const idx = url.indexOf(publicMarker);
    if (idx === -1) return { success: true };
    const after = url.substring(idx + publicMarker.length);
    if (!after.startsWith(`${SETUP_BUCKET}/`)) return { success: true };
    const cleanPath = after.substring(SETUP_BUCKET.length + 1);
    const { error } = await supabase.storage.from(SETUP_BUCKET).remove([cleanPath]);
    if (error) return formatError(error);
    return { success: true };
  } catch (err) {
    return formatError(err);
  }
};

// Fetch setups
export const getSetups = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) return formatError(userError);

  if (!user)
    return {
      success: false,
      error: { message: "User not logged in", code: "NO_USER", status: 401 },
    };

  const { data, error } = await supabase
    .from("setup_matches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return formatError(error);

  return { success: true, data };
};

// Add setup (grade is computed client-side by grading.js before calling this)
export const addSetup = async (setup) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) return formatError(userError);

  if (!user)
    return {
      success: false,
      error: { message: "User not logged in", code: "NO_USER", status: 401 },
    };

  const payload = { ...setup, user_id: user.id };

  const { data, error } = await supabase
    .from("setup_matches")
    .insert([payload])
    .select();

  if (error) return formatError(error);

  return { success: true, data };
};

// Fetch published setups for ANY user id — this is what the public,
// no-login /blog/:userId page calls. RLS only lets it see rows the owner
// has flipped to is_published = true, regardless of who (or whether anyone)
// is signed in.
export const getPublishedSetupsForUser = async (userId) => {
  if (!userId) return formatError("Missing user id.");

  const { data, error } = await supabase
    .from("setup_matches")
    .select("*")
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) return formatError(error);

  return { success: true, data };
};

// Publish / unpublish a setup to the public Trade Blog.
// caption is the optional "here's the idea" note friends will read alongside the charts.
export const setSetupPublished = async (id, isPublished, caption = null) => {
  const payload = {
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };
  if (caption !== null) payload.caption = caption;

  const { data, error } = await supabase
    .from("setup_matches")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) return formatError(error);

  return { success: true, data };
};

// Attach how the trade actually played out — win/loss/breakeven, a result
// screenshot, and a short note. Called once mid-week, again at week's end,
// or however many times the user wants to update it.
export const updateSetupOutcome = async (id, { status, notes, imageUrl }) => {
  const payload = {
    outcome_status: status,
    outcome_notes: notes ?? null,
    outcome_updated_at: new Date().toISOString(),
  };
  if (imageUrl !== undefined) payload.outcome_image_url = imageUrl;

  const { data, error } = await supabase
    .from("setup_matches")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) return formatError(error);

  return { success: true, data };
};

// Delete setup
export const deleteSetupById = async (id) => {
  const { error } = await supabase.from("setup_matches").delete().eq("id", id);

  if (error) return formatError(error);

  return { success: true };
};
