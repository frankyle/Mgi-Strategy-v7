// TradersIdeaService.js
import { supabase } from "../../supabaseClient";

const BUCKET = "trader-images";

// Enhanced formatError to handle Supabase Postgrest errors (code, details)
const formatError = (error) => {
  console.error("Service Error:", error);
  let message = "Unknown error occurred.";
  
  if (error && typeof error === "object") {
    // Supabase error object structure (PostgrestError)
    if (error.message) {
      message = error.message;
    }
    if (error.details) {
      message += ` Details: ${error.details}`;
    }
    if (error.code) {
      message += ` [Code: ${error.code}]`;
    }
  } else if (typeof error === "string") {
    message = error;
  }
  
  return {
    success: false,
    error: { message },
  };
};

const getAuthUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const uploadIdeaImage = async (file, path) => {
  if (!file) return formatError("No file provided for upload.");

  try {
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (uploadError) return formatError(uploadError);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!urlData.publicUrl) return formatError("Failed to retrieve public URL after upload.");
    
    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return formatError(err);
  }
};

export const deleteIdeaImage = async (url) => {
  if (!url) return { success: true };
  try {
    let cleanPath = null;
    const publicMarker = "/object/public/";
    const idx = url.indexOf(publicMarker);

    if (idx !== -1) {
      const after = url.substring(idx + publicMarker.length);
      if (after.startsWith(`${BUCKET}/`)) {
        cleanPath = after.substring(BUCKET.length + 1);
      } else {
        const parts = after.split("/");
        parts.shift(); // Remove bucket name
        cleanPath = parts.join("/");
      }
    }

    if (!cleanPath) {
      // Fallback for paths that don't perfectly match the expected structure
      const fallback = url.split(`${BUCKET}/`)[1];
      if (fallback) cleanPath = fallback;
    }

    if (!cleanPath) {
        console.warn("Could not determine storage path for deletion:", url);
        return { success: true }; // Treat as success if path can't be found
    }

    const { error } = await supabase.storage.from(BUCKET).remove([cleanPath]);
    if (error) {
        // Log the error but continue, as deletion of the idea itself is more important
        console.error("Storage deletion failed, continuing operation:", formatError(error).error.message);
    }
    return { success: true };
  } catch (err) {
    return formatError(err);
  }
};

