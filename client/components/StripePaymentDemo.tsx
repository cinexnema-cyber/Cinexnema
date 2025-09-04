import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SubscribeButton from "./SubscribeButton";
import { Crown, Video, Users } from "lucide-react";

const StripePaymentDemo: React.FC = () => {
  // IDs de preços fictícios - em produção, estes viriam do Stripe Dashboard
  const PRICE_IDS = {
    monthly: "price_monthly_1990", // R$ 19,90/mês
    yearly: "price_yearly_19900", // R$ 199,00/ano
    individual: "price_individual_590", // R$ 5,90 por vídeo
  };

  const handlePaymentSuccess = () => {
    console.log("✅ Pagamento realizado com sucesso!");
  };

  const handlePaymentError = (error: string) => {
    console.error("❌ Erro no pagamento:", error);
    alert(`Erro: ${error}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Sistema de Pagamentos <span className="text-xnema-orange">XNEMA</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Demonstração da integração Stripe com sistema de comissões
          automáticas. 70% do valor vai para o criador, 30% para a plataforma.
        </p>
      </div>

      {/* Planos de Assinatura da Plataforma */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Planos de Assinatura da Plataforma
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plano Mensal */}
          <Card className="bg-xnema-surface border-xnema-border relative">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Plano Mensal</CardTitle>
              <CardDescription>Acesso completo por 30 dias</CardDescription>
              <div className="text-3xl font-bold text-xnema-orange">
                R$ 19,90<span className="text-sm text-gray-500">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Catálogo completo de séries e filmes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Qualidade 4K e HDR
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Sem anúncios
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>2
                  telas simultâneas
                </li>
              </ul>

              <SubscribeButton
                priceId={PRICE_IDS.monthly}
                planType="monthly"
                amount={1990}
                variant="premium"
                description="Renovação automática"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card className="bg-xnema-surface border-xnema-border relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 text-white px-4 py-1">
                🔥 Mais Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Plano Anual</CardTitle>
              <CardDescription>Acesso completo por 12 meses</CardDescription>
              <div className="text-3xl font-bold text-green-400">
                R$ 199,00<span className="text-sm text-gray-500">/ano</span>
              </div>
              <div className="text-sm text-green-500 font-medium">
                Economize R$ 39,80 (16% de desconto)
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Tudo do plano mensal
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>4
                  telas simultâneas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Download para assistir offline
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Acesso antecipado a lançamentos
                </li>
              </ul>

              <SubscribeButton
                priceId={PRICE_IDS.yearly}
                planType="yearly"
                amount={19900}
                variant="premium"
                description="Pagamento único anual"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compra Individual de Conteúdo */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Compra Individual de Conteúdo
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Exemplo: Episódio Individual */}
          <Card className="bg-xnema-surface border-xnema-border">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Episódio Especial</CardTitle>
              <CardDescription>Between Heaven and Hell - EP 01</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-4">
                R$ 5,90
              </div>

              <SubscribeButton
                priceId={PRICE_IDS.individual}
                creatorId="creator_123"
                videoId="video_456"
                planType="individual"
                amount={590}
                variant="creator"
                size="sm"
                description="Acesso permanente"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </CardContent>
          </Card>

          {/* Exemplo: Série Completa */}
          <Card className="bg-xnema-surface border-xnema-border">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Série Completa</CardTitle>
              <CardDescription>Temporada 1 - 12 episódios</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-4">
                R$ 29,90
              </div>

              <SubscribeButton
                priceId="price_serie_2990"
                creatorId="creator_123"
                videoId="serie_789"
                planType="individual"
                amount={2990}
                variant="creator"
                size="sm"
                description="Todos os episódios"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </CardContent>
          </Card>

          {/* Exemplo: Apoio ao Criador */}
          <Card className="bg-xnema-surface border-xnema-border">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg">❤️</span>
              </div>
              <CardTitle className="text-lg">Apoio ao Criador</CardTitle>
              <CardDescription>Contribuição direta</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-4">
                R$ 10,00
              </div>

              <SubscribeButton
                priceId="price_support_1000"
                creatorId="creator_123"
                planType="individual"
                amount={1000}
                variant="creator"
                size="sm"
                description="70% vai para o criador"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Informações do Sistema */}
      <section className="bg-xnema-surface/50 rounded-lg p-6 border border-xnema-border">
        <h3 className="text-lg font-semibold mb-4 text-center">
          🔧 Como Funciona o Sistema de Comissões
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">💳</div>
            <h4 className="font-medium mb-2">1. Pagamento</h4>
            <p className="text-gray-600">
              Cliente realiza pagamento via Stripe com cartão, PIX ou outros
              métodos
            </p>
          </div>

          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium mb-2">2. Divisão Automática</h4>
            <p className="text-gray-600">
              Sistema calcula automaticamente: 70% criador + 30% plataforma
            </p>
          </div>

          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-medium mb-2">3. Saldo Disponível</h4>
            <p className="text-gray-600">
              Criador pode sacar comissões acumuladas via dashboard
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StripePaymentDemo;
