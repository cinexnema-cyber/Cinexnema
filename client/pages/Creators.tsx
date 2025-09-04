import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, Upload, BarChart3, Users, Crown, MessageCircle, Mail, Phone, Star, Zap, Shield } from "lucide-react";

export default function Creators() {
  const handleWhatsAppContact = () => {
    window.open('https://wa.me/5515997636161', '_blank');
  };

  const handleEmailContact = () => {
    window.open('mailto:cinexnema@gmail.com', '_blank');
  };

  const features = [
    {
      icon: DollarSign,
      title: "70% de Receita para Você",
      description: "Mantenha 70% de toda receita gerada pelo seu conteúdo. Nossa comissão de apenas 30% inclui hospedagem, streaming e suporte técnico."
    },
    {
      icon: Upload,
      title: "Upload Simples",
      description: "Interface intuitiva para upload de vídeos, thumbnails e metadados. Suporte para múltiplos formatos e resoluções até 4K."
    },
    {
      icon: BarChart3,
      title: "Analytics Detalhados",
      description: "Dashboard completo com métricas de visualização, receita, engajamento e dados demográficos da sua audiência."
    },
    {
      icon: Users,
      title: "Audiência Qualificada",
      description: "Acesso a uma base de assinantes engajados que valorizam conteúdo premium e original."
    },
    {
      icon: Crown,
      title: "Conteúdo Premium",
      description: "Seu trabalho será apresentado como conteúdo exclusivo e premium na plataforma XNEMA."
    },
    {
      icon: Shield,
      title: "Proteção de Conteúdo",
      description: "DRM e tecnologias anti-pirataria para proteger seu trabalho contra distribuição não autorizada."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Entre em Contato",
      description: "Fale conosco via WhatsApp ou email para iniciar o processo de cadastro como criador."
    },
    {
      number: "02",
      title: "Análise e Aprovação",
      description: "Nossa equipe analisa seu perfil e portfólio. O processo leva até 5 dias úteis."
    },
    {
      number: "03",
      title: "Configuração da Conta",
      description: "Após aprovação, configuramos sua conta de criador com acesso ao dashboard e ferramentas."
    },
    {
      number: "04",
      title: "Upload de Conteúdo",
      description: "Comece a fazer upload do seu conteúdo e ganhe dinheiro com cada visualização."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-xnema-dark via-background to-xnema-surface" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6">
                Monetize seu <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">Talento</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Junte-se à XNEMA e transforme sua paixão por criar conteúdo em uma fonte de renda.
                <span className="text-xnema-orange font-semibold"> Você fica com 70% da receita</span>, nós cuidamos do resto.
              </p>

              <div className="bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-xnema-orange rounded-full animate-pulse"></div>
                  <span className="text-xnema-orange font-bold text-lg">OPORTUNIDADE ESPECIAL</span>
                  <div className="w-3 h-3 bg-xnema-orange rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  3 Meses Grátis para Novos Criadores!
                </h3>
                <p className="text-lg text-muted-foreground">
                  Aproveite nosso período promocional: <span className="text-xnema-orange font-semibold">publique seu conteúdo sem taxas pelos primeiros 3 meses</span>
                  e comece a gerar renda imediatamente. Após esse período, nossa comissão de apenas 30% entra em vigor.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold text-lg px-8 py-4"
                  asChild
                >
                  <Link to="/creator-login">
                    <Crown className="w-5 h-5 mr-2" />
                    Portal do Criador
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black font-semibold text-lg px-8 py-4"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">70%</div>
                  <div className="text-muted-foreground">Para você</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">4K</div>
                  <div className="text-muted-foreground">Qualidade máxima</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">24/7</div>
                  <div className="text-muted-foreground">Suporte técnico</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Split Highlight */}
        <section className="py-20 bg-gradient-to-r from-xnema-orange to-xnema-purple">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                Divisão de Receita Transparente
              </h2>

              {/* Special Offer Banner */}
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  🎉 OFERTA ESPECIAL DE LANÇAMENTO
                </h3>
                <p className="text-xl text-white/90">
                  <span className="font-bold text-yellow-300">100% da receita para você</span> nos primeiros 3 meses!<br/>
                  Comece a ganhar dinheiro sem taxas.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-6xl font-bold text-yellow-300 mb-4">100%</div>
                  <h3 className="text-2xl font-bold text-black mb-4">Primeiros 3 Meses</h3>
                  <ul className="text-black/80 space-y-2 text-left">
                    <li>• Toda receita é sua</li>
                    <li>• Zero taxas da plataforma</li>
                    <li>• Período para crescer</li>
                    <li>• Suporte completo incluído</li>
                  </ul>
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-6xl font-bold text-black mb-4">70%</div>
                  <h3 className="text-2xl font-bold text-black mb-4">Após 3º Mês</h3>
                  <ul className="text-black/80 space-y-2 text-left">
                    <li>• Receita das visualizações</li>
                    <li>• Monetização de conteúdo</li>
                    <li>• Pagamentos mensais</li>
                    <li>• Crescimento sustentável</li>
                  </ul>
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-6xl font-bold text-black mb-4">30%</div>
                  <h3 className="text-2xl font-bold text-black mb-4">Para a Plataforma</h3>
                  <ul className="text-black/80 space-y-2 text-left">
                    <li>• Hospedagem e infraestrutura</li>
                    <li>• Streaming em 4K</li>
                    <li>• Suporte técnico 24/7</li>
                    <li>• Marketing e promoção</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Por que ser um Criador XNEMA?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Oferecemos as melhores condições do mercado para criadores de conteúdo
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-background rounded-2xl p-8 hover:bg-xnema-surface transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Como se Tornar um Criador
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Processo simples e rápido para começar a monetizar seu conteúdo
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-xl">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Entre em Contato
                </h2>
                <p className="text-xl text-muted-foreground">
                  Pronto para começar? Fale conosco e dê o primeiro passo para monetizar seu talento
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-background rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">WhatsApp</h3>
                  <p className="text-muted-foreground mb-6">
                    Fale conosco diretamente via WhatsApp para um atendimento mais rápido
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                    onClick={handleWhatsAppContact}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    (15) 99763-6161
                  </Button>
                </div>
                
                <div className="bg-background rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-xnema-purple to-xnema-orange rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Email</h3>
                  <p className="text-muted-foreground mb-6">
                    Envie uma mensagem detalhada sobre seu perfil e tipo de conteúdo
                  </p>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black font-semibold"
                    onClick={handleEmailContact}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    cinexnema@gmail.com
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-xnema-dark via-background to-xnema-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Comece a Ganhar Dinheiro Hoje
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se aos criadores que já estão monetizando seu conteúdo na XNEMA. 
              70% da receita é sua, sem carência, pagamentos mensais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold text-lg px-8 py-4"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
