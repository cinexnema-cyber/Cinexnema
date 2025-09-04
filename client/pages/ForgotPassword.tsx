import { Layout } from "@/components/layout/Layout";
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
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Shield, Clock, Key } from "lucide-react";
import { useState } from "react";
import { AuthService } from "@/lib/auth";
import { XnemaLogo } from "@/components/XnemaLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setIsValidEmail(isValid);
    return isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrorMessage("");
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!validateEmail(email)) {
      setErrorMessage("Por favor, insira um email válido.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔍 Verificando se usuário está registrado:", email);

      // First check if user exists in our database
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const userData = await checkResponse.json();

        if (!userData.exists) {
          // User not registered, show registration message
          setErrorMessage(
            `Email ${email} não está cadastrado. Por favor, cadastre-se primeiro para acessar a plataforma.`
          );
          setIsLoading(false);
          return;
        }
      }

      // If user exists, proceed with password reset
      console.log("🔄 Solicitando reset de senha para:", email);
      const { error } = await AuthService.requestPasswordReset(email);

      if (error) {
        console.error("❌ Erro no reset:", error);
        if (error.includes("User not found") || error.includes("Invalid email")) {
          setErrorMessage(
            `Email ${email} não está cadastrado. Por favor, cadastre-se primeiro para acessar a plataforma.`
          );
        } else {
          setErrorMessage(error);
        }
      } else {
        console.log("✅ Email de reset enviado com sucesso!");
        setEmailSent(true);
      }
    } catch (error) {
      console.error("💥 Erro inesperado:", error);
      setErrorMessage("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* XNEMA Logo */}
          <div className="text-center mb-8">
            <XnemaLogo size="lg" />
          </div>

          <Card className="bg-xnema-surface border-gray-700">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Email Enviado!
              </CardTitle>
              <CardDescription className="text-gray-300">
                Verifique sua caixa de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-center text-sm">
                  Se existe uma conta com o email <strong>{email}</strong>,
                  enviamos um link para redefinir sua senha.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-xnema-orange" />
                  Não recebeu o email?
                </h4>
                <ul className="text-sm text-gray-300 space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-xnema-orange">•</span>
                    <span>Verifique a caixa de spam ou lixo eletrônico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xnema-orange">•</span>
                    <span>Confirme se o email está escrito corretamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xnema-orange">•</span>
                    <span>Aguarde alguns minutos e verifique novamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xnema-orange">•</span>
                    <span>O link expira em 1 hora por segurança</span>
                  </li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Link to="/login">
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar ao Login</span>
                    </div>
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                    setErrorMessage("");
                  }}
                  className="flex-1 bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* XNEMA Logo */}
        <div className="text-center mb-8">
          <XnemaLogo size="lg" />
          <p className="text-gray-400 mt-2 text-sm">Streaming Premium</p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Esqueceu sua{" "}
            <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
              Senha?
            </span>
          </h1>
          <p className="text-gray-300">
            Não se preocupe! Digite seu email e enviaremos um link seguro para
            redefinir sua senha.
          </p>
        </div>

        <Card className="bg-xnema-surface border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-xnema-orange" />
              <span>Recuperação Segura</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Informe o email da sua conta XNEMA para receber as instruções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  <p className="text-sm text-red-400">{errorMessage}</p>
                  {errorMessage.includes("não está cadastrado") && (
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <Link
                        to="/register"
                        className="inline-flex items-center text-sm text-xnema-orange hover:underline"
                      >
                        Criar conta agora →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Email da Conta
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`pl-10 bg-xnema-dark border-gray-600 text-white placeholder-gray-400 focus:border-xnema-orange ${
                      email &&
                      (isValidEmail ? "border-green-500" : "border-red-500")
                    }`}
                  />
                  {email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidEmail ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-red-500 text-xs">✕</span>
                      )}
                    </div>
                  )}
                </div>
                {email && !isValidEmail && (
                  <p className="text-xs text-red-400">
                    Formato de email inválido
                  </p>
                )}
              </div>

              {/* Security Info */}
              <div className="p-4 bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-xnema-orange flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-semibold text-xnema-orange mb-1">
                      Segurança Garantida
                    </h4>
                    <p className="text-gray-300">
                      Enviamos um link único e temporário que expira em 1 hora.
                      Nenhuma informação sensível é compartilhada por email.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                disabled={isLoading || !isValidEmail}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Enviar Link de Recuperação</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-xnema-orange hover:underline flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Login</span>
                </Link>
              </div>

              {/* Help Links */}
              <div className="text-center space-y-2 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">Precisa de ajuda?</p>
                <div className="flex justify-center space-x-4 text-xs">
                  <Link
                    to="/contact"
                    className="text-xnema-orange hover:underline"
                  >
                    Contato
                  </Link>
                  <Link
                    to="/about"
                    className="text-xnema-orange hover:underline"
                  >
                    Suporte
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
