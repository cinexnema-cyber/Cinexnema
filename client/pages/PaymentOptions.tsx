import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { StripeService } from "@/lib/stripe";
import {
  CreditCard,
  Smartphone,
  QrCode,
  FileText,
  Link as LinkIcon,
  Shield,
  Check,
  Crown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  processingTime: string;
  available: boolean;
}

export default function PaymentOptions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    pixKey: "",
    linkAmount: "",
  });

  // Get plan from URL params
  useEffect(() => {
    const urlPlan = searchParams.get("plan");
    if (urlPlan === "yearly" || urlPlan === "monthly") {
      setPlanType(urlPlan);
    }
  }, [searchParams]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      name: "Cartão de Crédito",
      icon: CreditCard,
      description: "Visa, Mastercard, Elo, American Express",
      processingTime: "Imediato",
      available: true,
    },
    {
      id: "pix",
      name: "PIX",
      icon: QrCode,
      description: "Pagamento instantâneo via PIX",
      processingTime: "Imediato",
      available: true,
    },
    {
      id: "boleto",
      name: "Boleto Bancário",
      icon: FileText,
      description: "Vencimento em 3 dias úteis",
      processingTime: "1-2 dias úteis",
      available: true,
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      icon: Smartphone,
      description: "Pague com sua conta Mercado Pago",
      processingTime: "Imediato",
      available: true,
    },
    {
      id: "link",
      name: "Link de Pagamento",
      icon: LinkIcon,
      description: "Receba um link para finalizar depois",
      processingTime: "Conforme pagamento",
      available: true,
    },
  ];

  const plan = StripeService.getPlan(planType);
  const savings = StripeService.calculateYearlySavings();

  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePaymentData = (): boolean => {
    if (selectedMethod === "card") {
      return !!(
        paymentData.cardNumber &&
        paymentData.cardExpiry &&
        paymentData.cardCvc &&
        paymentData.cardName
      );
    }
    return true;
  };

  const processStripePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await StripeService.redirectToCheckout(planType, user.id, user.email);
    } catch (error) {
      console.error("Erro no pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    }
  };

  const processPIXPayment = async () => {
    setIsLoading(true);

    // Simular geração de QR Code PIX
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `QR Code PIX gerado! Valor: ${plan?.price ? StripeService.formatPrice(plan.price) : "R$ 19,90"}`,
      );

      // Simular detecção de pagamento após 3 segundos
      setTimeout(() => {
        if (user) {
          // Atualizar status do usuário para subscriber
          const updatedUser = {
            ...user,
            subscriptionStatus: "ativo" as const,
            role: "subscriber" as const,
            subscriptionPlan: planType,
            subscriptionEndDate: new Date(
              Date.now() +
                (planType === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
            ).toISOString(),
          };

          // Atualizar no contexto (em produção isso seria feito via API)
          localStorage.setItem("user", JSON.stringify(updatedUser));

          navigate("/payment-success?method=pix");
        }
      }, 3000);
    }, 2000);
  };

  const processBoletoPayment = async () => {
    setIsLoading(true);

    // Simular geração de boleto
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `Boleto gerado! Valor: ${plan?.price ? StripeService.formatPrice(plan.price) : "R$ 19,90"}\nVencimento: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}`,
      );

      // Simular detecção de pagamento do boleto
      setTimeout(() => {
        if (user) {
          const updatedUser = {
            ...user,
            subscriptionStatus: "ativo" as const,
            role: "subscriber" as const,
            subscriptionPlan: planType,
            subscriptionEndDate: new Date(
              Date.now() +
                (planType === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
            ).toISOString(),
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          navigate("/payment-success?method=boleto");
        }
      }, 5000);
    }, 1500);
  };

  const processMercadoPagoPayment = async () => {
    setIsLoading(true);

    // Simular redirecionamento para Mercado Pago
    setTimeout(() => {
      setIsLoading(false);
      const mpUrl = `https://mpago.la/1p9Jkyy?amount=${plan?.price ? plan.price / 100 : 19.9}`;
      window.open(mpUrl, "_blank");

      // Simular retorno do pagamento
      setTimeout(() => {
        if (user) {
          const updatedUser = {
            ...user,
            subscriptionStatus: "ativo" as const,
            role: "subscriber" as const,
            subscriptionPlan: planType,
            subscriptionEndDate: new Date(
              Date.now() +
                (planType === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
            ).toISOString(),
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          navigate("/payment-success?method=mercadopago");
        }
      }, 8000);
    }, 1000);
  };

  const generatePaymentLink = async () => {
    setIsLoading(true);

    // Simular geração de link de pagamento
    setTimeout(() => {
      setIsLoading(false);
      const paymentLink = `${window.location.origin}/pay/${user?.id}/${planType}/${Date.now()}`;

      navigator.clipboard.writeText(paymentLink).then(() => {
        alert(
          `Link de pagamento copiado para a área de transferência!\n\n${paymentLink}`,
        );
      });
    }, 1000);
  };

  const handleProcessPayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedMethod) {
      alert("Selecione um método de pagamento");
      return;
    }

    if (!validatePaymentData()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    switch (selectedMethod) {
      case "card":
        await processStripePayment();
        break;
      case "pix":
        await processPIXPayment();
        break;
      case "boleto":
        await processBoletoPayment();
        break;
      case "mercadopago":
        await processMercadoPagoPayment();
        break;
      case "link":
        await generatePaymentLink();
        break;
      default:
        setIsLoading(false);
        alert("Método de pagamento não suportado");
    }
  };

  if (!plan) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl">Plano não encontrado</p>
            <Button onClick={() => navigate("/pricing")} className="mt-4">
              Voltar aos Planos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Planos
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card className="bg-xnema-surface border-xnema-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-xnema-orange" />
                    Escolha a Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-xnema-orange bg-xnema-orange/10"
                          : "border-gray-600 hover:border-gray-500"
                      } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        method.available && setSelectedMethod(method.id)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedMethod === method.id
                              ? "bg-xnema-orange text-black"
                              : "bg-gray-700"
                          }`}
                        >
                          <method.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{method.name}</h3>
                            {!method.available && (
                              <Badge variant="secondary" className="text-xs">
                                Em breve
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {method.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Processamento: {method.processingTime}
                          </p>
                        </div>

                        {selectedMethod === method.id && (
                          <Check className="w-5 h-5 text-xnema-orange" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Form */}
              {selectedMethod && (
                <Card className="bg-xnema-surface border-xnema-border mt-6">
                  <CardHeader>
                    <CardTitle>Dados do Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMethod === "card" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Número do Cartão</Label>
                          <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={paymentData.cardNumber}
                            onChange={(e) =>
                              handleInputChange("cardNumber", e.target.value)
                            }
                            className="bg-xnema-dark border-gray-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiry">Validade</Label>
                            <Input
                              id="cardExpiry"
                              placeholder="MM/AA"
                              value={paymentData.cardExpiry}
                              onChange={(e) =>
                                handleInputChange("cardExpiry", e.target.value)
                              }
                              className="bg-xnema-dark border-gray-600"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardCvc">CVC</Label>
                            <Input
                              id="cardCvc"
                              placeholder="000"
                              value={paymentData.cardCvc}
                              onChange={(e) =>
                                handleInputChange("cardCvc", e.target.value)
                              }
                              className="bg-xnema-dark border-gray-600"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cardName">Nome no Cartão</Label>
                          <Input
                            id="cardName"
                            placeholder="Nome como está no cartão"
                            value={paymentData.cardName}
                            onChange={(e) =>
                              handleInputChange("cardName", e.target.value)
                            }
                            className="bg-xnema-dark border-gray-600"
                          />
                        </div>
                      </div>
                    )}

                    {selectedMethod === "pix" && (
                      <div className="text-center py-8">
                        <QrCode className="w-16 h-16 text-xnema-orange mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Pagamento via PIX
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Após confirmar, você receberá um QR Code para
                          pagamento instantâneo
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          Pagamento detectado automaticamente
                        </div>
                      </div>
                    )}

                    {selectedMethod === "boleto" && (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-xnema-orange mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Boleto Bancário
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Boleto com vencimento em 3 dias úteis
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          Pagamento detectado automaticamente após compensação
                        </div>
                      </div>
                    )}

                    {selectedMethod === "mercadopago" && (
                      <div className="text-center py-8">
                        <Smartphone className="w-16 h-16 text-xnema-orange mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Mercado Pago
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Você será redirecionado para finalizar o pagamento
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-green-500">
                          <Check className="w-4 h-4" />
                          Integração automática com retorno
                        </div>
                      </div>
                    )}

                    {selectedMethod === "link" && (
                      <div className="text-center py-8">
                        <LinkIcon className="w-16 h-16 text-xnema-orange mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Link de Pagamento
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Receba um link personalizado para finalizar o
                          pagamento quando quiser
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-500">
                          <LinkIcon className="w-4 h-4" />
                          Link válido por 24 horas
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-xnema-surface border-xnema-border sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-xnema-orange" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>

                  <Separator className="bg-gray-600" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-semibold">
                        {StripeService.formatPrice(plan.price)}
                      </span>
                    </div>

                    {planType === "yearly" && (
                      <div className="flex justify-between text-green-400">
                        <span>Economia:</span>
                        <span>-{savings.amount}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-600" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-xnema-orange">
                      {StripeService.formatPrice(plan.price)}
                    </span>
                  </div>

                  {planType === "yearly" && (
                    <Badge className="w-full justify-center bg-green-600 text-white">
                      Economize {savings.percentage}% no plano anual
                    </Badge>
                  )}

                  <div className="space-y-2 pt-4">
                    <h4 className="font-semibold text-sm">
                      Incluído no plano:
                    </h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={handleProcessPayment}
                    disabled={!selectedMethod || isLoading}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Confirmar Pagamento
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Pagamento seguro e criptografado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
