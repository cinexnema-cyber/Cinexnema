import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Star, Calendar, Clock, Search, Eye, Lock, Crown, Info } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number;
  duration: string;
  rating: number;
  thumbnail: string;
  trailerUrl: string;
  isExclusive: boolean;
  isPremium: boolean;
  synopsis: string;
  cast: string[];
  director: string;
  genres: string[];
}

export default function PublicCatalog() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dados simulados do catálogo (em produção, viriam da API)
  const [content] = useState<ContentItem[]>([
    {
      id: "1",
      title: "Entre o Céu e o Inferno",
      description: "Série exclusiva XNEMA que explora os limites entre o bem e o mal",
      category: "series",
      year: 2024,
      duration: "8 episódios",
      rating: 9.2,
      thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=400&fit=crop",
      trailerUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      isExclusive: true,
      isPremium: true,
      synopsis: "Em uma realidade onde as fronteiras entre o céu e o inferno se confundem, nossa série exclusiva acompanha personagens extraordinários navegando por dilemas morais complexos. Com produção cinematográfica de alta qualidade e roteiro envolvente, esta é a série que definirá o futuro do streaming brasileiro.",
      cast: ["Ana Silva", "Carlos Santos", "Marina Oliveira"],
      director: "Roberto Fernandes",
      genres: ["Drama", "Fantasia", "Suspense"]
    },
    {
      id: "2", 
      title: "Mistérios da Cidade",
      description: "Filme de suspense que retrata os segredos ocultos de uma metrópole",
      category: "filme",
      year: 2023,
      duration: "2h 15min",
      rating: 8.7,
      thumbnail: "https://images.unsplash.com/photo-1489599639166-9d01aee85cef?w=300&h=400&fit=crop",
      trailerUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      isExclusive: false,
      isPremium: true,
      synopsis: "Um detetive veterano se vê envolvido em uma trama que vai muito além de um simples caso criminal. Enquanto investiga uma série de eventos misteriosos, ele descobre que sua própria cidade guarda segredos que podem mudar tudo que ele acreditava saber.",
      cast: ["João Pereira", "Luciana Costa", "Miguel Rodrigues"],
      director: "Patricia Lima",
      genres: ["Suspense", "Drama", "Mistério"]
    },
    {
      id: "3",
      title: "Horizonte Infinito",
      description: "Drama épico sobre jornadas de autodescoberta e superação",
      category: "filme", 
      year: 2023,
      duration: "1h 58min",
      rating: 8.9,
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop",
      trailerUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      isExclusive: false,
      isPremium: true,
      synopsis: "Uma narrativa poderosa sobre cinco pessoas de diferentes origens que se encontram em uma jornada inesperada. Cada personagem enfrenta seus próprios desafios pessoais enquanto descobrem que suas vidas estão mais conectadas do que imaginavam.",
      cast: ["Rafael Santos", "Camila Nascimento", "Eduardo Silva"],
      director: "Fernando Alves",
      genres: ["Drama", "Aventura", "Inspiracional"]
    },
    {
      id: "4",
      title: "Comédia Urbana",
      description: "Série hilária que retrata o cotidiano brasileiro com muito humor",
      category: "series",
      year: 2024,
      duration: "12 episódios",
      rating: 8.1,
      thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=400&fit=crop",
      trailerUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      isExclusive: false,
      isPremium: true,
      synopsis: "Uma comédia refrescante que acompanha um grupo de amigos navegando pela vida adulta na cidade grande. Com situações hilariantes e personagens carismáticos, a série oferece uma visão bem-humorada dos desafios cotidianos.",
      cast: ["Bruno Costa", "Amanda Ferreira", "Thiago Mendes"],
      director: "Julia Martins",
      genres: ["Comédia", "Romance", "Slice of Life"]
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'series', name: 'Séries' },
    { id: 'filme', name: 'Filmes' },
  ];

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSubscriber = user?.assinante || user?.role === 'subscriber' || user?.role === 'admin';

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={item.thumbnail} 
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mr-2">
                <Info className="w-4 h-4 mr-2" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {item.title}
                  {item.isExclusive && (
                    <Badge className="bg-xnema-orange">Exclusivo XNEMA</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  <div className="space-y-4 mt-4">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {item.rating}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Sinopse</h4>
                      <p className="text-sm text-muted-foreground">{item.synopsis}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Elenco Principal</h4>
                      <p className="text-sm text-muted-foreground">{item.cast.join(', ')}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Direção</h4>
                      <p className="text-sm text-muted-foreground">{item.director}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Gêneros</h4>
                      <div className="flex gap-2 flex-wrap">
                        {item.genres.map(genre => (
                          <Badge key={genre} variant="outline">{genre}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Trailer
                      </Button>

                      {item.category === 'series' ? (
                        <Button size="sm" asChild>
                          <Link to={`/series/${item.id}`}>
                            <div className="flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Ver Série
                            </div>
                          </Link>
                        </Button>
                      ) : isSubscriber ? (
                        <Button size="sm" asChild>
                          <Link to={`/watch/${item.id}`}>
                            <div className="flex items-center">
                              <Play className="w-4 h-4 mr-2" />
                              Assistir
                            </div>
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" asChild>
                          <Link to="/register">
                            <div className="flex items-center">
                              <Crown className="w-4 h-4 mr-2" />
                              Assinar para Assistir
                            </div>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          
          {!isSubscriber && (
            <div className="absolute top-2 right-2">
              <Lock className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        {item.isExclusive && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-xnema-orange">Exclusivo</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg group-hover:text-xnema-orange transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{item.rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{item.year}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{item.duration}</span>
          </div>
          
          {!isSubscriber && item.isPremium && (
            <Badge variant="outline" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Catálogo XNEMA
              </h1>
              <p className="text-muted-foreground text-lg">
                Descubra nossos filmes e séries exclusivos
              </p>
              {!isSubscriber && (
                <div className="mt-4">
                  <Badge className="bg-xnema-orange text-white px-4 py-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualização Limitada - Assine para Assistir
                  </Badge>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar filmes e séries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou explore outras categorias
              </p>
            </div>
          )}

          {/* Call to Action for Non-Subscribers */}
          {!isSubscriber && (
            <Card className="mt-12 border-xnema-orange">
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 text-xnema-orange mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Pronto para Assistir?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Assine o XNEMA Premium e tenha acesso ilimitado a todo nosso catálogo exclusivo, 
                  incluindo a aclamada série "Entre o Céu e o Inferno" e muito mais.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to="/register">
                      <div className="flex items-center">
                        <Crown className="w-5 h-5 mr-2" />
                        Assinar Agora
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/pricing">Ver Planos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
