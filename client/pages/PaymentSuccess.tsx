import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextReal";
import {
  CheckCircle,
  Crown,
  Play,
  Star,
  Gift,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError("Sessão de pagamento não encontrada");
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionData && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate("/dashboard");
    }
  }, [countdown, sessionData, navigate]);

  const verifyPayment = async () => {
    try {
      console.log("🔍 Verificando pagamento:", sessionId);

      const response = await fetch(`/api/payment/session-status/${sessionId}`);
      const data = await response.json();

      if (data.success && data.session) {
        setSessionData(data.session);

        // Atualizar dados do usuário
        await checkAuth();

        console.log("✅ Pagamento verificado com sucesso");
      } else {
        setError("Erro ao verificar pagamento");
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "monthly":
        return "Plano Mensal";
      case "yearly":
        return "Plano Anual";
      case "lifetime":
        return "Plano Vitalício";
      default:
        return "Plano Premium";
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "monthly":
        return "Renovação automática mensal";
      case "yearly":
        return "Cobrança anual com desconto";
      case "lifetime":
        return "Acesso vitalício sem renovação";
      default:
        return "Acesso premium";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold mb-2">
            Verificando pagamento...
          </h2>
          <p className="text-muted-foreground">
            Por favor, aguarde enquanto confirmamos sua compra
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">
              Erro na Verificação
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Não conseguimos verificar seu pagamento. Entre em contato com o
              suporte se o problema persistir.
            </p>

            <div className="space-y-2">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Ir para Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="w-full"
              >
                Ver Planos Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-green-600">
            Pagamento Confirmado!
          </h1>

          <p className="text-xl text-muted-foreground">
            Bem-vindo ao XNEMA Premium! 🎉
          </p>
        </div>

        {/* Payment Details */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Detalhes da Assinatura
            </CardTitle>
            <CardDescription>
              Sua assinatura foi ativada com sucesso
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {sessionData && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informações da Compra</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano:</span>
                      <span className="font-medium">
                        {getPlanName(sessionData.metadata?.plan)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">
                        R${" "}
                        {((sessionData.amount_total || 0) / 100)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className="bg-green-500 text-white">Pago</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-xs">
                        {sessionData.customerEmail}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Benefícios Ativados</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Streaming 4K Ultra HD</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Catálogo completo</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Download offline</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Sem anúncios</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Múltiplos dispositivos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-500" />
              Próximos Passos
            </CardTitle>
            <CardDescription>
              Comece a aproveitar sua experiência premium
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Play className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Explorar Catálogo</h4>
                <p className="text-xs text-muted-foreground">
                  Descubra milhares de filmes e séries
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Recomendações</h4>
                <p className="text-xs text-muted-foreground">
                  Conteúdo personalizado para você
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Crown className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Perfil Premium</h4>
                <p className="text-xs text-muted-foreground">
                  Configure suas preferências
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Redirect Notice */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Redirecionamento automático
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Você será redirecionado para o dashboard em {countdown}{" "}
                  segundos
                </p>
              </div>

              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Ir Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Precisa de ajuda? Entre em contato com nosso{" "}
            <button className="underline hover:text-foreground">
              suporte técnico
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