export const getIdeas = async () => {
  try {
    const user = await getAuthUser();
    if (!user) return formatError("Authentication required: User not logged in.");

    const { data, error } = await supabase
      .from("trader_ideas")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) return formatError(error);
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

export const addIdea = async (idea) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return formatError("Authentication required: User not logged in.");

    if (!idea.date || !idea.pair) return formatError("Missing required fields: Date and Pair must be provided.");

    const payload = {
      date: idea.date,
      pair: idea.pair,
      signal: idea.signal || "Buy",
      day: new Date(idea.date).toLocaleDateString("en-US", { weekday: "long" }),
      user_id: user.id,
    };

    const imageFields = [
      "monday_image",
      "tuesday_image",
      "wednesday_image",
      "thursday_image",
      "friday_image",
      "saturday_image",
      "sunday_image",
    ];

    for (const field of imageFields) {
      const fileOrUrl = idea[field];
      if (!fileOrUrl) continue;

      if (fileOrUrl instanceof File || (typeof Blob !== "undefined" && fileOrUrl instanceof Blob)) {
        let ext = "jpg";
        if (fileOrUrl.name) {
          const parts = fileOrUrl.name.split(".");
          if (parts.length > 1) ext = parts.pop();
        }
        
        // Generate a unique path for the file
        const path = `${user.id}/${idea.pair.toUpperCase()}_${Date.now()}_${field}.${ext}`;
        const uploadRes = await uploadIdeaImage(fileOrUrl, path);
        
        if (!uploadRes.success) {
            // Include file name in error for debugging
            return formatError(`Failed to upload image ${field} (${fileOrUrl.name}): ${uploadRes.error.message}`);
        }
        payload[field] = uploadRes.url;
      } else if (typeof fileOrUrl === "string") {
        payload[field] = fileOrUrl;
      }
    }

    const { data, error } = await supabase
      .from("trader_ideas")
      .insert([payload])
      .select();

    if (error) return formatError(error);
    if (!data || data.length === 0) return formatError("Insert operation returned no data.");
    
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

export const updateIdea = async (id, updatedFields = {}, existingIdea = {}) => {
  try {
    const user = await getAuthUser();
    if (!user) return formatError("Authentication required: User not logged in.");

    if (updatedFields.date) {
      updatedFields.day = new Date(updatedFields.date).toLocaleDateString("en-US", { weekday: "long" });
    }
    
    if (updatedFields.pair !== undefined && !updatedFields.pair.trim()) {
        return formatError("Pair field cannot be empty.");
    }

    const imageFields = [
      "monday_image",
      "tuesday_image",
      "wednesday_image",
      "thursday_image",
      "friday_image",
      "saturday_image",
      "sunday_image",
    ];

    for (const field of imageFields) {
      const newVal = updatedFields[field];
      const oldVal = existingIdea[field];

      // Case 1: New File provided (upload new image, delete old)
      if (newVal && (newVal instanceof File || (typeof Blob !== "undefined" && newVal instanceof Blob))) {
        let ext = "jpg";
        if (newVal.name) {
          const parts = newVal.name.split(".");
          if (parts.length > 1) ext = parts.pop();
        }
        
        const pairName = updatedFields.pair || existingIdea.pair || "UNKNOWN";
        const path = `${user.id}/${pairName.toUpperCase()}_${Date.now()}_${field}.${ext}`;
        const uploadRes = await uploadIdeaImage(newVal, path);
        
        if (!uploadRes.success) {
             return formatError(`Failed to upload new image ${field} (${newVal.name}): ${uploadRes.error.message}`);
        }

        updatedFields[field] = uploadRes.url;

        // Delete the old image if it exists and is different
        if (oldVal && typeof oldVal === "string" && oldVal !== uploadRes.url) {
          await deleteIdeaImage(oldVal);
        }

        continue;
      }

      // Case 2: Explicitly set to null (delete old image)
      if (newVal === null && oldVal) {
        await deleteIdeaImage(oldVal);
        // The field is already set to null in updatedFields, which is correct for database update
        continue;
      }

      // Case 3: Image URL (string) provided - do nothing, as it's the old URL or a new one not needing upload
      if (typeof newVal === "string") continue;

      // Case 4: If undefined, remove from update payload to avoid overwriting with null/undefined accidentally
      if (newVal === undefined) delete updatedFields[field];
    }

    if (Object.keys(updatedFields).length === 0) {
        return formatError("No fields provided for update.");
    }

    const { data, error } = await supabase.from("trader_ideas").update(updatedFields).eq("id", id).select();
    if (error) return formatError(error);
    if (!data || data.length === 0) return formatError("Update operation returned no data.");
    
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

export const deleteIdeaById = async (ideaOrId) => {
  try {
    let idea = null;
    let ideaId = (typeof ideaOrId === "object") ? ideaOrId.id : ideaOrId;

    if (typeof ideaOrId === "object") {
      idea = ideaOrId;
    } else {
      const { data, error } = await supabase.from("trader_ideas").select("*").eq("id", ideaId).single();
      if (error) return formatError(error);
      idea = data;
    }

    if (!idea) return formatError({ message: `Idea with ID ${ideaId} not found.` });

    const imageFields = [
      "monday_image",
      "tuesday_image",
      "wednesday_image",
      "thursday_image",
      "friday_image",
      "saturday_image",
      "sunday_image",
    ];

    // Delete all associated images
    for (const field of imageFields) {
      if (idea[field]) await deleteIdeaImage(idea[field]);
    }

    // Delete the database record
    const { error } = await supabase.from("trader_ideas").delete().eq("id", idea.id);
    if (error) return formatError(error);
    
    return { success: true };
  } catch (err) {
    return formatError(err);
  }
};