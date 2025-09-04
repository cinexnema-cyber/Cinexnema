import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Component que redireciona para o dashboard correto baseado no role do usuário
 */
export function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Usuário não logado - redirecionar para página inicial
      navigate("/");
      return;
    }

    // Redirecionar baseado no role
    switch (user.role) {
      case "admin":
        navigate("/admin-dashboard");
        break;

      case "creator":
        navigate("/creator-portal");
        break;

      case "premium":
      case "subscriber":
        if (user.isPremium && user.subscriptionStatus === "active") {
          navigate("/subscriber-dashboard");
        } else {
          // Assinante não premium - redirecionar para preços
          navigate("/pricing");
        }
        break;

      case "visitor":
      default:
        navigate("/visitor-dashboard");
        break;
    }
  }, [user, isLoading, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Usuário não encontrado</p>
          <p className="text-sm">Redirecionando para página inicial...</p>
        </div>
      </div>
    );
  }

  // Default return (should not reach here due to useEffect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Configurando dashboard...</p>
      </div>
    </div>
  );
}

export default RoleBasedDashboard;
