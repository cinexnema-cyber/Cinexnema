import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextReal";
import {
  Play,
  Search,
  Filter,
  Star,
  Crown,
  Clock,
  Eye,
  Film,
  Tv,
  FileText,
  ArrowLeft,
  Grid,
  List,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "movie" | "series" | "documentary";
  genre: string[];
  release_year: number;
  duration_minutes?: number;
  poster_url?: string;
  quality: "720p" | "1080p" | "4K";
  is_premium: boolean;
  views_count: number;
  rating: number;
}

export default function ContentCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [userIsPremium, setUserIsPremium] = useState(false);

  useEffect(() => {
    loadGenres();
    loadContent();
  }, [selectedType, selectedGenre]);

  const loadGenres = async () => {
    try {
      const response = await fetch("/api/content/genres");
      const data = await response.json();

      if (data.success) {
        setGenres(data.genres);
      }
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedGenre !== "all") params.append("genre", selectedGenre);
      if (searchTerm) params.append("search", searchTerm);

      const token = localStorage.getItem("xnema_token");
      const response = await fetch(`/api/content/catalog?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.content);
        setUserIsPremium(data.userIsPremium);
      } else {
        console.error("Erro ao carregar conteúdo:", data.message);
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadContent();
  };

  const handleWatchContent = async (contentId: string, isPremium: boolean) => {
    if (isPremium && !userIsPremium) {
      navigate("/pricing");
      return;
    }

    try {
      const token = localStorage.getItem("xnema_token");
      await fetch(`/api/content/${contentId}/watch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Navegar para página de reprodução
      navigate(`/watch/${contentId}`);
    } catch (error) {
      console.error("Erro ao iniciar reprodução:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4" />;
      case "series":
        return <Tv className="w-4 h-4" />;
      case "documentary":
        return <FileText className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Filme";
      case "series":
        return "Série";
      case "documentary":
        return "Documentário";
      default:
        return type;
    }
  };

  if (!user) {
    navigate("/login/subscriber");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div>
                <h1 className="text-2xl font-bold">Catálogo XNEMA</h1>
                <p className="text-sm text-muted-foreground">
                  {userIsPremium
                    ? "Acesso Premium Completo"
                    : "Conteúdo Gratuito"}
                </p>
              </div>
            </div>

            {userIsPremium && (
              <Badge className="bg-blue-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar filmes, séries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="movie">Filmes</SelectItem>
                <SelectItem value="series">Séries</SelectItem>
                <SelectItem value="documentary">Documentários</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando conteúdo...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleWatchContent(item.id, item.is_premium)}
              >
                <div className="aspect-[2/3] bg-muted rounded-t-lg relative overflow-hidden">
                  {item.poster_url ? (
                    <img
                      src={item.poster_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                      {getTypeIcon(item.type)}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Premium Badge */}
                  {item.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}

                  {/* Quality Badge */}
                  <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                    {item.quality}
                  </Badge>
                </div>

                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {getTypeIcon(item.type)}
                    <span>{getTypeLabel(item.type)}</span>
                    <span>•</span>
                    <span>{item.release_year}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{item.views_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleWatchContent(item.id, item.is_premium)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-36 bg-muted rounded flex-shrink-0 relative">
                      {item.poster_url ? (
                        <img
                          src={item.poster_url}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 rounded">
                          {getTypeIcon(item.type)}
                        </div>
                      )}

                      {item.is_premium && (
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                          <Crown className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge className="bg-blue-500 text-white">
                          {item.quality}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          <span>{getTypeLabel(item.type)}</span>
                        </div>

                        <span>{item.release_year}</span>

                        {item.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.duration_minutes}min</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.views_count} views</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.genre.slice(0, 3).map((g) => (
                          <Badge key={g} variant="outline" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {content.length === 0 && !loading && (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            {!userIsPremium && (
              <Button onClick={() => navigate("/pricing")}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade para Premium
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
