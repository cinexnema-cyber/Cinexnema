import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Star, Calendar, Clock, Eye, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Series() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Dados das séries da plataforma
  const seriesList = [
    {
      id: 1,
      title: "Between Heaven and Hell",
      description: "Uma saga épica que explora os limites entre o bem e o mal, onde anjos e demônios coexistem em um mundo moderno.",
      shortDescription: "Drama sobrenatural sobre anjos e demônios no mundo moderno",
      genre: "Drama Sobrenatural",
      rating: 4.9,
      seasons: 7,
      episodes: 84,
      releaseYear: 2025,
      status: "Em Produção",
      image: "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=800",
      isAvailable: true,
      isExclusive: true,
      views: "2.1M"
    },
    {
      id: 2,
      title: "Mysteries of the Night",
      description: "Uma série de suspense psicológico que acompanha detetives investigando crimes sobrenaturais em uma cidade onde a realidade e o pesadelo se confundem.",
      shortDescription: "Suspense psicológico com elementos sobrenaturais",
      genre: "Suspense/Terror",
      rating: 4.7,
      seasons: 4,
      episodes: 48,
      releaseYear: 2025,
      status: "Pré-produção",
      image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=600&fit=crop",
      isAvailable: false,
      isExclusive: true,
      views: "800K"
    },
    {
      id: 3,
      title: "Raízes Brasileiras",
      description: "Uma saga histórica que retrata a formação do Brasil através de cinco gerações de uma família, explorando tradições, lutas e conquistas do povo brasileiro.",
      shortDescription: "Drama histórico sobre a formação do Brasil",
      genre: "Drama Histórico",
      rating: 4.8,
      seasons: 5,
      episodes: 60,
      releaseYear: 2025,
      status: "Roteiro",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
      isAvailable: false,
      isExclusive: true,
      views: "1.2M"
    },
    {
      id: 4,
      title: "Cyber Futures",
      description: "No ano 2080, a humanidade vive em megacidades conectadas. Acompanhe hackers, androides e rebeldes lutando contra corporações que controlam a tecnologia.",
      shortDescription: "Ficção científica cyberpunk futurista",
      genre: "Ficção Científica",
      rating: 4.6,
      seasons: 3,
      episodes: 36,
      releaseYear: 2026,
      status: "Desenvolvimento",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      isAvailable: false,
      isExclusive: true,
      views: "950K"
    },
    {
      id: 5,
      title: "Família Digital",
      description: "Uma comédia contemporânea que retrata de forma divertida e tocante como a tecnologia impacta os relacionamentos familiares modernos.",
      shortDescription: "Comédia sobre tecnologia e relacionamentos",
      genre: "Comédia",
      rating: 4.4,
      seasons: 2,
      episodes: 24,
      releaseYear: 2025,
      status: "Pós-produção",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      isAvailable: false,
      isExclusive: false,
      views: "650K"
    },
    {
      id: 6,
      title: "Ocean Depths",
      description: "Exploradores marinhos descobrem civilizações perdidas nas profundezas do oceano, revelando segredos que podem mudar o destino da humanidade.",
      shortDescription: "Aventura submarina com mistérios antigos",
      genre: "Aventura/Mistério",
      rating: 4.5,
      seasons: 3,
      episodes: 30,
      releaseYear: 2026,
      status: "Conceito",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      isAvailable: false,
      isExclusive: true,
      views: "420K"
    }
  ];

  // Auto-rotation do carrossel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % seriesList.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, seriesList.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % seriesList.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + seriesList.length) % seriesList.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSeries = seriesList[currentSlide];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Produção": return "bg-green-500";
      case "Pré-produção": return "bg-yellow-500";
      case "Pós-produção": return "bg-blue-500";
      case "Roteiro": return "bg-purple-500";
      case "Desenvolvimento": return "bg-orange-500";
      case "Conceito": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Carousel Section */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Image with Parallax Effect */}
          <div 
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${currentSeries.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${1.1 + currentSlide * 0.02})`
            }}
          />

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-8">
              <div className="max-w-4xl">
                {/* Series Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-xnema-orange text-black px-3 py-1">
                      SÉRIE XNEMA
                    </Badge>
                    {currentSeries.isExclusive && (
                      <Badge className="bg-gradient-to-r from-xnema-purple to-xnema-orange text-white px-3 py-1">
                        EXCLUSIVO
                      </Badge>
                    )}
                    <Badge className={`${getStatusColor(currentSeries.status)} text-white px-3 py-1`}>
                      {currentSeries.status}
                    </Badge>
                  </div>

                  <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {currentSeries.title}
                  </h1>

                  <div className="flex items-center gap-6 text-lg mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{currentSeries.rating}</span>
                    </div>
                    <span>{currentSeries.genre}</span>
                    <span>{currentSeries.releaseYear}</span>
                    <span>{currentSeries.seasons} temporadas</span>
                    <span>{currentSeries.episodes} episódios</span>
                  </div>

                  <p className="text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
                    {currentSeries.description}
                  </p>

                  <div className="flex items-center gap-4 mb-8">
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold text-lg px-8 py-4"
                      asChild
                    >
                      <Link to={`/series/${currentSeries.id}`}>
                        <div className="flex items-center">
                          <Info className="w-6 h-6 mr-2" />
                          Ver Detalhes
                        </div>
                      </Link>
                    </Button>

                    {currentSeries.isAvailable && user ? (
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4"
                        asChild
                      >
                        <Link to="/between-heaven-hell">
                          <div className="flex items-center">
                            <Play className="w-6 h-6 mr-2" />
                            Assistir Agora
                          </div>
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4"
                        asChild
                      >
                        <Link to="/register">
                          <div className="flex items-center">
                            <Eye className="w-6 h-6 mr-2" />
                            {currentSeries.isAvailable ? 'Criar Conta' : 'Notificar Lançamento'}
                          </div>
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{currentSeries.views} visualizações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Lançamento: {currentSeries.releaseYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>~45min por episódio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute inset-y-0 left-4 flex items-center z-20">
            <Button
              variant="ghost"
              size="lg"
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-4 flex items-center z-20">
            <Button
              variant="ghost"
              size="lg"
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex gap-3">
              {seriesList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-xnema-orange scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Series Counter */}
          <div className="absolute bottom-8 right-8 z-20 text-white/70">
            <span className="text-lg">
              {String(currentSlide + 1).padStart(2, '0')} / {String(seriesList.length).padStart(2, '0')}
            </span>
          </div>
        </section>

        {/* Series Grid Section */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-16">
              Todas as <span className="text-xnema-orange">Séries XNEMA</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seriesList.map((series) => (
                <Card key={series.id} className="bg-xnema-dark border-gray-700 overflow-hidden group hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${series.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getStatusColor(series.status)} text-white text-xs`}>
                        {series.status}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-white text-xs font-semibold">{series.rating}</span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="lg"
                        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black rounded-full w-16 h-16"
                        asChild
                      >
                        <Link to={`/series/${series.id}`}>
                          <Info className="w-6 h-6" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-xnema-orange transition-colors">
                      {series.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{series.shortDescription}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{series.genre}</span>
                      <span>{series.seasons} temporadas</span>
                      <span>{series.releaseYear}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{series.views}</span>
                      </div>
                      
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/series/${series.id}`}>
                          Ver Mais
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10">
          <div className="container mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para <span className="text-xnema-orange">Assistir?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Crie sua conta gratuitamente e comece a explorar o melhor do entretenimento brasileiro.
            </p>
            <Button size="lg" className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold" asChild>
              <Link to="/register">
                <div className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora
                </div>
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
