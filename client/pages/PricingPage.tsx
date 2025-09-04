import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContextReal";
import {
  Crown,
  Check,
  Star,
  Play,
  Download,
  Smartphone,
  Shield,
  Zap,
  Users,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval?: string;
  description: string;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch("/api/payment/plans");
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
        setSelectedPlan(data.plans[0]?.id || "");
      } else {
        setError("Erro ao carregar planos");
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/register-subscriber");
      return;
    }

    if (user.isPremium) {
      navigate("/dashboard");
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      console.log("🛒 Iniciando processo de pagamento:", {
        planId,
        userId: user.id,
      });

      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.message || "Erro ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getPlanFeatures = (planId: string) => {
    const baseFeatures = [
      "Streaming em qualidade 4K Ultra HD",
      "Catálogo completo de filmes e séries",
      "Download para assistir offline",
      "Sem anúncios ou interrupções",
      "Acesso em múltiplos dispositivos",
      "Legendas em português",
    ];

    const premiumFeatures = [
      "Conteúdo exclusivo premium",
      "Estreias antecipadas",
      "Suporte prioritário",
      "Recomendações personalizadas",
    ];

    if (planId === "lifetime") {
      return [
        ...baseFeatures,
        ...premiumFeatures,
        "Acesso vitalício garantido",
      ];
    }

    if (planId === "yearly") {
      return [...baseFeatures, "Desconto de 17% no valor anual"];
    }

    return baseFeatures;
  };

  const getPopularPlan = () => {
    return plans.find((p) => p.id === "yearly")?.id || "";
  };

  const getBestValuePlan = () => {
    return plans.find((p) => p.id === "lifetime")?.id || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(user ? "/dashboard" : "/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div>
                <h1 className="text-2xl font-bold">Planos XNEMA</h1>
                <p className="text-sm text-muted-foreground">
                  Escolha o plano ideal para você
                </p>
              </div>
            </div>

            {user?.isPremium && (
              <Badge className="bg-blue-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Já é Premium
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Transforme sua Experiência de Streaming
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Acesse milhares de filmes e séries em qualidade 4K, sem anúncios,
            com download offline e muito mais.
          </p>

          {user?.isPremium && (
            <Alert className="max-w-md mx-auto mb-8 border-green-500 bg-green-50 dark:bg-green-950">
              <Crown className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Você já é um assinante premium! Aproveite todos os benefícios.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="max-w-md mx-auto mb-8 border-red-500 bg-red-50 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative hover:shadow-xl transition-shadow ${
                plan.id === getPopularPlan()
                  ? "border-blue-500 shadow-lg scale-105"
                  : ""
              } ${plan.id === getBestValuePlan() ? "border-purple-500" : ""}`}
            >
              {/* Popular Badge */}
              {plan.id === getPopularPlan() && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              )}

              {/* Best Value Badge */}
              {plan.id === getBestValuePlan() && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Melhor Valor
                </Badge>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.interval === "month" && "por mês"}
                    {plan.interval === "year" && "por ano"}
                    {!plan.interval && "pagamento único"}
                  </div>

                  {plan.id === "yearly" && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Economize R$ 38,90 por ano
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {getPlanFeatures(plan.id).map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPayment || user?.isPremium}
                  className={`w-full py-6 text-base font-medium ${
                    plan.id === getPopularPlan()
                      ? "bg-blue-500 hover:bg-blue-600"
                      : plan.id === getBestValuePlan()
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : user?.isPremium ? (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Plano Ativo
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Assinar {plan.name}
                    </>
                  )}
                </Button>

                {plan.id === "monthly" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Renovação automática mensal
                  </p>
                )}

                {plan.id === "yearly" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Cobrança anual - Cancele quando quiser
                  </p>
                )}

                {plan.id === "lifetime" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Pagamento único - Acesso para sempre
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Qualidade 4K</h3>
            <p className="text-sm text-muted-foreground">
              Desfrute de uma experiência cinematográfica com qualidade Ultra HD
              4K
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Download Offline</h3>
            <p className="text-sm text-muted-foreground">
              Baixe seus filmes favoritos e assista onde e quando quiser
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Múltiplos Dispositivos
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse de qualquer lugar: TV, celular, tablet ou computador
            </p>
          </div>
        </div>

        {/* Security & Guarantee */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="w-4 h-4" />
            <span>Pagamento 100% seguro com Stripe</span>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>✓ Cancele quando quiser</span>
            <span>✓ Sem taxas ocultas</span>
            <span>✓ Suporte 24/7</span>
          </div>
        </div>

        {/* CTA for non-users */}
        {!user && (
          <div className="text-center mt-12 p-8 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              Ainda não tem uma conta?
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie sua conta gratuita e escolha seu plano
            </p>
            <Button onClick={() => navigate("/register-subscriber")}>
              <Users className="w-4 h-4 mr-2" />
              Criar Conta Gratuita
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
