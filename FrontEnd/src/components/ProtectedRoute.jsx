import { Navigate, useLocation } from "react-router-dom";
import { getUser, isAuthenticated } from "../auth/session";

const ProtectedRoute = ({ allowedRoles, children }) => {
  // ❌ AUTHENTICATION BYPASSED FOR DEVELOPMENT
  // Allow access to protected routes without authentication
  /*
  const location = useLocation();
  const user = getUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }
  */

  return children;
};

export default ProtectedRoute;
