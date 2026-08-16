import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireRole }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const role = user?.role?.toUpperCase();

  // Not logged in or no user data → go to login
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based guard: if a role is required and user doesn't have it
  if (requireRole && role !== requireRole.toUpperCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}