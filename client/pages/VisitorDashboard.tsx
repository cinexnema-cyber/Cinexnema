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
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Play,
  Star,
  Crown,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Lock,
  Info,
  Zap,
  Users,
  TrendingUp,
  Heart,
  Share2,
} from "lucide-react";

export default function VisitorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample content data (in production, would come from API)
  const featuredContent = [
    {
      id: "1",
      title: "Between Heaven and Hell",
      description: "Drama sobrenatural épico sobre a batalha entre bem e mal",
      category: "series",
      year: 2024,
      rating: 9.2,
      duration: "7 temporadas",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=400",
      isExclusive: true,
      isPremium: true,
      views: "2.1M",
      likes: "89K",
    },
    {
      id: "2",
      title: "Mistérios da Cidade",
      description: "Thriller psicológico ambientado no Brasil urbano",
      category: "filme",
      year: 2023,
      rating: 8.7,
      duration: "2h 15min",
      thumbnail:
        "https://images.unsplash.com/photo-1489599639166-9d01aee85cef?w=400&h=600&fit=crop",
      isExclusive: false,
      isPremium: true,
      views: "856K",
      likes: "34K",
    },
    {
      id: "3",
      title: "Horizonte Infinito",
      description: "Ficção científica brasileira de alta qualidade",
      category: "filme",
      year: 2023,
      rating: 8.9,
      duration: "1h 58min",
      thumbnail:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      isExclusive: true,
      isPremium: true,
      views: "1.2M",
      likes: "67K",
    },
    {
      id: "4",
      title: "Família Digital",
      description: "Comédia sobre tecnologia e relacionamentos modernos",
      category: "series",
      year: 2024,
      rating: 8.4,
      duration: "2 temporadas",
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
      isExclusive: false,
      isPremium: false,
      views: "643K",
      likes: "28K",
    },
  ];

  const categories = [
    { id: "all", name: "Todos", count: 24 },
    { id: "series", name: "Séries", count: 8 },
    { id: "filme", name: "Filmes", count: 12 },
    { id: "documentario", name: "Documentários", count: 4 },
  ];

  const stats = [
    { label: "Conteúdo Total", value: "50+", icon: Play },
    { label: "Séries Exclusivas", value: "12", icon: Crown },
    { label: "Horas de Conteúdo", value: "500+", icon: Clock },
    { label: "Usuários Ativos", value: "100K+", icon: Users },
  ];

  const filteredContent =
    selectedCategory === "all"
      ? featuredContent
      : featuredContent.filter((item) => item.category === selectedCategory);

  const searchFilteredContent = searchTerm
    ? filteredContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : filteredContent;

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-xnema-dark via-xnema-surface to-xnema-dark py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="bg-xnema-orange text-black mb-4 px-4 py-2">
                🎬 Explore Gratuitamente
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Descubra o Melhor do
                <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                  {" "}
                  Cinema Brasileiro
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Navegue por nossa biblioteca completa de séries e filmes
                exclusivos. Veja trailers, informações detalhadas e avaliações.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  asChild
                >
                  <Link to="/register">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Criar Conta Grátis
                    </div>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-white"
                  asChild
                >
                  <Link to="/pricing">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Ver Planos Premium
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-xnema-dark border-gray-700 text-center"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-xnema-orange mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 bg-xnema-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar filmes, séries, documentários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-xnema-surface border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={
                        selectedCategory === category.id
                          ? "bg-xnema-orange text-black"
                          : "border-gray-600 text-gray-300"
                      }
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                {selectedCategory === "all"
                  ? "Todo o Conteúdo"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <div className="text-gray-400">
                {searchFilteredContent.length} itens encontrados
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchFilteredContent.map((item) => (
                <Card
                  key={item.id}
                  className="bg-xnema-surface border-gray-700 overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative">
                    <div
                      className="h-64 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.thumbnail})` }}
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.isExclusive && (
                        <Badge className="bg-xnema-orange text-black text-xs">
                          EXCLUSIVO
                        </Badge>
                      )}
                      {item.isPremium && (
                        <Badge className="bg-xnema-purple text-white text-xs">
                          PREMIUM
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-white text-xs font-semibold">
                        {item.rating}
                      </span>
                    </div>

                    {/* Preview Lock Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-xnema-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Lock className="w-8 h-8 text-xnema-orange" />
                        </div>
                        <p className="text-white font-semibold mb-2">
                          Preview Disponível
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={`/series/${item.id}`}>
                              <div className="flex items-center">
                                <Info className="w-4 h-4 mr-1" />
                                Ver Detalhes
                              </div>
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                            asChild
                          >
                            <Link to="/register">
                              <div className="flex items-center">
                                <Crown className="w-4 h-4 mr-1" />
                                Assinar
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          <span>{item.views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-3 h-3" />
                          <span>{item.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-white mb-2 group-hover:text-xnema-orange transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{item.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/series/${item.id}`}>
                          <div className="flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            Detalhes
                          </div>
                        </Link>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="p-1">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {searchFilteredContent.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Nenhum conteúdo encontrado
                </h3>
                <p className="text-gray-400 mb-4">
                  Tente ajustar seus filtros ou termo de busca
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Pronto para Assistir
                <span className="text-xnema-orange"> Sem Limites?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Crie sua conta gratuita e comece a explorar. Faça upgrade para
                Premium e tenha acesso completo a todo nosso catálogo de
                conteúdo exclusivo.
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <Card className="bg-xnema-surface border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xnema-orange">
                      Conta Gratuita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-gray-300 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-500" />
                        Navegar todo o catálogo
                      </li>
                      <li className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-green-500" />
                        Ver detalhes e trailers
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-500" />
                        Criar listas de favoritos
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      asChild
                    >
                      <Link to="/register">Criar Conta Grátis</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-xnema-purple/20 to-xnema-orange/20 border-xnema-purple">
                  <CardHeader>
                    <CardTitle className="text-xnema-purple flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-gray-300 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        Assistir tudo sem limites
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Qualidade 4K e HDR
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        Até 4 perfis familiares
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-xnema-purple hover:bg-xnema-purple/90 text-white"
                      asChild
                    >
                      <Link to="/pricing">Ver Planos Premium</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <p className="text-sm text-gray-400">
                Comece com a conta gratuita • Cancele a qualquer momento • Sem
                taxas ocultas
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
