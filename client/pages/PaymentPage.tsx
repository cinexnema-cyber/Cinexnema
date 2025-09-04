import React, { useState, useEffect } from "react";
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
  CreditCard,
  Crown,
  Star,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  popular: boolean;
  features: string[];
  savings?: string;
}

export default function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Planos mantidos da estrutura atual
  const plans: Plan[] = [
    {
      id: "monthly",
      name: "Plano Mensal",
      price: 19.9,
      period: "mês",
      description: "Acesso completo por 30 dias",
      popular: false,
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "2 telas simultâneas",
        "Suporte via chat",
        "Acesso a lançamentos exclusivos",
      ],
    },
    {
      id: "yearly",
      name: "Plano Anual",
      price: 199.0,
      originalPrice: 238.8,
      period: "ano",
      description: "Melhor custo-benefício",
      popular: true,
      savings: "Economize R$ 39,80 (16%)",
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "4 telas simultâneas",
        "Download para assistir offline",
        "Suporte prioritário",
        "Acesso antecipado a novos lançamentos",
        "Primeiro mês incluído",
      ],
    },
  ];

  useEffect(() => {
    // Se não está logado, redireciona para login
    if (!user) {
      navigate("/login?redirect=/payments");
      return;
    }

    // Se já é assinante ativo, redireciona para dashboard
    if (user.subscriptionStatus === "ativo") {
      navigate("/subscriber-dashboard");
      return;
    }

    // Seleciona plano da URL ou define padrão
    const planFromUrl = searchParams.get("plan");
    if (planFromUrl && plans.find((p) => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl);
    } else {
      setSelectedPlan("yearly"); // Plano padrão (mais popular)
    }
  }, [user, navigate, searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handlePayment = async (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: user.id,
          planId: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar pagamento");
      }

      // Redireciona para o Mercado Pago
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  if (!user) {
    return null; // Loading será gerenciado pelo useEffect
  }

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="bg-xnema-orange text-black mb-4 px-4 py-2">
              💳 Pagamento Seguro
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Finalize sua{" "}
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                Assinatura
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Você será redirecionado para o Mercado Pago para concluir seu
              pagamento de forma segura
            </p>
          </div>

          {error && (
            <Alert className="mb-8 border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seleção de Plano */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Escolha seu Plano
              </h2>

              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "bg-gradient-to-br from-xnema-purple/20 to-xnema-orange/20 border-xnema-orange"
                        : "bg-xnema-surface border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-xnema-orange text-black px-3 py-1">
                          🔥 Mais Popular
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedPlan === plan.id
                                  ? "bg-xnema-orange border-xnema-orange"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedPlan === plan.id && (
                                <div className="w-2 h-2 bg-black rounded-full m-0.5" />
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              {plan.name}
                            </h3>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">
                            {plan.description}
                          </p>

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-xnema-orange">
                              {formatPrice(plan.price)}
                            </span>
                            <span className="text-gray-400">
                              /{plan.period}
                            </span>
                          </div>

                          {plan.originalPrice && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500 line-through text-sm">
                                {formatPrice(plan.originalPrice)}
                              </span>
                              <Badge className="bg-green-500 text-white text-xs">
                                16% OFF
                              </Badge>
                            </div>
                          )}
                        </div>

                        {plan.id === "yearly" && (
                          <div className="text-right">
                            <Crown className="w-8 h-8 text-xnema-orange mb-2" />
                            <p className="text-xs text-green-400 font-semibold">
                              Melhor Valor
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Resumo e Pagamento */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Resumo do Pedido
              </h2>

              {selectedPlanData && (
                <Card className="bg-xnema-surface border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-xnema-orange" />
                      {selectedPlanData.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedPlanData.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {selectedPlanData.features
                        .slice(0, 4)
                        .map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-300 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      {selectedPlanData.features.length > 4 && (
                        <p className="text-gray-400 text-sm">
                          +{selectedPlanData.features.length - 4} recursos
                          adicionais
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Subtotal:</span>
                        <span className="text-white">
                          {formatPrice(selectedPlanData.price)}
                        </span>
                      </div>

                      {selectedPlanData.originalPrice && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-400">Desconto:</span>
                          <span className="text-green-400">
                            -
                            {formatPrice(
                              selectedPlanData.originalPrice -
                                selectedPlanData.price,
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-lg font-bold border-t border-gray-600 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-xnema-orange">
                          {formatPrice(selectedPlanData.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações de Pagamento */}
              <Card className="bg-xnema-surface border-gray-700 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Mercado Pago</h3>
                      <p className="text-gray-400 text-sm">
                        Pagamento seguro e protegido
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      🔒 Você será redirecionado para o ambiente seguro do
                      Mercado Pago para finalizar seu pagamento. Após a
                      confirmação, seu acesso será liberado automaticamente.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Pagamento */}
              <Button
                onClick={() =>
                  selectedPlanData && handlePayment(selectedPlanData.id)
                }
                disabled={loading || !selectedPlanData}
                className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pagar com Mercado Pago
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Pagamento processado com segurança pelo Mercado Pago. Cancele
                quando quiser, sem taxas adicionais.
              </p>
            </div>
          </div>

          {/* Garantias */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Pagamento Seguro",
                description: "Seus dados protegidos com criptografia de ponta",
              },
              {
                icon: "⚡",
                title: "Acesso Imediato",
                description:
                  "Liberação automática após confirmação do pagamento",
              },
              {
                icon: "🎯",
                title: "Sem Compromisso",
                description: "Cancele a qualquer momento, sem multas",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
