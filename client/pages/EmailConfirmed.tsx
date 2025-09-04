import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XnemaLogo } from "@/components/XnemaLogo";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Crown,
} from "lucide-react";

export default function EmailConfirmed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    handleEmailConfirmation();
  }, [searchParams]);

  const handleEmailConfirmation = async () => {
    try {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const type = searchParams.get("type");

      console.log("🔍 Parâmetros recebidos:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setMessage("Link de confirmação inválido ou expirado.");
        return;
      }

      // Verificar se é confirmação de email
      if (type === "signup" || type === "email_change") {
        console.log("📧 Processando confirmação de email...");
        
        // Definir sessão com os tokens recebidos
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("❌ Erro ao definir sessão:", sessionError);
          setStatus('error');
          setMessage("Erro ao confirmar email. Tente novamente.");
          return;
        }

        if (sessionData.user) {
          console.log("✅ Email confirmado com sucesso!");
          setUserEmail(sessionData.user.email);
          setStatus('success');
          setMessage("Email confirmado com sucesso! Sua conta está ativa.");

          // Aguardar um momento e redirecionar para login
          setTimeout(() => {
            navigate("/login", {
              state: {
                email: sessionData.user.email,
                message: "Email confirmado! Faça login para acessar sua conta."
              }
            });
          }, 3000);
        }
      } else {
        setStatus('error');
        setMessage("Tipo de confirmação não reconhecido.");
      }

    } catch (error) {
      console.error("💥 Erro inesperado na confirmação:", error);
      setStatus('error');
      setMessage("Erro inesperado. Tente novamente.");
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="w-12 h-12 animate-spin text-xnema-orange" />,
          title: "Confirmando Email...",
          description: "Processando confirmação da sua conta",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20"
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          title: "Email Confirmado!",
          description: userEmail ? `Email ${userEmail} foi confirmado com sucesso` : "Sua conta foi ativada",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20"
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          title: "Erro na Confirmação",
          description: "Não foi possível confirmar seu email",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20"
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* XNEMA Logo */}
        <div className="text-center mb-8">
          <XnemaLogo size="lg" />
        </div>

        <Card className="bg-xnema-surface border-gray-700">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 ${statusContent.bgColor} ${statusContent.borderColor} border-2 rounded-full flex items-center justify-center mx-auto mb-4`}>
              {statusContent.icon}
            </div>
            <CardTitle className="text-2xl text-white">
              {statusContent.title}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {statusContent.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {message && (
              <Alert className={`${statusContent.bgColor} ${statusContent.borderColor}`}>
                <Mail className="h-4 w-4" />
                <AlertDescription className={status === 'error' ? 'text-red-400' : status === 'success' ? 'text-green-400' : 'text-blue-400'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🎉 Bem-vindo à XNEMA!</h4>
                  <p className="text-green-300 text-sm">
                    Sua conta foi ativada com sucesso. Agora você pode fazer login e aproveitar todo o conteúdo premium.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-4">
                    Redirecionando para login em alguns segundos...
                  </p>
                  <Button
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                    onClick={() => navigate("/login", {
                      state: {
                        email: userEmail,
                        message: "Email confirmado! Faça login para acessar sua conta."
                      }
                    })}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Fazer Login Agora
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="font-semibold text-red-400 mb-2">❌ Possíveis Causas:</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    <li>• Link expirado (válido por 24 horas)</li>
                    <li>• Link já utilizado anteriormente</li>
                    <li>• Email já confirmado</li>
                    <li>• Parâmetros inválidos na URL</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                    onClick={() => navigate("/forgot-password")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Novo Link
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Aguarde enquanto validamos sua confirmação de email...
                  </p>
                </div>
              </div>
            )}

            {/* Link para voltar */}
            <div className="text-center pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-xnema-orange hover:text-xnema-orange/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações de suporte */}
        <div className="mt-6 p-4 bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg">
          <div className="text-center">
            <h4 className="font-semibold text-xnema-orange mb-2">
              Precisa de Ajuda?
            </h4>
            <p className="text-gray-300 text-sm mb-3">
              Se continuar com problemas, entre em contato conosco.
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <Link
                to="/contact"
                className="text-xnema-orange hover:underline"
              >
                Contato
              </Link>
              <span className="text-gray-500">•</span>
              <Link
                to="/about"
                className="text-xnema-orange hover:underline"
              >
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
