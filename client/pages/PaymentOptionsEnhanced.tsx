import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Banknote, 
  Check, 
  Copy, 
  ExternalLink,
  Timer,
  Shield,
  Star,
  Zap,
  Gift,
  ArrowRight,
  AlertCircle,
  Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock QR code data - in production, this would come from Mercado Pago API
const mockQrCodeData = {
  pixCode: "00020126580014br.gov.bcb.pix013636ed2e0c-7b9e-4c6a-9a8b-123456789012520400005303986540519.905802BR5925CINEXNEMA STREAMING LTDA6009SAO PAULO610801310100621605210000000000006304",
  qrCodeUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+DQogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0Ij5RUiBDb2RlPC90ZXh0Pg0KPC9zdmc+",
  expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
};

const plans = [
  {
    id: "monthly",
    name: "Plano Mensal",
    price: 19.90,
    period: "mês",
    description: "Acesso completo à plataforma",
    features: ["Todos os filmes e séries", "Qualidade 4K", "Sem anúncios", "Cancelamento gratuito"],
    badge: null,
    color: "blue"
  },
  {
    id: "yearly",
    name: "Plano Anual",
    price: 199.90,
    period: "ano",
    description: "Economize 2 meses",
    features: ["Todos os filmes e séries", "Qualidade 4K", "Sem anúncios", "2 meses grátis", "Suporte prioritário"],
    badge: "Mais Popular",
    color: "orange",
    discount: "17% OFF"
  },
  {
    id: "creator",
    name: "Plano Criador",
    price: 1000.00,
    period: "mês",
    description: "Para criadores de conteúdo",
    features: ["Upload de vídeos", "Analytics avançados", "100GB de armazenamento", "Receita compartilhada", "Período de carência disponível"],
    badge: "Para Criadores",
    color: "purple"
  }
];

const paymentMethods = [
  {
    id: "pix",
    name: "PIX",
    icon: QrCode,
    description: "Pagamento instantâneo via QR Code",
    fees: "Sem taxas",
    time: "Imediato",
    recommended: true
  },
  {
    id: "credit",
    name: "Cartão de Crédito",
    icon: CreditCard,
    description: "Visa, Mastercard, Elo",
    fees: "Sem taxas extras",
    time: "Imediato",
    recommended: false
  },
  {
    id: "debit",
    name: "Cartão de Débito",
    icon: Smartphone,
    description: "Débito online",
    fees: "Sem taxas",
    time: "Imediato",
    recommended: false
  },
  {
    id: "boleto",
    name: "Boleto Bancário",
    icon: Banknote,
    description: "Vencimento em 3 dias úteis",
    fees: "Sem taxas",
    time: "1-2 dias úteis",
    recommended: false
  }
];

export default function PaymentOptionsEnhanced() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [selectedMethod, setSelectedMethod] = useState("pix");
  const [showQrCode, setShowQrCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Timer countdown for QR code expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQrCode && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showQrCode, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(mockQrCodeData.pixCode);
    // Show toast notification
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  const handlePayment = () => {
    if (selectedMethod === "pix") {
      setShowQrCode(true);
      // Start monitoring payment status
      checkPaymentStatus();
    } else {
      // Redirect to other payment methods
      window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123456789-${selectedMethod}-${selectedPlan}`, '_blank');
    }
  };

  const checkPaymentStatus = () => {
    // Simulate payment detection after 10 seconds
    setTimeout(() => {
      setPaymentCompleted(true);
      setTimeout(() => {
        navigate('/payment-success');
      }, 2000);
    }, 10000);
  };

  if (paymentCompleted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground mb-4">
                Seu acesso foi liberado com sucesso.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  Redirecionando para seu dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showQrCode) {
    return (
      <Layout>
        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Finalize seu Pagamento</h1>
              <p className="text-muted-foreground">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6 text-blue-500" />
                  Pagamento via PIX
                </CardTitle>
                <CardDescription>
                  {selectedPlanData?.name} - R$ {selectedPlanData?.price.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timer */}
                <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Timer className="w-5 h-5 text-orange-600" />
                  <span className="font-mono text-xl font-bold text-orange-600">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm text-orange-600">para expirar</span>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img 
                      src={mockQrCodeData.qrCodeUrl} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Escaneie com o app do seu banco
                  </p>
                </div>

                <Separator />

                {/* PIX Code */}
                <div className="space-y-3">
                  <h3 className="font-medium text-center">Ou copie o código PIX:</h3>
                  <div className="flex gap-2">
                    <Input 
                      value={mockQrCodeData.pixCode} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button onClick={copyPixCode} variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Como pagar:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Abra o app do seu banco</li>
                      <li>Vá em PIX → Ler QR Code</li>
                      <li>Escaneie o código acima</li>
                      <li>Confirme o pagamento</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {/* Support */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Problemas com o pagamento?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => window.open('https://wa.me/5515997636161', '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      WhatsApp Suporte
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowQrCode(false)}>
                      Voltar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Escolha seu <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">Plano</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acesso ilimitado ao melhor do cinema brasileiro e internacional
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all hover:scale-105 ${
                  selectedPlan === plan.id 
                    ? `ring-2 ring-${plan.color}-500 border-${plan.color}-500` 
                    : 'hover:border-xnema-orange'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2`}>
                    <Badge className={`bg-${plan.color}-500 text-white`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                {plan.discount && (
                  <div className="absolute -top-3 -right-3">
                    <Badge className="bg-green-500 text-white">
                      {plan.discount}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-base font-normal text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className={`w-4 h-4 text-${plan.color}-500`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-6 ${
                      selectedPlan === plan.id 
                        ? `bg-${plan.color}-500 hover:bg-${plan.color}-600` 
                        : 'variant-outline'
                    }`}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {selectedPlan === plan.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Selecionado
                      </>
                    ) : (
                      'Selecionar Plano'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Forma de Pagamento</CardTitle>
              <CardDescription className="text-center">
                Plano selecionado: {selectedPlanData?.name} - R$ {selectedPlanData?.price.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email para acesso</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <Separator />

              {/* Payment Method Selection */}
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <label
                        htmlFor={method.id}
                        className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedMethod === method.id 
                            ? 'border-xnema-orange bg-xnema-orange/10' 
                            : 'border-gray-200'
                        }`}
                      >
                        {method.recommended && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                            Recomendado
                          </Badge>
                        )}
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedMethod === method.id ? 'bg-xnema-orange text-white' : 'bg-muted'
                        }`}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs text-green-600">{method.fees}</span>
                            <span className="text-xs text-blue-600">{method.time}</span>
                          </div>
                        </div>
                        
                        {selectedMethod === method.id && (
                          <Check className="w-5 h-5 text-xnema-orange" />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pagamento 100% seguro:</strong> Processado via Mercado Pago com criptografia SSL. 
                  Seus dados estão protegidos.
                </AlertDescription>
              </Alert>

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6 text-lg"
                disabled={!userEmail}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Pagar R$ {selectedPlanData?.price.toFixed(2)} via {paymentMethods.find(m => m.id === selectedMethod)?.name}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Payment powered by */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Pagamentos processados por <strong>Mercado Pago</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
