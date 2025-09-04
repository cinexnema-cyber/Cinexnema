import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ArrowLeft, 
  Star, 
  Clock, 
  Calendar,
  Eye,
  Heart,
  Share2,
  Download,
  Settings
} from "lucide-react";

interface ContentDetails {
  id: string;
  title: string;
  description: string;
  synopsis: string;
  category: string;
  year: number;
  duration: string;
  rating: number;
  videoUrl: string;
  thumbnails: string[];
  cast: string[];
  director: string;
  genres: string[];
  isExclusive: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
}

interface RelatedContent {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
}

export default function Watch() {
  const { contentId } = useParams<{ contentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Dados simulados do conteúdo (em produção, viria da API)
  const [content, setContent] = useState<ContentDetails>({
    id: contentId || "1",
    title: "Entre o Céu e o Inferno",
    description: "Série exclusiva XNEMA que explora os limites entre o bem e o mal",
    synopsis: "Em uma realidade onde as fronteiras entre o céu e o inferno se confundem, nossa série exclusiva acompanha personagens extraordinários navegando por dilemas morais complexos. Com produção cinematográfica de alta qualidade e roteiro envolvente, esta é a série que definirá o futuro do streaming brasileiro.",
    category: "series",
    year: 2024,
    duration: "45min",
    rating: 9.2,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnails: [
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=200&fit=crop"
    ],
    cast: ["Ana Silva", "Carlos Santos", "Marina Oliveira", "João Pedro"],
    director: "Roberto Mendes",
    genres: ["Drama", "Suspense", "Sobrenatural"],
    isExclusive: true,
    isPremium: true,
    views: 125430,
    likes: 8932
  });

  const [relatedContent] = useState<RelatedContent[]>([
    {
      id: "2",
      title: "Horizonte Infinito",
      thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200&fit=crop",
      duration: "2h 15min",
      category: "filme"
    },
    {
      id: "3",
      title: "Mistérios da Cidade",
      thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=200&fit=crop",
      duration: "1h 32min",
      category: "filme"
    },
    {
      id: "4",
      title: "Aventuras Galácticas",
      thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=200&fit=crop",
      duration: "50min",
      category: "series"
    }
  ]);

  // Verificar se o usuário tem acesso ao conteúdo
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Verificar se é conteúdo premium e user não é subscriber
    if (content.isPremium && user.role !== "subscriber" && user.role !== "admin") {
      navigate("/premium");
      return;
    }
  }, [user, content, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Aqui você poderia mostrar uma notificação de sucesso
    }
  };

  if (!user) {
    return null; // Loading ou redirecionamento já aconteceu
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Video Player Container */}
        <div className="relative bg-black">
          <div className="max-w-7xl mx-auto">
            {/* Video Player */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}>
              {/* Background Video Placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-xnema-orange/20 rounded-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-xnema-orange" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                  <p className="text-gray-400">Episódio 1 - Temporada 1</p>
                </div>
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-600 h-1 rounded-full mb-4">
                    <div 
                      className="bg-xnema-orange h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                        className="text-white hover:text-xnema-orange"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMute}
                        className="text-white hover:text-xnema-orange"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>

                      <span className="text-sm">
                        {formatTime(currentTime)} / {formatTime(duration || 2700)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-xnema-orange"
                      >
                        <Settings className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFullscreen}
                        className="text-white hover:text-xnema-orange"
                      >
                        <Maximize className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-white hover:text-xnema-orange bg-black/50 hover:bg-black/70"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>

        {/* Content Information */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{content.title}</h1>
                  {content.isExclusive && (
                    <Badge className="bg-xnema-orange text-white">
                      EXCLUSIVO
                    </Badge>
                  )}
                  {content.isPremium && (
                    <Badge className="bg-xnema-purple text-white">
                      PREMIUM
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{content.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{content.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{content.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(content.views)} visualizações</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`${isLiked ? 'bg-red-500 text-white' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Curtido' : 'Curtir'} ({content.likes})
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex gap-2 mb-6">
                  {content.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {content.synopsis}
                </p>
              </div>

              <Separator />

              {/* Cast and Crew */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Elenco e Equipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-xnema-orange mb-2">Direção</h4>
                    <p className="text-gray-300">{content.director}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-xnema-orange mb-2">Elenco Principal</h4>
                    <ul className="text-gray-300 space-y-1">
                      {content.cast.map((actor, index) => (
                        <li key={index}>{actor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnails */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Cenas do Episódio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {content.thumbnails.map((thumb, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-cover bg-center rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundImage: `url(${thumb})` }}
                        onClick={() => setCurrentTime(index * 900)} // Jump to different parts
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Related Content */}
              <Card className="bg-xnema-surface border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Conteúdo Relacionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedContent.map((item) => (
                      <Link
                        key={item.id}
                        to={`/watch/${item.id}`}
                        className="flex gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div
                          className="w-20 h-12 bg-cover bg-center rounded flex-shrink-0"
                          style={{ backgroundImage: `url(${item.thumbnail})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                          <p className="text-xs text-gray-400">{item.duration}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
