import { useSearchParams, Link } from "react-router-dom";
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
import {
  XCircle,
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Crown,
  Play,
  Gift,
} from "lucide-react";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("plan");

  const getPlanDetails = () => {
    if (planType === "yearly") {
      return {
        name: "Plano Anual",
        price: "R$ 199,00",
        period: "por ano",
        savings: "Economize R$ 39,80 (16%)",
      };
    } else {
      return {
        name: "Plano Mensal",
        price: "R$ 19,90",
        period: "por mês",
        savings: null,
      };
    }
  };

  const planDetails = getPlanDetails();

  const reasons = [
    {
      title: "Mudança de plano",
      description: "Quer escolher um plano diferente?",
      action: "Ver todos os planos",
      link: "/pricing",
      icon: CreditCard,
    },
    {
      title: "Dúvidas sobre o serviço",
      description: "Precisa de mais informações?",
      action: "Saiba mais sobre XNEMA",
      link: "/about",
      icon: HelpCircle,
    },
    {
      title: "Problemas técnicos",
      description: "Teve dificuldades no pagamento?",
      action: "Falar com suporte",
      link: "/contact",
      icon: HelpCircle,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Cancelled Header */}
        <section className="py-20 bg-gradient-to-r from-red-900/30 to-xnema-dark">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Pagamento Cancelado
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                Não se preocupe! Você pode tentar novamente quando quiser
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  asChild
                >
                  <Link to="/pricing">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Tentar Novamente
                    </div>
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  asChild
                >
                  <Link to="/dashboard">
                    <div className="flex items-center">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Voltar ao Dashboard
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cancelled Plan Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-xnema-surface border-red-500/30">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-gray-400" />
                    <Badge className="bg-red-500 text-white px-4 py-2 text-lg">
                      CANCELADO
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-gray-300">
                    {planDetails.name} XNEMA
                  </CardTitle>
                  <CardDescription className="text-lg">
                    <span className="text-2xl font-bold text-gray-400">
                      {planDetails.price}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {planDetails.period}
                    </span>
                  </CardDescription>
                  {planDetails.savings && (
                    <div className="mt-2">
                      <Badge className="bg-gray-600 text-gray-300">
                        {planDetails.savings}
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="text-center mb-8">
                    <p className="text-gray-400">
                      O pagamento para este plano foi cancelado. Seus dados
                      estão seguros e nenhuma cobrança foi realizada.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {reasons.map((reason, index) => (
                      <Card
                        key={index}
                        className="bg-xnema-dark border-gray-700"
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-xnema-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <reason.icon className="w-6 h-6 text-xnema-orange" />
                          </div>
                          <h3 className="font-semibold text-white mb-2">
                            {reason.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-4">
                            {reason.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="w-full"
                          >
                            <Link to={reason.link}>{reason.action}</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Still Interested Section */}
        <section className="py-16 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ainda Interessado em{" "}
                <span className="text-xnema-orange">Assinar?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Que tal começar com nossa conta gratuita? Você pode explorar o
                catálogo e fazer upgrade quando quiser.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-xnema-dark border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Conta Gratuita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-gray-300 space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Navegar todo o catálogo
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Ver trailers e informações
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Criar listas de favoritos
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                      asChild
                    >
                      <Link to="/register">Criar Conta Grátis</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-xnema-purple/20 to-xnema-orange/20 border-xnema-purple">
                  <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5" />
                      Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-gray-300 space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Assistir tudo sem limites
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Qualidade 4K e HDR
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Download para offline
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      asChild
                    >
                      <Link to="/pricing">
                        <Gift className="w-4 h-4 mr-2" />7 Dias Grátis
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-xnema-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-center">
                    Precisa de Ajuda?
                  </CardTitle>
                  <CardDescription className="text-center">
                    Nossa equipe está pronta para esclarecer suas dúvidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      asChild
                      className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black"
                    >
                      <Link to="/contact">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Falar com Suporte
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      asChild
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Link to="/about">
                        <Play className="w-4 h-4 mr-2" />
                        Sobre a XNEMA
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-400 mb-4">
                      Nenhuma cobrança foi realizada • Seus dados estão seguros
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <span>Email: suporte@xnema.com.br</span>
                      <span>•</span>
                      <span>Tel: (11) 3456-7890</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
