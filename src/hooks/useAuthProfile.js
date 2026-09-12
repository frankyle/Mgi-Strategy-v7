import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Single source of truth for "who is signed in and are they admin?" — used
// by ProtectedRoute (route gating), AppSidebar (which menu items to show),
// and DashboardLayout (header). Replaces three separate copies of the same
// supabase.auth.getUser()/onAuthStateChange wiring that used to live in
// each of those files.
export function useAuthProfile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (currentSession) => {
      if (!active) return;
      setSession(currentSession);
      const user = currentSession?.user;

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role")
        .eq("id", user.id)
        .single();

      if (!active) return;

      if (error) {
        // Most likely the profiles_role_migration.sql hasn't been run yet,
        // or the trigger hasn't created this row for a brand-new signup —
        // fall back to "user" rather than blocking the whole app.
        setProfile({ id: user.id, role: "user" });
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => loadProfile(session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setLoading(true);
      loadProfile(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role || "user",
    // Role-based gating turned off at Frank's request: the `profiles.role`
    // lookup was silently falling back to "user" for reasons that were hard
    // to pin down remotely (missing row / RLS / stale profile), so every
    // signed-in account sees the full dashboard for now. To bring the
    // admin/regular-member split back later, restore the line below and
    // fix whatever the diagnostic queries in the chat turned up:
    //   isAdmin: profile?.role === "admin",
    isAdmin: true,
    loading,
  };
}
