import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextReal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  Mail,
  Crown,
  AlertCircle,
  Loader2,
  Shield,
  CheckCircle,
  Play,
  Star,
  Eye,
  Download,
  Smartphone,
} from "lucide-react";

export default function SubscriberLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔐 Tentando login...");

      const ok = await login(formData.email.trim(), formData.password);

      if (ok) {
        const stored = localStorage.getItem("xnema_user");
        const u = stored ? JSON.parse(stored) : null;
        if (!u) {
          setError("Falha ao carregar usuário após login");
          return;
        }
        setSuccess(`Bem-vindo, ${u.name || u.email}!`);

        // Redirecionar baseado no status da assinatura
        setTimeout(() => {
          if (u.role === "admin") {
            navigate("/video-approval");
          } else if (u.isPremium || u.assinante) {
            navigate("/dashboard");
          } else {
            navigate("/pricing"); // Usuário não tem assinatura ativa
          }
        }, 800);
      } else {
        // Se falhar, verificar se é conta filho
        try {
          const resp = await fetch(`/api/child_accounts/check?email=${encodeURIComponent(formData.email.trim())}`);
          const j = await resp.json();
          if (j?.is_child) {
            navigate("/child-login");
            return;
          }
        } catch {}
        setError("Email ou senha incorretos");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              XNEMA
            </h1>
          </div>

          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 text-sm">
              <Crown className="w-4 h-4 mr-2" />
              Área do Assinante
            </Badge>
            <p className="text-sm text-muted-foreground">
              Entre e aproveite conteúdo premium sem limites
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100">
              Entrar na Área Premium
            </CardTitle>
            <CardDescription className="text-center text-blue-700 dark:text-blue-200">
              Acesse sua conta para continuar assistindo
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Entrar na Área Premium
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    Outras opções
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/register-subscriber")}
                  className="text-sm border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                >
                  Criar Conta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/creator-login")}
                  className="text-sm border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                >
                  Área do Criador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-blue-500" />
                <Crown className="w-8 h-8 text-blue-600" />
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Experiência Premium Completa
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Play className="w-4 h-4 text-blue-500" />
                  <span>Streaming 4K Ultra HD</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Catálogo completo</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Download offline</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>Múltiplos dispositivos</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Ainda não é assinante?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/pricing")}
                  className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-medium"
                >
                  Ver Planos Premium
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Selection */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/login-select")}
            className="text-sm"
          >
            ← Voltar para Seleção
          </Button>
        </div>
      </div>
    </div>
  );
}
