import { Navigate } from "react-router-dom";
import { useAuthProfile } from "../../hooks/useAuthProfile";

// adminOnly=true additionally requires role === "admin" — anyone signed
// in but not an admin gets sent to /dashboard/signals instead of the page
// they asked for, rather than being logged out or shown an error.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { session, isAdmin, loading } = useAuthProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard/signals" replace />;
  }

  return children;
}
