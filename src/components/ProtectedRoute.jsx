import { useAuth } from "../context/AuthenticationContext.jsx";
import { Navigate } from "react-router-dom";
import Spinner from "./Spinner.jsx";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // while we check session, show nothing or a spinner
  if (loading){
     return <Spinner message="Checking your session..."/>;
  }

  // not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // role check
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (
      !allowed
        .map((r) => String(r).toUpperCase())
        .includes(String(user.role).toUpperCase())
    ) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
