import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// IMPORTANT: create-react-app bakes REACT_APP_* variables in at BUILD time, not
// runtime. If these are missing, it almost always means the Vercel project's
// Environment Variables (Project Settings > Environment Variables) don't have
// REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY set for the environment
// that just deployed (Production/Preview) — and Vercel needs a fresh deploy
// AFTER adding them, since the old build already has them baked in as undefined.
if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    "Supabase URL or ANON KEY is missing. If you're seeing this locally, check your .env file. " +
    "If you're seeing this on Vercel, add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY " +
    "in Project Settings > Environment Variables, then trigger a new deploy.";
  console.error(msg);
  // Throwing here (instead of letting createClient throw its own cryptic "Invalid URL"
  // error) gives the ErrorBoundary in index.js something readable to display, instead
  // of a silent blank page.
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
