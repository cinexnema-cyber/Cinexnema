import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props { children: React.ReactNode }

export default function CreatorProtected({ children }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const token = (typeof window !== "undefined") ? (localStorage.getItem("xnema_token") || localStorage.getItem("token")) : null;

  if (isLoading) return null;

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role;
  if (role !== "creator" && role !== "admin") {
    return <Navigate to="/not-creator" replace />;
  }

  return <>{children}</>;
}
