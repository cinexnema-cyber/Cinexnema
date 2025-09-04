import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { AuthService } from "@/lib/auth";
import {
  Mail,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function PasswordRecovery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados do componente
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Verifica se existe um token de recuperação na URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const type = searchParams.get("type");

    if (accessToken && refreshToken && type === "recovery") {
      // Usuario clicou no link de recuperação do email
      setStep("reset");

      // Configura a sessão com os tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, digite seu email");
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } =
        await AuthService.requestPasswordReset(email);

      if (resetError) {
        setError(resetError);
        return;
      }

      setMessage(
        `Email de recuperação enviado para ${email}. Verifique sua caixa de entrada e clique no link para redefinir sua senha.`,
      );
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      setError("Erro ao enviar email de recuperação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } =
        await AuthService.updatePassword(newPassword);

      if (updateError) {
        setError(updateError);
        return;
      }

      setMessage(
        "Senha redefinida com sucesso! Redirecionando para o login...",
      );

      // Logout do usuário e redireciona para o login após 2 segundos
      setTimeout(async () => {
        await AuthService.logout();
        navigate(
          "/login?message=Senha redefinida com sucesso. Faça login com sua nova senha.",
        );
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      setError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-xnema-surface border-xnema-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "email" ? (
                <Mail className="w-8 h-8 text-white" />
              ) : (
                <KeyRound className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl text-white">
              {step === "email" ? "Recuperar Senha" : "Redefinir Senha"}
            </CardTitle>
            <p className="text-gray-400 mt-2">
              {step === "email"
                ? "Digite seu email para receber o link de recuperação"
                : "Digite sua nova senha"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mensagens de sucesso e erro */}
            {message && (
              <Alert className="border-green-600 bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-600 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulário de Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-xnema-dark border-gray-600 text-white"
                    required
                    disabled={isLoading || !!message}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  disabled={isLoading || !!message}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Formulário de Nova Senha */}
            {step === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-white">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="bg-xnema-dark border-gray-600 text-white pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="bg-xnema-dark border-gray-600 text-white pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <p>A senha deve ter:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pelo menos 6 caracteres</li>
                    <li>Uma mistura de letras e números (recomendado)</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Redefinir Senha
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Botão de voltar */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>

            {/* Informações de segurança */}
            <div className="bg-xnema-dark/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">
                🔒 Seus dados estão protegidos com criptografia de ponta a ponta
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Em caso de problemas, entre em contato: cinexnema@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
