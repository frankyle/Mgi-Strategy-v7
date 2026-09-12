import { Navigate } from "react-router-dom";
import { useAuthProfile } from "../hooks/useAuthProfile";
import Dashboard from "./Dashboard";

// The "/" route needs to show different things for different roles, so it
// can't just be a plain <Route index element={<Dashboard />} /> — this
// picks the right one once we know who's signed in.
export default function HomeRoute() {
  const { isAdmin, loading } = useAuthProfile();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return isAdmin ? <Dashboard /> : <Navigate to="/dashboard/signals" replace />;
}
