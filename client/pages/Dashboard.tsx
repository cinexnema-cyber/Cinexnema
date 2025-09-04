import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextReal";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated || !user) {
      // No user logged in - redirect to visitor dashboard
      navigate("/visitor-dashboard", { replace: true });
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case "admin":
        navigate("/admin-dashboard", { replace: true });
        break;
      case "creator":
        navigate("/creator-dashboard", { replace: true });
        break;
      case "subscriber":
        navigate("/subscriber-dashboard", { replace: true });
        break;
      case "user":
        navigate("/user-dashboard", { replace: true });
        break;
      default:
        // Fallback for any other roles
        navigate("/visitor-dashboard", { replace: true });
        break;
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Show loading while determining redirect
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <Card className="bg-xnema-surface border-gray-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-xnema-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Carregando Dashboard
              </h2>
              <p className="text-gray-400">
                Redirecionando para seu painel personalizado...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // This should never be reached due to useEffect redirects
  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
        <Card className="bg-xnema-surface border-gray-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-xnema-orange mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Redirecionando...
            </h2>
            <p className="text-gray-400">
              Preparando seu dashboard personalizado
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
