import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartVideoPlayer } from "@/components/SmartVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Plus,
  Download,
  Users,
  Award,
  ArrowLeft,
  Lock,
  Crown
} from "lucide-react";

interface SeriesDetails {
  id: string;
  title: string;
  description: string;
  fullStory: string;
  genre: string;
  rating: number;
  seasons: number;
  totalEpisodes: number;
  releaseYear: number;
  status: string;
  image: string;
  trailerUrl: string;
  director: string;
  cast: string[];
  awards: string[];
  isExclusive: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
}

interface Season {
  number: number;
  title: string;
  episodes: Episode[];
  releaseDate: string;
  description: string;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  releaseDate: string;
  isAvailable: boolean;
}

export default function SeriesDetail() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Dados simulados da série (em produção, viria da API)
  const [series, setSeries] = useState<SeriesDetails>({
    id: seriesId || "1",
    title: "",
    description: "",
    fullStory: "",
    genre: "",
    rating: 0,
    seasons: 0,
    totalEpisodes: 0,
    releaseYear: 0,
    status: "",
    image: "",
    trailerUrl: "",
    director: "",
    cast: [],
    awards: [],
    isExclusive: false,
    isPremium: false,
    views: 0,
    likes: 0
  });

  const [episodesBySeason, setEpisodesBySeason] = useState<Record<number, Episode[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        if (!isSupabaseConfigured || !seriesId) return;
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("serie_id", seriesId)
          .eq("status", "approved")
          .order("temporada", { ascending: true })
          .order("episodio", { ascending: true });
        if (!error && Array.isArray(data)) {
          const grouped: Record<number, Episode[]> = {};
          data.forEach((row: any) => {
            const seasonNum = Number(row.temporada || 1);
            const epNum = Number(row.episodio || 0);
            const ep: Episode = {
              id: String(row.id),
              number: epNum,
              title: row.titulo || row.title || (epNum ? `Episódio ${epNum}` : "Episódio"),
              description: row.descricao || row.description || "",
              duration: row.duration ? String(row.duration) : "",
              thumbnail: row.thumbnail_url || row.thumbnailUrl || "",
              releaseDate: row.release_date || "",
              isAvailable: true,
            };
            if (!grouped[seasonNum]) grouped[seasonNum] = [];
            grouped[seasonNum].push(ep);
          });
          Object.keys(grouped).forEach((k) => grouped[Number(k)].sort((a, b) => a.number - b.number));
          setEpisodesBySeason(grouped);
          const seasonList = Object.keys(grouped).map(Number).sort((a, b) => a - b);
          if (seasonList.length) setSelectedSeason(seasonList[0]);
          setSeries((prev) => ({
            ...prev,
            title: (data[0] && (data[0].serie_title || data[0].series_title || prev.title)) || prev.title,
            trailerUrl: data[0]?.trailer_url || prev.trailerUrl,
            image: data[0]?.backdrop_url || prev.image,
            seasons: seasonList.length,
            totalEpisodes: seasonList.reduce((sum, s) => sum + (grouped[s]?.length || 0), 0),
            isPremium: true,
          }));
        }
      } catch {}
    };
    load();
  }, [seriesId]);

  const isSubscriber = user?.role === "subscriber" || user?.role === "admin";

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleWatchEpisode = (episodeId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isSubscriber) {
      navigate("/premium");
      return;
    }

    navigate(`/watch/${episodeId}`);
  };

  const handleWatchTrailer = () => {
    setIsTrailerOpen(true);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: series.title,
        text: series.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Image */}
          <div
            className="h-[70vh] bg-cover bg-center relative"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${series.image})`
            }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="absolute top-6 left-6 text-white hover:text-xnema-orange bg-black/50 hover:bg-black/70"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-5xl font-bold">{series.title}</h1>
                  {series.isExclusive && (
                    <Badge className="bg-xnema-orange text-white text-lg px-3 py-1">
                      EXCLUSIVO
                    </Badge>
                  )}
                  {series.isPremium && (
                    <Badge className="bg-xnema-purple text-white text-lg px-3 py-1">
                      PREMIUM
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-lg mb-6">
                  {series.seasons > 0 && <span>{series.seasons} temporadas</span>}
                  {series.totalEpisodes > 0 && <span>{series.totalEpisodes} episódios</span>}
                </div>

                <p className="text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
                  {series.description}
                </p>

                <div className="flex items-center gap-4">
                  {isSubscriber ? (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-lg px-8 py-3"
                      onClick={() => handleWatchEpisode("s1e1")}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Assistir Agora
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-lg px-8 py-3"
                      asChild
                    >
                      <Link to="/premium">
                        <div className="flex items-center">
                          <Crown className="w-6 h-6 mr-2" />
                          Assinar para Assistir
                        </div>
                      </Link>
                    </Button>
                  )}

                  {series.trailerUrl && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-3"
                      onClick={handleWatchTrailer}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Trailer
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleLike}
                    className={`text-lg px-6 py-3 ${isLiked ? 'bg-red-500 text-white' : ''}`}
                  >
                    <Heart className={`w-6 h-6 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {formatViews(series.likes)}
                  </Button>

                  <Button size="lg" variant="outline" onClick={handleShare} className="text-lg px-6 py-3">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Tabs defaultValue="episodes" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="episodes">Episódios</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="cast">Elenco</TabsTrigger>
              <TabsTrigger value="awards">Prêmios</TabsTrigger>
            </TabsList>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="space-y-6">
              {/* Season Selector */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Episódios</h2>
                <div className="flex gap-2">
                  {Object.keys(episodesBySeason)
                    .map((n) => Number(n))
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <Button
                        key={n}
                        variant={selectedSeason === n ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSeason(n)}
                        className={selectedSeason === n ? "bg-xnema-orange" : ""}
                      >
                        Temporada {n}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Episodes List */}
              <div className="grid gap-4">
                {(episodesBySeason[selectedSeason] || []).map((episode) => (
                  <Card key={episode.id} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        {/* Episode Thumbnail */}
                        <div className="relative w-48 h-28 flex-shrink-0">
                          <div
                            className="w-full h-full bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url(${episode.thumbnail})` }}
                          />
                          {!episode.isAvailable && (
                            <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {episode.isAvailable && isSubscriber && (
                            <Button
                              size="sm"
                              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/70 hover:bg-xnema-orange"
                              onClick={() => handleWatchEpisode(episode.id)}
                            >
                              <Play className="w-6 h-6" />
                            </Button>
                          )}
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold">
                              {episode.number}. {episode.title}
                            </h4>
                            {episode.duration && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>{episode.duration}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {episode.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              Lançamento: {episode.releaseDate}
                            </span>

                            {episode.isAvailable ? (
                              isSubscriber ? (
                                <Button
                                  size="sm"
                                  className="bg-xnema-orange hover:bg-xnema-orange/90"
                                  onClick={() => handleWatchEpisode(episode.id)}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Assistir
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to="/premium">
                                    <div className="flex items-center">
                                      <Crown className="w-4 h-4 mr-2" />
                                      Assinar
                                    </div>
                                  </Link>
                                </Button>
                              )
                            ) : (
                              <Badge variant="secondary">Em Breve</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-xnema-orange">História Completa</h3>
                  <div className="text-gray-300 leading-relaxed">
                    <p className="mb-4">
                      <strong>Between Heaven and Hell</strong>{" "}
                      – Em um mundo onde a linha entre o céu e o inferno é
                      tênue, cada escolha tem consequências devastadoras.
                      Quando forças celestiais e demoníacas entram em
                      conflito pelo destino da humanidade, um indivíduo
                      comum se vê arrastado para uma batalha que desafia
                      tudo o que ele conhece sobre moralidade, fé e
                      coragem. Entre encontros com seres sobrenaturais,
                      traições inesperadas e decisões impossíveis, ele
                      precisará enfrentar seus maiores medos e descobrir
                      até onde está disposto a ir para proteger aqueles
                      que ama.
                    </p>
                    <p>
                      Com cenas de ação arrebatadoras, efeitos visuais
                      impressionantes e uma narrativa intensa,{" "}
                      <strong>Between Heaven and Hell</strong>{" "}
                      mergulha o espectador em uma aventura épica que
                      questiona os limites entre o bem e o mal. Cada
                      capítulo revela segredos sombrios, alianças
                      inesperadas e dilemas morais que fazem o público
                      refletir sobre seus próprios valores. Uma obra que
                      combina drama, suspense e fantasia de forma única,
                      levando a uma experiência cinematográfica
                      inesquecível.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-xnema-orange mb-2">Informações da Série</h4>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Gênero:</span>
                        <span>{series.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ano de Lançamento:</span>
                        <span>{series.releaseYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="secondary">{series.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Temporadas:</span>
                        <span>{series.seasons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Episódios:</span>
                        <span>{series.totalEpisodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visualizações:</span>
                        <span>{formatViews(series.views)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xnema-orange mb-2">Direção</h4>
                    <p className="text-gray-300">{series.director}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Cast Tab */}
            <TabsContent value="cast" className="space-y-6">
              <h3 className="text-xl font-semibold text-xnema-orange">Elenco Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {series.cast.map((actor, index) => (
                  <Card key={index} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{actor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards" className="space-y-6">
              <h3 className="text-xl font-semibold text-xnema-orange">Prêmios e Reconhecimentos</h3>
              <div className="grid gap-4">
                {series.awards.map((award, index) => (
                  <Card key={index} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-medium text-white">{award}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Trailer Modal */}
      <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
        <DialogContent className="max-w-5xl w-[92vw] p-0 bg-black border-xnema-border">
          <DialogTitle className="sr-only">Trailer</DialogTitle>
          <div className="aspect-video w-full bg-black">
            {/youtube|youtu\.be|vimeo/.test(series.trailerUrl) ? (
              <iframe
                src={(function(){
                  const url = series.trailerUrl;
                  try {
                    if (url.includes("youtu.be")) {
                      const id = url.split("/").pop()?.split("?")[0] || "";
                      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
                    }
                    if (url.includes("youtube.com/watch")) {
                      const u = new URL(url);
                      const id = u.searchParams.get("v") || "";
                      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
                    }
                    if (url.includes("youtube.com/embed")) return `${url}?autoplay=1&rel=0`;
                    return url;
                  } catch {
                    return url;
                  }
                })()}
                title="Trailer"
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <SmartVideoPlayer src={series.trailerUrl} title={`${series.title} - Trailer`} autoPlay />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
