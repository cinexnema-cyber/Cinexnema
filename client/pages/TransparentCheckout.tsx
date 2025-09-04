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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Calendar,
  DollarSign,
  Gift,
  Calculator,
  Clock,
  Loader2,
} from "lucide-react";

interface PlanOption {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: "basic",
    name: "Plano Básico",
    monthlyPrice: 19.9,
    description: "Acesso ao catálogo básico",
    features: ["Catálogo básico", "Qualidade HD", "1 tela simultânea"],
  },
  {
    id: "premium",
    name: "Plano Premium",
    monthlyPrice: 59.9,
    description: "Acesso completo + conteúdo exclusivo",
    features: [
      "Catálogo completo",
      "Qualidade 4K",
      "3 telas simultâneas",
      "Conteúdo exclusivo",
    ],
  },
  {
    id: "vip",
    name: "Plano VIP",
    monthlyPrice: 199.0,
    description: "Acesso total + benefícios especiais",
    features: [
      "Tudo do Premium",
      "5 telas simultâneas",
      "Download offline",
      "Suporte prioritário",
    ],
  },
];

export default function TransparentCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/payments");
      return;
    }

    // Se já é assinante ativo, redireciona
    if (user.subscriptionStatus === "ativo") {
      navigate("/subscriber-dashboard");
      return;
    }

    const planFromUrl = searchParams.get("plan");
    if (planFromUrl && PLANS.find((p) => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl);
    }
  }, [user, navigate, searchParams]);

  const calculateTotalPrice = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return 0;

    // Se é novo usuário, tem 1 mês grátis
    const isNewUser = !user?.subscriptionStart;
    const freeMonths = isNewUser ? 1 : user?.freeMonthsRemaining || 0;

    const billableMonths = Math.max(0, selectedMonths - freeMonths);
    return billableMonths * plan.monthlyPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleCardInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (!plan) throw new Error("Plano não encontrado");

      const totalPrice = calculateTotalPrice();

      // Criar pagamento no Mercado Pago
      const response = await fetch("/api/checkout/transparent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({
          userId: user.id,
          planId: selectedPlan,
          months: selectedMonths,
          totalAmount: totalPrice,
          cardData: {
            ...cardData,
            number: cardData.number.replace(/\s/g, ""),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao processar pagamento");
      }

      // Redirecionar para sucesso
      navigate("/payment-success-transparent?payment_id=" + result.paymentId);
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);
  const totalPrice = calculateTotalPrice();
  const isNewUser = !user?.subscriptionStart;
  const freeMonths = isNewUser ? 1 : user?.freeMonthsRemaining || 0;

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="bg-xnema-orange text-black mb-4 px-4 py-2">
              🔒 Checkout Transparente
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Finalize sua{" "}
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                Assinatura
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Dados seguros processados diretamente pelo Mercado Pago
            </p>
          </div>

          {error && (
            <Alert className="mb-8 border-red-500 bg-red-500/10">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seleção de Plano e Duração */}
            <div className="space-y-6">
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Escolha seu Plano
                  </CardTitle>
                  <CardDescription>
                    Selecione o plano ideal para você
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-xnema-orange bg-xnema-orange/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{plan.name}</h3>
                        <span className="text-lg font-bold text-xnema-orange">
                          {formatPrice(plan.monthlyPrice)}/mês
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {plan.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Duração</CardTitle>
                  <CardDescription>
                    Quantos meses deseja pagar antecipadamente?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedMonths.toString()}
                    onValueChange={(value) => setSelectedMonths(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 6, 12].map((months) => (
                        <SelectItem key={months} value={months.toString()}>
                          {months} mês{months > 1 ? "es" : ""}
                          {months >= 6 && (
                            <span className="text-green-400 ml-2">
                              (Desconto de {months === 6 ? "5" : "10"}%)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Pagamento */}
            <div className="space-y-6">
              {/* Resumo */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-xnema-orange" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPlanData && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          {selectedPlanData.name}:
                        </span>
                        <span className="text-white">
                          {formatPrice(selectedPlanData.monthlyPrice)}/mês
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-300">Duração:</span>
                        <span className="text-white">
                          {selectedMonths} mês{selectedMonths > 1 ? "es" : ""}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-300">Subtotal:</span>
                        <span className="text-white">
                          {formatPrice(
                            selectedMonths * selectedPlanData.monthlyPrice,
                          )}
                        </span>
                      </div>

                      {freeMonths > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            {freeMonths} mês{freeMonths > 1 ? "es" : ""} grátis:
                          </span>
                          <span>
                            -
                            {formatPrice(
                              Math.min(freeMonths, selectedMonths) *
                                selectedPlanData.monthlyPrice,
                            )}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-gray-600 pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Total a pagar:</span>
                          <span className="text-xnema-orange">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                        {totalPrice === 0 && (
                          <p className="text-green-400 text-sm mt-2">
                            🎉 Sem cobrança! Aproveitando período gratuito
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Dados do Cartão */}
              {totalPrice > 0 && (
                <Card className="bg-xnema-surface border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-xnema-orange" />
                      Dados do Cartão
                    </CardTitle>
                    <CardDescription>
                      Informações seguras processadas pelo Mercado Pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          value={cardData.number}
                          onChange={(e) =>
                            handleCardInputChange(
                              "number",
                              formatCardNumber(e.target.value),
                            )
                          }
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          value={cardData.name}
                          onChange={(e) =>
                            handleCardInputChange(
                              "name",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="NOME COMO NO CARTÃO"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            value={cardData.expiry}
                            onChange={(e) =>
                              handleCardInputChange(
                                "expiry",
                                formatExpiry(e.target.value),
                              )
                            }
                            placeholder="MM/AA"
                            maxLength={5}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            value={cardData.cvv}
                            onChange={(e) =>
                              handleCardInputChange(
                                "cvv",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardCpf">CPF do Titular</Label>
                        <Input
                          id="cardCpf"
                          value={cardData.cpf}
                          onChange={(e) =>
                            handleCardInputChange(
                              "cpf",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="00000000000"
                          maxLength={11}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6 text-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 mr-2" />
                            {totalPrice > 0
                              ? `Pagar ${formatPrice(totalPrice)}`
                              : "Ativar Assinatura Gratuita"}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Período Gratuito */}
              {totalPrice === 0 && (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6 text-center">
                    <Gift className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-green-400 mb-2">
                      Período Gratuito Ativo!
                    </h3>
                    <p className="text-green-300 mb-4">
                      Você tem {freeMonths} mês{freeMonths > 1 ? "es" : ""}{" "}
                      gratuitos para aproveitar todo o conteúdo.
                    </p>
                    <Button
                      onClick={() =>
                        handleSubmit({ preventDefault: () => {} } as any)
                      }
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Ativando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Ativar Período Gratuito
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Segurança */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-blue-400">
                    Pagamento Seguro
                  </h4>
                </div>
                <p className="text-blue-300 text-sm">
                  Seus dados são criptografados e processados diretamente pelo
                  Mercado Pago. Não armazenamos informações do cartão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
