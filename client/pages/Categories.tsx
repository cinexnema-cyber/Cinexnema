import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Star, Crown } from "lucide-react";

export default function Categories() {
  const categories = [
    {
      id: "drama",
      name: "Drama",
      description: "Histórias profundas que tocam o coração",
      color: "from-red-500 to-pink-500",
      count: 12,
      featured: {
        title: "Between Heaven and Hell",
        image: "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=400",
        rating: 4.9
      }
    },
    {
      id: "acao",
      name: "Ação",
      description: "Adrenalina pura em cada cena",
      color: "from-orange-500 to-red-500",
      count: 8,
      featured: {
        title: "Cidade das Sombras",
        image: "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=400&h=600&fit=crop",
        rating: 4.7
      }
    },
    {
      id: "ficcao-cientifica",
      name: "Ficção Científica",
      description: "O futuro é agora",
      color: "from-blue-500 to-purple-500",
      count: 6,
      featured: {
        title: "Tempo Perdido",
        image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
        rating: 4.6
      }
    },
    {
      id: "romance",
      name: "Romance",
      description: "Histórias de amor que emocionam",
      color: "from-pink-500 to-rose-500",
      count: 5,
      featured: {
        title: "Romance de Verão",
        image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=400&h=600&fit=crop",
        rating: 4.5
      }
    },
    {
      id: "thriller",
      name: "Thriller",
      description: "Suspense de tirar o fôlego",
      color: "from-gray-700 to-gray-900",
      count: 7,
      featured: {
        title: "Mistérios Urbanos",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
        rating: 4.8
      }
    },
    {
      id: "documentario",
      name: "Documentário",
      description: "A realidade em suas múltiplas faces",
      color: "from-green-500 to-emerald-500",
      count: 4,
      featured: {
        title: "Amazônia Secreta",
        image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop",
        rating: 4.9
      }
    },
    {
      id: "comedia",
      name: "Comédia",
      description: "Entretenimento para toda família",
      color: "from-yellow-500 to-orange-500",
      count: 3,
      featured: {
        title: "Família Digital",
        image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=400&h=600&fit=crop",
        rating: 4.4
      }
    },
    {
      id: "historia",
      name: "Histórico",
      description: "Reviva grandes momentos da história",
      color: "from-amber-600 to-yellow-600",
      count: 5,
      featured: {
        title: "Raízes Brasileiras",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
        rating: 4.8
      }
    }
  ];

  const exclusiveContent = [
    {
      title: "Between Heaven and Hell",
      type: "Série Exclusiva",
      seasons: 7,
      image: "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=300",
      rating: 4.9
    },
    {
      title: "Amazônia Secreta",
      type: "Documentário Original",
      episodes: 8,
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=400&fit=crop",
      rating: 4.9
    },
    {
      title: "Cidade das Sombras",
      type: "Thriller Nacional",
      seasons: 3,
      image: "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=300&h=400&fit=crop",
      rating: 4.7
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
                Explore por <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">Categoria</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Descubra conteúdo organizado por gêneros. Do drama à ficção científica, temos algo especial para cada momento.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">8</div>
                  <div className="text-muted-foreground">Categorias</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">50+</div>
                  <div className="text-muted-foreground">Títulos</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">4K</div>
                  <div className="text-muted-foreground">Qualidade</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {categories.map((category) => (
                <Link key={category.id} to={`/category/${category.id}`}>
                  <div className="group cursor-pointer bg-xnema-surface rounded-2xl overflow-hidden hover:bg-background transition-all hover:scale-105">
                    <div className="grid grid-cols-5 h-48">
                      {/* Featured Image */}
                      <div className="col-span-2 relative overflow-hidden">
                        <img
                          src={category.featured.image}
                          alt={category.featured.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                        
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center space-x-1 text-white">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-semibold">{category.featured.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="col-span-3 p-6 flex flex-col justify-between">
                        <div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category.color} mb-3`}>
                            {category.count} títulos
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">{category.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Destaque: {category.featured.title}</span>
                          <ArrowRight className="w-5 h-5 text-xnema-orange group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Exclusive Content Highlight */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Conteúdo Exclusivo XNEMA
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Produções originais que você só encontra aqui
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {exclusiveContent.map((content, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-background mb-4">
                    <img
                      src={content.image}
                      alt={content.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute top-3 right-3">
                      <div className="bg-xnema-purple text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>EXCLUSIVO</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <Button size="sm" className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                        <Play className="w-4 h-4 mr-2" />
                        Assistir Agora
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-xnema-orange font-medium">{content.type}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-xnema-orange fill-current" />
                        <span className="text-sm text-muted-foreground">{content.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {content.seasons ? `${content.seasons} Temporadas` : `${content.episodes} Episódios`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-xnema-orange to-xnema-purple">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Acesse Todo o Catálogo
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Assine agora e tenha acesso completo a todas as categorias e conteúdo exclusivo da XNEMA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-black text-white hover:bg-gray-900 border-black font-semibold text-lg px-8 py-4" asChild>
                <Link to="/subscribe">
                  Assinar Premium
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/20 text-black hover:bg-white/30 border-black font-semibold text-lg px-8 py-4" asChild>
                <Link to="/catalog">
                  Explorar Catálogo
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
