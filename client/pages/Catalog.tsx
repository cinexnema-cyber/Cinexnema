import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import SubscribeButton from "@/components/SubscribeButton";
import { useContentAccess } from "@/hooks/useContentAccess";
import { Link } from "react-router-dom";
import { Play, Star, Crown, Filter, Search, Lock } from "lucide-react";
import { useState } from "react";

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { hasAccess } = useContentAccess();

  const categories = [
    { id: "all", name: "Todos", count: 24 },
    { id: "series", name: "Séries", count: 8 },
    { id: "filmes", name: "Filmes", count: 12 },
    { id: "documentarios", name: "Documentários", count: 4 },
    { id: "drama", name: "Drama", count: 6 },
    { id: "acao", name: "Ação", count: 5 },
    { id: "scifi", name: "Ficção Científica", count: 3 },
    { id: "romance", name: "Romance", count: 4 },
  ];

  const content = [
    {
      id: 1,
      title: "Between Heaven and Hell",
      type: "Série",
      category: "drama",
      seasons: 7,
      episodes: 84,
      rating: 4.9,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=400",
      isPremium: true,
      isExclusive: true,
    },
    {
      id: 2,
      title: "Horizonte Infinito",
      type: "Filme",
      category: "scifi",
      duration: "2h 15min",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
      isPremium: true,
    },
    {
      id: 3,
      title: "Mistérios da Cidade",
      type: "Filme",
      category: "acao",
      duration: "1h 45min",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=400&h=600&fit=crop",
      isPremium: true,
    },
    {
      id: 4,
      title: "Aventura Selvagem",
      type: "Filme",
      category: "acao",
      duration: "2h 5min",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
      isPremium: false,
    },
    {
      id: 5,
      title: "Romance de Verão",
      type: "Filme",
      category: "romance",
      duration: "1h 52min",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=400&h=600&fit=crop",
      isPremium: true,
    },
    {
      id: 6,
      title: "Cosmos: Documentário",
      type: "Documentário",
      category: "documentarios",
      episodes: 10,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop",
      isPremium: true,
    },
  ];

  const filteredContent =
    selectedCategory === "all"
      ? content
      : content.filter((item) => item.category === selectedCategory);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Universe Background Hero */}
        <section className="relative h-96 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-background/90" />
          <div className="absolute inset-0">
            <div className="absolute top-10 left-20 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-32 w-1 h-1 bg-xnema-orange rounded-full animate-pulse delay-100"></div>
            <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-xnema-purple rounded-full animate-pulse delay-200"></div>
            <div className="absolute top-20 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-32 right-20 w-2 h-2 bg-xnema-orange rounded-full animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6">
              Universo{" "}
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                XNEMA
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Explore nossa galáxia de conteúdo premium. Filmes, séries e
              documentários que vão além do imaginável.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-xnema-surface/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Search */}
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título, gênero, diretor..."
                  className="pl-12 pr-4 py-3 w-full bg-background border border-xnema-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                </Button>
                <Link to="/series">
                  <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                    Outras Séries
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Categorias
            </h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-xnema-orange text-black"
                      : "bg-xnema-surface text-foreground hover:bg-xnema-border"
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                {selectedCategory === "all"
                  ? "Todo o Conteúdo"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-muted-foreground">
                {filteredContent.length} itens encontrados
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-xnema-surface">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {item.isExclusive && (
                        <div className="bg-xnema-purple text-white px-2 py-1 rounded-full text-xs font-semibold">
                          EXCLUSIVA
                        </div>
                      )}
                      {item.isPremium && (
                        <div className="bg-xnema-orange text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Premium</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      {item.isPremium && !hasAccess ? (
                        <SubscribeButton
                          size="sm"
                          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                        >
                          <div className="flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Assinar para Assistir
                          </div>
                        </SubscribeButton>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                          asChild
                        >
                          <Link to={item.type === "Série" ? `/series/${item.id}` : `/watch/${item.id}`}>
                            <div className="flex items-center">
                              <Play className="w-4 h-4 mr-2" />
                              {item.type === "Série" ? "Ver Série" : (item.isPremium ? "Assistir" : "Assistir Grátis")}
                            </div>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-xnema-orange font-medium">
                        {item.type}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-xnema-orange fill-current" />
                        <span className="text-sm text-muted-foreground">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.seasons
                        ? `${item.seasons} Temporadas • ${item.episodes} Episódios`
                        : item.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
