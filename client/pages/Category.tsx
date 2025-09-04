import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Play, Star, Crown, ArrowLeft, Filter } from "lucide-react";

export default function Category() {
  const { categoryId } = useParams();

  const categoryData: { [key: string]: any } = {
    drama: {
      name: "Drama",
      description: "Histórias profundas que exploram a condição humana",
      color: "from-red-500 to-pink-500",
      bgImage: "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=1920&h=1080&fit=crop"
    },
    acao: {
      name: "Ação",
      description: "Adrenalina pura em cada cena",
      color: "from-orange-500 to-red-500",
      bgImage: "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=1920&h=1080&fit=crop"
    },
    "ficcao-cientifica": {
      name: "Ficção Científica",
      description: "O futuro é agora",
      color: "from-blue-500 to-purple-500",
      bgImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop"
    }
  };

  const category = categoryData[categoryId || "drama"] || categoryData.drama;

  const content = [
    {
      id: 1,
      title: "Between Heaven and Hell",
      type: "Série",
      seasons: 7,
      episodes: 84,
      rating: 4.9,
      image: "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=400",
      isPremium: true,
      isExclusive: true
    },
    {
      id: 2,
      title: "Horizonte Infinito",
      type: "Filme",
      duration: "2h 15min",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
      isPremium: true
    },
    {
      id: 3,
      title: "Mistérios da Cidade",
      type: "Filme",
      duration: "1h 45min",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=400&h=600&fit=crop",
      isPremium: true
    },
    {
      id: 4,
      title: "Aventura Selvagem",
      type: "Filme",
      duration: "2h 5min",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
      isPremium: false
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${category.bgImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90" />
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <Link to="/categories">
                  <Button variant="ghost" size="sm" className="mr-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar às Categorias
                  </Button>
                </Link>
                <div className={`px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r ${category.color}`}>
                  {category.name}
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6">
                {category.name}
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                {category.description}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-xnema-surface/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {content.length} títulos encontrados
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                </Button>
                <select className="bg-background border border-xnema-border rounded-lg px-4 py-2 text-foreground">
                  <option>Mais Populares</option>
                  <option>Melhor Avaliados</option>
                  <option>Mais Recentes</option>
                  <option>A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.map((item) => (
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
                      <Button size="sm" className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                        <Play className="w-4 h-4 mr-2" />
                        {item.isPremium ? "Assinar para Assistir" : "Assistir Grátis"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-xnema-orange font-medium">{item.type}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-xnema-orange fill-current" />
                        <span className="text-sm text-muted-foreground">{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.seasons ? `${item.seasons} Temporadas • ${item.episodes} Episódios` : item.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Categories */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Explore Outras Categorias
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(categoryData).map(([id, cat]) => (
                <Link key={id} to={`/category/${id}`}>
                  <Button 
                    variant={categoryId === id ? "default" : "outline"}
                    className={categoryId === id ? "bg-xnema-orange text-black" : ""}
                  >
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
