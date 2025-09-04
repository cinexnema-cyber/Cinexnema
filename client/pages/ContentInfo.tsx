import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Play,
  Star,
  Clock,
  Calendar,
  Users,
  Lock,
  Crown,
  Info,
  Award,
  Heart,
  Share2,
  Plus,
} from "lucide-react";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  season: number;
  episode: number;
  thumbnail: string;
  releaseDate: string;
}

interface ContentData {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: string;
  genre: string[];
  duration?: string;
  seasons?: number;
  episodes?: Episode[];
  cast: string[];
  director: string;
  synopsis: string;
  type: "series" | "movie";
}

export default function ContentInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const isSubscriber =
    user?.role === "subscriber" ||
    user?.role === "admin" ||
    user?.role === "creator";

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        if (id && isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("videos")
            .select("*")
            .eq("id", id)
            .single();

          if (!error && data) {
            if (data.status && data.status !== "approved") {
              setIsLoading(false);
              return;
            }
            const genres = Array.isArray(data.genre)
              ? data.genre
              : (data.genres || data.genre || "")
                  .toString()
                  .split(",")
                  .map((g: string) => g.trim())
                  .filter(Boolean);

            const mapped: ContentData = {
              id: String(data.id),
              title: data.title || data.name || "Conteúdo",
              description: data.description || data.synopsis || "",
              poster:
                data.poster_url || data.poster || data.thumbnail_url || data.thumbnailUrl ||
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
              backdrop:
                data.backdrop_url || data.backdrop || data.cover_url ||
                "https://images.unsplash.com/photo-1489599433202-4b02d48ad6bd?w=1920&h=1080&fit=crop",
              rating: Number(data.rating || 0),
              year: String(data.year || data.release_year || new Date().getFullYear()),
              genre: genres.length ? genres : ["Geral"],
              duration: data.duration ? String(data.duration) : undefined,
              seasons: data.seasons || undefined,
              episodes: Array.isArray(data.episodes) ? data.episodes : undefined,
              cast: Array.isArray(data.cast)
                ? data.cast
                : (data.cast || "").toString().split(",").map((x: string) => x.trim()).filter(Boolean),
              director: data.director || "",
              synopsis: data.synopsis || data.description || "",
              type: (data.type || data.category || "movie").includes("series") ? "series" : "movie",
            };
            setContent(mapped);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Conteúdo via Supabase indisponível, usando fallback", e);
      }

      // Fallback (conteúdo padrão)
      const fallback: ContentData = {
        id: id || "1",
        title: "Conteúdo XNEMA",
        description: "Detalhes disponíveis em breve.",
        poster:
          "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
        backdrop:
          "https://images.unsplash.com/photo-1489599433202-4b02d48ad6bd?w=1920&h=1080&fit=crop",
        rating: 0,
        year: String(new Date().getFullYear()),
        genre: ["Geral"],
        cast: [],
        director: "",
        synopsis: "",
        type: "movie",
      };
      setContent(fallback);
      setIsLoading(false);
    };

    loadContent();
  }, [id]);

  const handleWatchClick = (episodeId?: string) => {
    if (!isSubscriber) {
      navigate("/pricing");
      return;
    }
    navigate(
      `/watch/${content?.id}${episodeId ? `?episode=${episodeId}` : ""}`,
    );
  };

  const handleSubscribeClick = () => {
    navigate("/pricing");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl">Conteúdo não encontrado</p>
            <Button onClick={() => navigate("/catalog")} className="mt-4">
              Voltar ao Catálogo
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Section */}
        <section
          className="relative h-[70vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${content.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-xnema-dark via-xnema-dark/80 to-xnema-dark/40" />

          <div className="relative max-w-7xl mx-auto px-8 h-full flex items-end pb-20">
            <div className="grid lg:grid-cols-3 gap-8 items-end w-full">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  {content.genre.map((g, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-xnema-orange/20 text-xnema-orange"
                    >
                      {g}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-white border-white">
                    {content.year}
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                  {content.title}
                </h1>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">
                      {content.rating}
                    </span>
                  </div>

                  {content.seasons && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span>
                        {content.seasons} temporada
                        {content.seasons > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{content.year}</span>
                  </div>
                </div>

                <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl">
                  {content.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isSubscriber ? (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      onClick={() => handleWatchClick()}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Assistir Agora
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      onClick={handleSubscribeClick}
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Assinar para Assistir
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Minha Lista
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <img
                  src={content.poster}
                  alt={content.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Details */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <Tabs defaultValue="episodes" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-xnema-surface">
                <TabsTrigger value="episodes">Episódios</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="cast">Elenco</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              <TabsContent value="episodes" className="mt-8">
                {!isSubscriber ? (
                  <Card className="bg-xnema-surface border-xnema-border text-center p-12">
                    <CardContent>
                      <Lock className="w-16 h-16 text-xnema-orange mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-4">
                        Conteúdo Exclusivo para Assinantes
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Para assistir aos episódios e acessar todo o catálogo
                        premium, você precisa ser um assinante XNEMA.
                      </p>
                      <Button
                        size="lg"
                        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        onClick={handleSubscribeClick}
                      >
                        <Crown className="w-5 h-5 mr-2" />
                        Assinar Agora - R$ 19,90/mês
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">
                        Episódios - Temporada {selectedSeason}
                      </h3>
                      {content.seasons && content.seasons > 1 && (
                        <select
                          value={selectedSeason}
                          onChange={(e) =>
                            setSelectedSeason(Number(e.target.value))
                          }
                          className="bg-xnema-surface border border-xnema-border rounded-md px-3 py-2 text-white"
                        >
                          {Array.from({ length: content.seasons }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Temporada {i + 1}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {content.episodes
                        ?.filter((ep) => ep.season === selectedSeason)
                        .map((episode) => (
                          <Card
                            key={episode.id}
                            className="bg-xnema-surface border-xnema-border hover:bg-xnema-surface/80 transition-colors"
                          >
                            <CardContent className="p-6">
                              <div className="flex gap-6">
                                <div
                                  className="relative group cursor-pointer"
                                  onClick={() => handleWatchClick(episode.id)}
                                >
                                  <img
                                    src={episode.thumbnail}
                                    alt={episode.title}
                                    className="w-40 h-24 object-cover rounded-md"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                    <Play className="w-8 h-8 text-white" />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-lg font-semibold">
                                      {episode.episode}. {episode.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Clock className="w-4 h-4" />
                                      {episode.duration}
                                    </div>
                                  </div>
                                  <p className="text-gray-400 text-sm leading-relaxed">
                                    {episode.description}
                                  </p>
                                  <div className="mt-3 flex items-center gap-4">
                                    <span className="text-xs text-gray-500">
                                      {episode.releaseDate}
                                    </span>
                                    <Button
                                      size="sm"
                                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                                      onClick={() =>
                                        handleWatchClick(episode.id)
                                      }
                                    >
                                      <Play className="w-4 h-4 mr-1" />
                                      Assistir
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-8">
                <Card className="bg-xnema-surface border-xnema-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-xnema-orange" />
                      Sinopse Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {content.synopsis}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Informações Técnicas
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>
                            <strong>Direção:</strong> {content.director}
                          </li>
                          <li>
                            <strong>Ano:</strong> {content.year}
                          </li>
                          <li>
                            <strong>Gênero:</strong> {content.genre.join(", ")}
                          </li>
                          {content.seasons && (
                            <li>
                              <strong>Temporadas:</strong> {content.seasons}
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Avaliação</h4>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.floor(content.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold">
                            {content.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cast" className="mt-8">
                <Card className="bg-xnema-surface border-xnema-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-xnema-orange" />
                      Elenco Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {content.cast.map((actor, index) => (
                        <div key={index} className="text-center">
                          <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-2"></div>
                          <p className="text-sm font-medium">{actor}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="extras" className="mt-8">
                <Card className="bg-xnema-surface border-xnema-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-xnema-orange" />
                      Conteúdo Extra
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-xnema-dark rounded-lg">
                        <h4 className="font-semibold mb-2">Making Of</h4>
                        <p className="text-sm text-gray-400">
                          Bastidores da produção de Between Heaven and Hell
                        </p>
                      </div>

                      <div className="p-4 bg-xnema-dark rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Entrevistas do Elenco
                        </h4>
                        <p className="text-sm text-gray-400">
                          Conversas exclusivas com os protagonistas da série
                        </p>
                      </div>

                      {!isSubscriber && (
                        <div className="text-center p-8 border-2 border-dashed border-xnema-orange/30 rounded-lg">
                          <Lock className="w-12 h-12 text-xnema-orange mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">
                            Conteúdo exclusivo para assinantes
                          </p>
                          <Button
                            onClick={handleSubscribeClick}
                            className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                          >
                            Assinar para Acessar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </Layout>
  );
}
