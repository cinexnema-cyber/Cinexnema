import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Check, Star, Zap, Shield, CreditCard } from "lucide-react";

export default function Subscribe() {
  const { user } = useAuth();

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: 19.9,
      description: "Perfeito para começar",
      url: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=68bba11ef1bc4daa9275b1ccfd668120",
      features: [
        "Catálogo básico de filmes",
        "Qualidade HD",
        "1 tela simultânea",
        "Sem anúncios",
      ],
      icon: <Star className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "intermediate",
      name: "Intermediário",
      price: 59.9,
      description: "Mais conteúdo e qualidade",
      url: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=32bf72908b694083acb5473516d7ae44",
      features: [
        "Catálogo completo",
        "Qualidade 4K",
        "3 telas simultâneas",
        "Between Heaven and Hell",
        "Download para offline",
        "Sem anúncios",
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-xnema-orange to-xnema-purple",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 199.9,
      description: "Experiência completa",
      url: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=dc4a4680ad914fc3a5ff18e8657083b8",
      features: [
        "Catálogo completo + exclusivos",
        "Qualidade 4K HDR",
        "5 telas simultâneas",
        "Between Heaven and Hell",
        "Conteúdo exclusivo de criadores",
        "Download ilimitado",
        "Suporte prioritário",
        "Acesso antecipado a novos conteúdos",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
    },
  ];

  const handleSubscribe = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Escolha seu{" "}
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                Plano
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acesse todo o catálogo premium da XNEMA com qualidade 4K e
              conteúdo exclusivo
            </p>

            {user && (
              <div className="mt-6 p-4 bg-xnema-surface rounded-lg inline-block">
                <p className="text-foreground">
                  Bem-vindo,{" "}
                  <span className="font-semibold text-xnema-orange">
                    {user.name}
                  </span>
                  ! Escolha o plano ideal para você.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`relative transition-all hover:scale-105 ${
                  plan.popular
                    ? "border-2 border-xnema-orange shadow-2xl"
                    : "border-xnema-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black font-bold px-4 py-1">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>

                  <div className="py-6">
                    <div className="text-4xl font-bold text-foreground">
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </div>
                    <div className="text-muted-foreground">por mês</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.url)}
                    className={`w-full font-semibold text-lg py-3 ${
                      plan.popular
                        ? "bg-gradient-to-r from-xnema-orange to-xnema-purple text-black hover:opacity-90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Assinar R$ {plan.price.toFixed(2).replace(".", ",")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Pagamento Seguro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Processado pelo Mercado Pago com segurança total
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Sem Compromisso
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cancele a qualquer momento sem multas
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Qualidade Premium
                </h3>
                <p className="text-sm text-muted-foreground">
                  Streaming 4K HDR com áudio surround
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto mt-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Perguntas Frequentes
            </h2>

            <div className="space-y-6">
              <div className="bg-xnema-surface rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-muted-foreground">
                  Sim! Você pode cancelar sua assinatura a qualquer momento sem
                  taxas ou multas. O acesso continua até o final do período
                  pago.
                </p>
              </div>

              <div className="bg-xnema-surface rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Como funciona o pagamento?
                </h3>
                <p className="text-muted-foreground">
                  O pagamento é processado de forma segura pelo Mercado Pago.
                  Você pode pagar com cartão de crédito, débito ou PIX. A
                  cobrança é automática todo mês.
                </p>
              </div>

              <div className="bg-xnema-surface rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Posso trocar de plano depois?
                </h3>
                <p className="text-muted-foreground">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a
                  qualquer momento. As mudanças entram em vigor no próximo ciclo
                  de cobrança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
