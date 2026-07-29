import { Navigate, useLocation } from "react-router-dom";

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * After login, they are sent back to the page they tried to visit.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
