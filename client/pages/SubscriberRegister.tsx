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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Lock,
  Mail,
  Crown,
  AlertCircle,
  Loader2,
  Shield,
  Phone,
  CheckCircle,
} from "lucide-react";

export default function SubscriberRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    plan: "monthly",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validações básicas
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Nome, email e senha são obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("📝 Enviando cadastro...");

      const safeParse = async (resp: Response) => {
        try {
          const t = await resp.text();
          return t ? JSON.parse(t) : {};
        } catch {
          return {} as any;
        }
      };

      // Registrar diretamente via Supabase backend
      const sbResp = await fetch("/api/auth/register-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          plan: formData.plan,
        }),
      });
      const sb = await safeParse(sbResp);

      if (!sbResp.ok || !(sb && (sb.success === true || sb.user))) {
        setError(sb.message || sb.error || "Erro no cadastro. Tente novamente.");
        return;
      }

      if (sb.token) localStorage.setItem("xnema_token", sb.token);
      if (sb.user) localStorage.setItem("xnema_user", JSON.stringify(sb.user));

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/pricing"), 1200);
    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
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
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              XNEMA
            </h1>
          </div>

          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 text-sm">
              <Crown className="w-4 h-4 mr-2" />
              Cadastro de Assinante
            </Badge>
            <p className="text-sm text-muted-foreground">
              Crie sua conta e acesse conteúdo premium
            </p>
          </div>
        </div>

        {/* Register Form */}
        <Card className="border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-center text-blue-700 dark:text-blue-200">
              Preencha os dados para começar sua experiência premium
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Telefone (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
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

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Plano */}
              <div className="space-y-2">
                <Label htmlFor="plan">Plano Preferido</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleInputChange("plan", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      Mensal - R$ 19,90/mês
                    </SelectItem>
                    <SelectItem value="yearly">
                      Anual - R$ 199,90/ano
                    </SelectItem>
                    <SelectItem value="lifetime">
                      Vitalício - R$ 499,90
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages */}
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Criar Conta Premium
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link
                    to="/login/subscriber"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Fazer login
                  </Link>
                </p>
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
                  onClick={() => navigate("/login-select")}
                  className="text-sm"
                >
                  ← Voltar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/creator-login")}
                  className="text-sm border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                >
                  Sou Criador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Ao criar uma conta, você concorda com nossos{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
