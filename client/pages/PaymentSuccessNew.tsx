import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextReal";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Crown,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentSuccessNew() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Parâmetros que podem vir do Mercado Pago
  const collection_id = searchParams.get("collection_id");
  const collection_status = searchParams.get("collection_status");
  const payment_id = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const external_reference = searchParams.get("external_reference");
  const preference_id = searchParams.get("preference_id");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Aguardar um pouco para o webhook processar
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Atualizar dados do usuário
        await refreshUser();

        // Verificar se o pagamento foi confirmado
        if (collection_status === "approved" || status === "approved") {
          setPaymentConfirmed(true);

          // Atribuir assinatura ao referral (se existir)
          try {
            const saved = localStorage.getItem("xnema_ref");
            if (saved && user) {
              const refInfo = JSON.parse(saved);
              await fetch("/api/referrals/track-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ref: refInfo.ref,
                  videoId: refInfo.videoId || null,
                  userId: user.id,
                  plan: user.subscriptionPlan || null,
                }),
              });
            }
          } catch {}
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Erro ao confirmar pagamento:", err);
        setError(
          "Erro ao confirmar pagamento. Por favor, entre em contato conosco.",
        );
        setLoading(false);
      }
    };

    confirmPayment();
  }, [user, collection_status, status, refreshUser, navigate]);

  const handleContinue = () => {
    if (user?.subscriptionStatus === "ativo") {
      navigate("/subscriber-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSupport = () => {
    navigate("/contact");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-xnema-dark">
          <Card className="w-full max-w-md bg-xnema-surface border-gray-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-xnema-orange mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-white mb-2">
                Confirmando seu Pagamento
              </h2>
              <p className="text-gray-400">
                Aguarde enquanto processamos sua assinatura...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4 max-w-2xl">
          {error ? (
            /* Erro na confirmação */
            <Card className="bg-xnema-surface border-red-500">
              <CardHeader className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">
                  Problema na Confirmação
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Houve um problema ao confirmar seu pagamento
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <p className="text-gray-400 mb-6">
                    Se você efetuou o pagamento, ele será processado em breve.
                    Entre em contato conosco se o problema persistir.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleSupport}
                      variant="outline"
                      className="w-full"
                    >
                      Entrar em Contato
                    </Button>

                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    >
                      Voltar ao Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Sucesso */
            <Card className="bg-xnema-surface border-green-500">
              <CardHeader className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <Badge className="bg-green-500 text-white mb-4 px-4 py-2">
                  ✅ Pagamento Confirmado
                </Badge>
                <CardTitle className="text-3xl text-white mb-2">
                  Bem-vindo à{" "}
                  <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                    XNEMA Premium!
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Sua assinatura foi ativada com sucesso
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Informações do Pagamento */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-500" />
                    Detalhes da Assinatura
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400 font-semibold">
                        Ativa
                      </span>
                    </div>
                    {user?.subscriptionPlan && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plano:</span>
                        <span className="text-white">
                          {user.subscriptionPlan === "monthly"
                            ? "Mensal"
                            : "Anual"}
                        </span>
                      </div>
                    )}
                    {payment_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID do Pagamento:</span>
                        <span className="text-white font-mono text-xs">
                          {payment_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">
                    Agora você tem acesso a:
                  </h3>

                  <div className="grid gap-3">
                    {[
                      "Catálogo completo sem limites",
                      "Qualidade 4K e HDR",
                      "Sem anúncios",
                      "Between Heaven and Hell",
                      "Conteúdo exclusivo",
                      "Suporte prioritário",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="space-y-3">
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Começar a Assistir
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/payment-history")}
                      className="text-gray-400 hover:text-white"
                    >
                      Ver Histórico de Pagamentos
                    </Button>
                  </div>
                </div>

                {/* Informações Importantes */}
                <div className="bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg p-4">
                  <h4 className="font-semibold text-xnema-orange mb-2">
                    📧 Confirmação por Email
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Enviamos uma confirmação para seu email com todos os
                    detalhes da assinatura. Você pode cancelar a qualquer
                    momento sem taxas adicionais.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
