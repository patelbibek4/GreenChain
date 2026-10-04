import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, isLoggedIn } = useAuth();

  // User is not logged in
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Safely determine the user's role
  const userRole =
    user.role ||
    user.user_role ||
    user.user?.role ||
    "";

  // Check role permission
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
}

export default ProtectedRoute;