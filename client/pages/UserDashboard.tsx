import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  Play,
  Star,
  Eye,
  Heart,
  Clock,
  TrendingUp,
  Lock,
  Gift,
  Zap,
  Users,
  Calendar,
  Info,
  Settings,
  CreditCard,
  Bell,
  BookOpen,
} from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [watchLater, setWatchLater] = useState([]);

  // Sample content for browsing (users can see but not watch)
  const popularContent = [
    {
      id: "1",
      title: "Between Heaven and Hell",
      description: "Drama sobrenatural épico",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=300",
      rating: 9.2,
      category: "Série",
      isPremium: true,
      views: "2.1M",
    },
    {
      id: "2",
      title: "Mistérios da Cidade",
      description: "Thriller psicológico brasileiro",
      thumbnail:
        "https://images.unsplash.com/photo-1489599639166-9d01aee85cef?w=300&h=400&fit=crop",
      rating: 8.7,
      category: "Filme",
      isPremium: true,
      views: "856K",
    },
    {
      id: "3",
      title: "Horizonte Infinito",
      description: "Ficção científica nacional",
      thumbnail:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop",
      rating: 8.9,
      category: "Filme",
      isPremium: true,
      views: "1.2M",
    },
  ];

  const freeFeatures = [
    { icon: Eye, text: "Navegar catálogo completo", available: true },
    { icon: Info, text: "Ver trailers e informações", available: true },
    { icon: Heart, text: "Adicionar à lista de desejos", available: true },
    { icon: BookOpen, text: "Ler resenhas e avaliações", available: true },
    { icon: Play, text: "Assistir conteúdo completo", available: false },
    { icon: TrendingUp, text: "Qualidade 4K/HDR", available: false },
    { icon: Users, text: "Múltiplos perfis", available: false },
    { icon: Zap, text: "Sem anúncios", available: false },
  ];

  const plans = [
    {
      name: "Mensal",
      price: "R$ 19,90",
      period: "/mês",
      description: "Acesso completo por 30 dias",
      highlight: false,
      features: [
        "Catálogo completo",
        "Qualidade 4K",
        "Sem anúncios",
        "2 telas simultâneas",
      ],
    },
    {
      name: "Anual",
      price: "R$ 199,00",
      period: "/ano",
      originalPrice: "R$ 238,80",
      description: "Economize 2 meses pagando anual",
      highlight: true,
      features: [
        "Catálogo completo",
        "Qualidade 4K",
        "Sem anúncios",
        "4 telas simultâneas",
        "Download offline",
      ],
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-xnema-dark via-xnema-surface to-xnema-dark py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Olá, {user?.displayName || user?.username}! 👋
                </h1>
                <p className="text-gray-300">
                  Você está explorando com uma conta gratuita
                </p>
              </div>
              <Badge className="bg-blue-500 text-white px-3 py-1">
                Usuário Gratuito
              </Badge>
            </div>
          </div>
        </section>

        {/* Premium Upgrade Banner */}
        <section className="py-6 bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border-y border-xnema-orange/30">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10 border-xnema-orange/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-xnema-orange mb-1">
                        Desbloqueie Todo o Conteúdo
                      </h3>
                      <p className="text-gray-300">
                        Assista séries e filmes completos em qualidade 4K sem
                        anúncios
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-xnema-orange mb-1">
                      7 dias
                    </div>
                    <div className="text-sm text-gray-400">grátis</div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                    asChild
                  >
                    <Link to="/pricing">
                      <div className="flex items-center">
                        <Gift className="w-5 h-5 mr-2" />
                        Começar Teste
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Popular Content */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-xnema-orange" />
                    Conteúdo Popular
                  </CardTitle>
                  <CardDescription>
                    Explore o que está em alta (preview disponível)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularContent.map((item) => (
                      <div key={item.id} className="group relative">
                        <div className="relative rounded-lg overflow-hidden">
                          <div
                            className="h-48 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${item.thumbnail})`,
                            }}
                          />

                          {/* Lock Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-8 h-8 text-xnema-orange mx-auto mb-2" />
                              <p className="text-white font-semibold text-sm mb-3">
                                Premium Necessário
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="secondary" asChild>
                                  <Link to={`/series/${item.id}`}>
                                    <Info className="w-3 h-3 mr-1" />
                                    Detalhes
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                                  asChild
                                >
                                  <Link to="/pricing">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Assinar
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                            <div className="flex items-center justify-between text-white text-xs mb-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                <span>{item.rating}</span>
                              </div>
                              <Badge className="bg-xnema-purple text-white text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            <span>{item.views} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features Comparison */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle>O que você pode fazer</CardTitle>
                  <CardDescription>
                    Veja as diferenças entre conta gratuita e premium
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {freeFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <feature.icon
                            className={`w-5 h-5 ${feature.available ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span
                            className={
                              feature.available ? "text-white" : "text-gray-400"
                            }
                          >
                            {feature.text}
                          </span>
                        </div>
                        {feature.available ? (
                          <Badge className="bg-green-500 text-white text-xs">
                            Incluído
                          </Badge>
                        ) : (
                          <Badge className="bg-xnema-orange text-black text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Sua Atividade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Conteúdo navegado</span>
                    <span className="font-semibold text-xnema-orange">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Lista de desejos</span>
                    <span className="font-semibold text-xnema-orange">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tempo na plataforma</span>
                    <span className="font-semibold text-xnema-orange">
                      2h 30m
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link to="/edit-profile">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Plans */}
              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`border-gray-700 ${plan.highlight ? "bg-gradient-to-br from-xnema-purple/20 to-xnema-orange/20 border-xnema-orange" : "bg-xnema-surface"}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.highlight && (
                          <Badge className="bg-xnema-orange text-black text-xs">
                            Mais Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-xnema-orange">
                            {plan.price}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {plan.period}
                          </span>
                        </div>
                        {plan.originalPrice && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 line-through">
                              {plan.originalPrice}
                            </span>
                            <Badge className="bg-green-500 text-white text-xs">
                              Economize 16%
                            </Badge>
                          </div>
                        )}
                      </div>

                      <ul className="text-sm text-gray-300 space-y-1 mb-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-xnema-orange rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.highlight ? "bg-xnema-orange hover:bg-xnema-orange/90 text-black" : "bg-xnema-purple hover:bg-xnema-purple/90"}`}
                        asChild
                      >
                        <Link to="/pricing">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Assinar {plan.name}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Link to="/series">
                      <Eye className="w-4 h-4 mr-2" />
                      Explorar Séries
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Link to="/categories">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Categorias
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Link to="/about">
                      <Info className="w-4 h-4 mr-2" />
                      Sobre a XNEMA
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Link to="/contact">
                      <Bell className="w-4 h-4 mr-2" />
                      Contato
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
