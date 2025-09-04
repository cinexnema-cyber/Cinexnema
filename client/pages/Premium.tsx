import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Play, Crown, Star, Users, Zap, Shield, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Premium() {
  const { t } = useLanguage();

  const plans = [
    {
      id: 'monthly',
      name: t('subscription.monthly'),
      price: 19.90,
      duration: 'mês',
      features: [
        'Acesso total à série "Between Heaven and Hell"',
        'Todos os filmes e séries exclusivas',
        'Qualidade 4K sem an��ncios',
        'Assista em múltiplos dispositivos',
        'Downloads para assistir offline'
      ]
    },
    {
      id: 'yearly',
      name: t('subscription.yearly'),
      price: 199.90,
      duration: 'ano',
      discount: 'Economize 16%',
      features: [
        'Todos os benefícios do plano mensal',
        '2 meses grátis inclusos',
        'Acesso prioritário a novos conteúdos',
        'Suporte premium 24/7',
        'Perfis familiares (até 5 usuários)'
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-xnema-dark via-xnema-surface to-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Crown className="w-8 h-8 text-xnema-orange" />
              <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                XNEMA Premium
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Desbloqueie todo o universo XNEMA com acesso completo a séries exclusivas, 
              filmes originais e conteúdo premium em qualidade 4K.
            </p>

            <div className="flex items-center justify-center space-x-8 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-xnema-orange" />
                <span>+15.000 assinantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-xnema-orange" />
                <span>4.9/5 avaliação</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-xnema-orange" />
                <span>Streaming 4K</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-xnema-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece com 7 dias grátis. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.id === 'yearly' ? 'border-xnema-orange bg-gradient-to-br from-xnema-orange/5 to-xnema-purple/5' : ''}`}>
                {plan.id === 'yearly' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-xnema-orange text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">/{plan.duration}</span>
                  </div>
                  {plan.discount && (
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium inline-block">
                      {plan.discount}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-xnema-orange rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${plan.id === 'yearly' ? 'bg-xnema-orange hover:bg-xnema-orange/90 text-black' : 'bg-xnema-purple hover:bg-xnema-purple/90'}`}
                    size="lg"
                  >
                    <Link to="/register" state={{ plan: plan.id }}>
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        Começar Agora
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-xnema-orange hover:underline">
                Fazer login
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              ✓ 7 dias grátis ✓ Sem compromisso ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Por que XNEMA Premium?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-xnema-surface rounded-2xl border border-xnema-border">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Streaming 4K
              </h3>
              <p className="text-muted-foreground">
                Qualidade ultra HD com tecnologia adaptativa para a melhor experiência visual
              </p>
            </div>

            <div className="text-center p-8 bg-xnema-surface rounded-2xl border border-xnema-border">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-purple to-xnema-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Conteúdo Exclusivo
              </h3>
              <p className="text-muted-foreground">
                Séries e filmes originais que você não encontra em nenhum outro lugar
              </p>
            </div>

            <div className="text-center p-8 bg-xnema-surface rounded-2xl border border-xnema-border">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Sem Anúncios
              </h3>
              <p className="text-muted-foreground">
                Experiência premium livre de publicidade e interrupções
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-xnema-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como funciona o período grátis?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Você tem 7 dias para experimentar todos os recursos premium gratuitamente. 
                  Pode cancelar a qualquer momento durante este período sem cobrança.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Posso cancelar quando quiser?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Você pode cancelar sua assinatura a qualquer momento através do seu painel de usuário. 
                  Não há multas ou taxas de cancelamento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Em quantos dispositivos posso assistir?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Com o plano mensal você pode assistir em até 2 dispositivos simultaneamente. 
                  O plano anual permite até 5 dispositivos e perfis familiares.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
