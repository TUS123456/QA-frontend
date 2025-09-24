// routes/ProtectedRoutes.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // must have BOTH user & token
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
