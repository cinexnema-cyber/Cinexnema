import { Link } from "react-router-dom";
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
  Play,
  Star,
  Crown,
  Users,
  Zap,
  Shield,
  Check,
  Eye,
  Calendar,
  Info,
  Video,
} from "lucide-react";

export default function VisitorLanding() {
  const featuredContent = [
    {
      id: "1",
      title: "Entre o Céu e o Inferno",
      description: "Série exclusiva XNEMA",
      thumbnail:
        "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
      rating: 9.2,
      year: 2024,
      isExclusive: true,
    },
    {
      id: "2",
      title: "Mistérios da Cidade",
      description: "Filme de suspense",
      thumbnail:
        "https://images.unsplash.com/photo-1489599639166-9d01aee85cef?w=400&h=600&fit=crop",
      rating: 8.7,
      year: 2023,
      isExclusive: false,
    },
    {
      id: "3",
      title: "Horizonte Infinito",
      description: "Drama épico",
      thumbnail:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      rating: 8.9,
      year: 2023,
      isExclusive: false,
    },
  ];

  const features = [
    {
      icon: <Play className="w-8 h-8 text-xnema-orange" />,
      title: "Streaming 4K",
      description:
        "Qualidade cinematográfica com resolução 4K e áudio surround",
    },
    {
      icon: <Crown className="w-8 h-8 text-xnema-orange" />,
      title: "Conteúdo Exclusivo",
      description: "Séries e filmes originais que você só encontra no XNEMA",
    },
    {
      icon: <Users className="w-8 h-8 text-xnema-orange" />,
      title: "Para Toda Família",
      description: "Conteúdo curado para todas as idades e gostos",
    },
    {
      icon: <Zap className="w-8 h-8 text-xnema-orange" />,
      title: "Sem Anúncios",
      description: "Experiência imersiva sem interrupções comerciais",
    },
    {
      icon: <Shield className="w-8 h-8 text-xnema-orange" />,
      title: "Downloads Offline",
      description: "Baixe e assista offline em qualquer dispositivo",
    },
    {
      icon: <Star className="w-8 h-8 text-xnema-orange" />,
      title: "Recomendações IA",
      description: "Algoritmo inteligente que aprende suas preferências",
    },
  ];

  const plans = [
    {
      name: "Mensal",
      price: "R$ 19,90",
      period: "/mês",
      features: [
        "Acesso total ao catálogo",
        "Streaming em 4K",
        "Downloads ilimitados",
        "Sem anúncios",
        "Cancelamento a qualquer momento",
      ],
      highlighted: false,
    },
    {
      name: "Anual",
      price: "R$ 199,90",
      period: "/ano",
      originalPrice: "R$ 238,80",
      savings: "Economize 16%",
      features: [
        "Todos os benefícios do plano mensal",
        "2 meses grátis",
        "Suporte prioritário",
        "Acesso antecipado a novos lançamentos",
        "Desconto em produtos parceiros",
      ],
      highlighted: true,
    },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Assinante Premium",
      comment:
        "A qualidade do conteúdo é excepcional! A série 'Entre o Céu e o Inferno' é simplesmente viciante.",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "Família Premium",
      comment:
        "Finalmente um streaming brasileiro de qualidade. Meus filhos adoram e eu também!",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Cinéfila",
      comment:
        "O catálogo de filmes independentes é incrível. Vale cada centavo da assinatura.",
      rating: 5,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-xnema-dark via-xnema-surface to-black py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="bg-xnema-orange text-white mb-6 px-4 py-2 text-sm">
                🎬 Streaming Premium
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Bem-vindo ao
                <span className="text-xnema-orange"> XNEMA</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                A nova era do entretenimento brasileiro chegou. Descubra séries
                exclusivas, filmes originais e conteúdo premium que você não
                encontra em nenhum outro lugar.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90"
                  asChild
                >
                  <Link to="/register">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Começar Grátis
                    </div>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                  asChild
                >
                  <Link to="/catalog">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Explorar Catálogo
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Conteúdo em Destaque</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça alguns dos nossos títulos mais populares e exclusivos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredContent.map((item) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" variant="secondary" asChild>
                        <Link to="/register">
                          <div className="flex items-center">
                            <Play className="w-4 h-4 mr-2" />
                            Assinar para Assistir
                          </div>
                        </Link>
                      </Button>
                    </div>
                    {item.isExclusive && (
                      <Badge className="absolute top-3 left-3 bg-xnema-orange">
                        Exclusivo XNEMA
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.year}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Por que Escolher o XNEMA?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tecnologia de ponta e conteúdo exclusivo para uma experiência
                única
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Planos Simples e Transparentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Escolha o plano que melhor se adequa ao seu perfil
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${plan.highlighted ? "border-xnema-orange shadow-xl scale-105" : ""}`}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-xnema-orange">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-center">
                        <span className="text-sm text-muted-foreground line-through">
                          {plan.originalPrice}
                        </span>
                        <Badge className="ml-2 bg-green-500">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.highlighted ? "bg-xnema-orange hover:bg-xnema-orange/90" : ""}`}
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link to="/register">Escolher {plan.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                O que Nossos Usuários Dizem
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Milhares de pessoas já fazem parte da família XNEMA
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.comment}"
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-xnema-orange to-xnema-purple">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para Começar sua Jornada?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já descobriram o futuro do
              streaming brasileiro. Cancele quando quiser, sem compromisso.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Assinar Agora
                  </div>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                asChild
              >
                <Link to="/catalog">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Ver Catálogo
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
