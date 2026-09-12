// FundedTradeService.js
import { supabase } from "../../supabaseClient";

// Helper to format Supabase errors
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

// Fetch all trades
export const getTrades = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) return formatError(userError);

  if (!user) {
    return {
      success: false,
      error: {
        message: "User not logged in",
        details: null,
        hint: "Make sure authentication is working",
        code: "NO_USER",
        status: 401,
      }
    };
  }

  const { data, error } = await supabase
    .from("funded_trades")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) return formatError(error);

  return { success: true, data };
};

// Add new trade
export const addTrade = async (trade) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) return formatError(userError);
  if (!user) {
    return {
      success: false,
      error: {
        message: "User not logged in",
        hint: "User must be authenticated",
        code: "NO_USER",
        status: 401,
      }
    };
  }

  const payload = {
    ...trade,
    user_id: user.id,
    day: new Date(trade.date).toLocaleDateString("en-US", { weekday: "long" }),
  };

  const { data, error } = await supabase
    .from("funded_trades")
    .insert([payload])
    .select();

  if (error) return formatError(error);

  return { success: true, data };
};

// Update trade
export const updateTrade = async (id, updatedFields) => {
  const { data, error } = await supabase
    .from("funded_trades")
    .update(updatedFields)
    .eq("id", id)
    .select();

  if (error) return formatError(error);

  return { success: true, data };
};

// Delete trade
export const deleteTradeById = async (id) => {
  const { error } = await supabase
    .from("funded_trades")
    .delete()
    .eq("id", id);

  if (error) return formatError(error);

  return { success: true };
};
