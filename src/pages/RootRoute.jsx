import { Navigate } from "react-router-dom";
import { useAuthProfile } from "../hooks/useAuthProfile";
import PublicLayout from "../layouts/PublicLayout";
import Landing from "./Landing";

// "/" is the one URL that means two different things depending on who's
// looking at it:
//  - signed out  -> public MGI Strategy homepage (marketing chrome, no login wall)
//  - signed in   -> straight into the app at /dashboard
// Everything under /dashboard still requires auth (see ProtectedRoute there);
// this only decides what happens at the bare root URL itself.
export default function RootRoute() {
  const { session, loading } = useAuthProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400 bg-base">
        Loading...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PublicLayout>
      <Landing />
    </PublicLayout>
  );
}
