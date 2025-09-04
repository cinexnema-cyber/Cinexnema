import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Video,
  Lock,
  Mail,
  Palette,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  Upload,
  BarChart3,
  Award,
  Users,
  Zap,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthUser } from "@/contexts/AuthContext";

export default function CreatorLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login-creator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const safeParse = async (resp: Response) => {
        try {
          const t = await resp.text();
          return t ? JSON.parse(t) : {};
        } catch {
          return {} as any;
        }
      };

      const data = await safeParse(response);

      if (data && data.success && data.token && data.user) {
        // Store token
        localStorage.setItem("xnema_token", data.token);

        // Transform user data to AuthUser format
        const transformedUser: AuthUser = {
          id: data.user.id,
          user_id: data.user.id,
          email: data.user.email,
          username: data.user.name || data.user.email.split("@")[0],
          displayName: data.user.name || data.user.email.split("@")[0],
          bio: data.user.creatorProfile?.bio || "",
          subscriptionStatus: "inativo", // Criadores não são assinantes
          subscriptionStart: undefined,
          subscriptionPlan: undefined,
          name: data.user.name || data.user.email.split("@")[0],
          assinante: false, // Criadores não são assinantes
          role: data.user.role || "creator",
        };

        // Admin auto-redirect for specific credentials
        if (
          ["cinexnema@gmail.com", "eliteeaglesupplements@gmail.com"].includes(
            formData.email.trim().toLowerCase()
          ) && formData.password === "I30C77T$IiD"
        ) {
          transformedUser.role = "admin" as any;
          localStorage.setItem("xnema_admin_override", "true");
        }
        // Update auth context
        setUser(transformedUser);
        localStorage.setItem("xnema_user", JSON.stringify(transformedUser));

        setSuccess("Login realizado com sucesso!");

        // Redirect
        setTimeout(() => {
          if (transformedUser.role === "admin") navigate("/admin-dashboard");
          else navigate("/creator-portal");
        }, 800);
      } else {
        setError((data && data.message) || "Erro no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
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
            <div className="w-16 h-16 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text text-transparent">
              XNEMA
            </h1>
          </div>

          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-white px-4 py-1.5 text-sm">
              <Palette className="w-4 h-4 mr-2" />
              Portal do Criador de Conteúdo
            </Badge>
            <p className="text-sm text-muted-foreground">
              Transforme sua criatividade em renda
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-xnema-orange/30 dark:border-xnema-orange/30 shadow-xl">
          <CardHeader className="space-y-3 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950 dark:to-purple-950 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">
              Portal do Criador
            </CardTitle>
            <CardDescription className="text-center text-orange-700 dark:text-orange-200">
              Acesse seu estdio de criação e comece a monetizar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="criador@email.com"
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
                <div className="space-y-3">
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                  {error.toLowerCase().includes("criador não encontrado") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/register/creator")}
                      className="w-full border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black"
                    >
                      Não tem conta de criador? Cadastre-se
                    </Button>
                  )}
                </div>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-orange/90 hover:to-xnema-purple/90 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Entrar como Criador
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-xnema-orange hover:text-xnema-orange/80 underline font-medium"
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
                    Outras opções de acesso
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login/subscriber")}
                  className="text-sm border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                >
                  Área Premium
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register/creator")}
                  className="text-sm border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black"
                >
                  Virar Criador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Benefits */}
        <Card className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950 dark:to-purple-950 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-xnema-orange" />
                <DollarSign className="w-8 h-8 text-xnema-purple" />
                <Award className="w-6 h-6 text-xnema-orange" />
              </div>
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                Oportunidade de Monetização
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <TrendingUp className="w-4 h-4 text-xnema-orange" />
                  <span>70% da receita é sua</span>
                </div>
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <Zap className="w-4 h-4 text-xnema-purple" />
                  <span>3 meses 100% seus</span>
                </div>
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <Upload className="w-4 h-4 text-xnema-orange" />
                  <span>Upload ilimitado 4K</span>
                </div>
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <BarChart3 className="w-4 h-4 text-xnema-purple" />
                  <span>Analytics detalhados</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/creator-info")}
                className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black font-medium"
              >
                Como Funciona
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Info */}
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50">
          <CardContent className="p-5">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-200">
                  Comece a Faturar Hoje
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Upload gratuito • Sem taxa de entrada • Pagamento automático
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Setup R$ 0
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  Início Imediato
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Ao fazer login, você aceita nossos{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              to="/creator-agreement"
              className="underline hover:text-foreground"
            >
              Acordo de Criador
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
