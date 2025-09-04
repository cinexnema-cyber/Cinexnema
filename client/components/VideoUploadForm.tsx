import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Tv,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Calculator,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface VideoUploadFormProps {
  creatorData?: {
    blocksAvailable: number;
    freeActive: number;
    blocksPurchased: number;
    freeBlockActive: boolean;
  };
  onUploadComplete?: (video: any) => void;
  onUploadError?: (error: string) => void;
}

interface FormData {
  title: string;
  type: "filme" | "serie";
  season: number;
  episode: number;
  duration: number;
  releaseDate: string;
  director: string;
  cast: string;
  genre: string;
  synopsis: string;
  language: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  category: string;
  tags: string;
  sizeGB: number;
}

const CATEGORIES = [
  { value: "acao", label: "Ação" },
  { value: "aventura", label: "Aventura" },
  { value: "comedia", label: "Comédia" },
  { value: "drama", label: "Drama" },
  { value: "documentario", label: "Documentário" },
  { value: "ficcao_cientifica", label: "Ficção Científica" },
  { value: "fantasia", label: "Fantasia" },
  { value: "romance", label: "Romance" },
  { value: "suspense", label: "Suspense" },
  { value: "terror", label: "Terror" },
  { value: "animacao", label: "Animação" },
  { value: "musical", label: "Musical" },
  { value: "geral", label: "Geral" },
];

const LANGUAGES = [
  { value: "Português", label: "Português" },
  { value: "Inglês", label: "Inglês" },
  { value: "Espanhol", label: "Espanhol" },
  { value: "Francês", label: "Francês" },
  { value: "Italiano", label: "Italiano" },
  { value: "Alemão", label: "Alemão" },
  { value: "Japonês", label: "Japonês" },
  { value: "Coreano", label: "Coreano" },
  { value: "Mandarim", label: "Mandarim" },
  { value: "Outro", label: "Outro" },
];

export function VideoUploadForm({
  creatorData,
  onUploadComplete,
  onUploadError,
}: VideoUploadFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "filme",
    season: 1,
    episode: 1,
    duration: 0,
    releaseDate: "",
    director: "",
    cast: "",
    genre: "",
    synopsis: "",
    language: "Português",
    thumbnailUrl: "",
    videoUrl: "",
    description: "",
    category: "geral",
    tags: "",
    sizeGB: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [blocksNeeded, setBlocksNeeded] = useState(0);
  const [canAfford, setCanAfford] = useState(true);
  const [showBlockCalculator, setShowBlockCalculator] = useState(false);

  // Calculate blocks needed when size changes
  useEffect(() => {
    if (formData.sizeGB > 0) {
      const needed = Math.ceil(formData.sizeGB / 7.3);
      setBlocksNeeded(needed);

      if (creatorData) {
        setCanAfford(needed <= creatorData.blocksAvailable);
      }
      setShowBlockCalculator(true);
    } else {
      setBlocksNeeded(0);
      setCanAfford(true);
      setShowBlockCalculator(false);
    }
  }, [formData.sizeGB, creatorData]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (formData.type === "serie") {
      if (!formData.season || formData.season < 1) {
        newErrors.season = "Temporada é obrigatória para séries";
      }
      if (!formData.episode || formData.episode < 1) {
        newErrors.episode = "Episódio é obrigatório para séries";
      }
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duração em minutos é obrigatória";
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = "Sinopse é obrigatória";
    }

    if (!formData.sizeGB || formData.sizeGB <= 0) {
      newErrors.sizeGB = "Tamanho do arquivo é obrigatório";
    }

    if (!canAfford) {
      newErrors.blocks = `Blocos insuficientes. Necessário: ${blocksNeeded}, Disponível: ${creatorData?.blocksAvailable || 0}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/videos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (onUploadComplete) {
          onUploadComplete(data.video);
        }

        // Reset form
        setFormData({
          title: "",
          type: "filme",
          season: 1,
          episode: 1,
          duration: 0,
          releaseDate: "",
          director: "",
          cast: "",
          genre: "",
          synopsis: "",
          language: "Português",
          thumbnailUrl: "",
          videoUrl: "",
          description: "",
          category: "geral",
          tags: "",
          sizeGB: 0,
        });
        setErrors({});
        setShowBlockCalculator(false);
      } else {
        setErrors({ submit: data.message });
        if (onUploadError) {
          onUploadError(data.message);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro no upload";
      setErrors({ submit: errorMessage });
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const buyBlocks = async () => {
    try {
      // Calcular quantos blocos faltam
      const blocksToAdd = blocksNeeded - (creatorData?.blocksAvailable || 0);

      const response = await fetch(`/api/creator-blocks/${user?.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({ blocks: blocksToAdd }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar compra");
      }

      const result = await response.json();

      // Redirect to Mercado Pago
      window.location.href = result.purchase.checkoutUrl;
    } catch (error) {
      console.error("Erro na compra:", error);
      setErrors({ payment: "Erro ao processar pagamento" });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.type === "filme" ? (
            <Film className="w-6 h-6 text-xnema-orange" />
          ) : (
            <Tv className="w-6 h-6 text-xnema-purple" />
          )}
          Upload de {formData.type === "filme" ? "Filme" : "Série"}
        </CardTitle>
        <CardDescription>
          Preencha os dados do seu{" "}
          {formData.type === "filme" ? "filme" : "seriado"} para envio
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conteúdo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "filme" | "serie") =>
                handleInputChange("type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filme">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>Filme</span>
                  </div>
                </SelectItem>
                <SelectItem value="serie">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    <span>Série</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informações Básicas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Digite o título"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="120"
                min="1"
                value={formData.duration || ""}
                onChange={(e) =>
                  handleInputChange("duration", Number(e.target.value))
                }
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Campos específicos para Séries */}
          {formData.type === "serie" && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="season">Temporada</Label>
                <Input
                  id="season"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={formData.season || ""}
                  onChange={(e) =>
                    handleInputChange("season", Number(e.target.value))
                  }
                  className={errors.season ? "border-red-500" : ""}
                />
                {errors.season && (
                  <p className="text-sm text-red-500">{errors.season}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="episode">Episódio</Label>
                <Input
                  id="episode"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={formData.episode || ""}
                  onChange={(e) =>
                    handleInputChange("episode", Number(e.target.value))
                  }
                  className={errors.episode ? "border-red-500" : ""}
                />
                {errors.episode && (
                  <p className="text-sm text-red-500">{errors.episode}</p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="director">Diretor</Label>
              <Input
                id="director"
                placeholder="Nome do diretor"
                value={formData.director}
                onChange={(e) => handleInputChange("director", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Data de Lançamento</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) =>
                  handleInputChange("releaseDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cast">Elenco (separado por vírgula)</Label>
              <Input
                id="cast"
                placeholder="Ator 1, Atriz 2, Ator 3"
                value={formData.cast}
                onChange={(e) => handleInputChange("cast", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Gênero (separado por vírgula)</Label>
              <Input
                id="genre"
                placeholder="Drama, Ação, Comédia"
                value={formData.genre}
                onChange={(e) => handleInputChange("genre", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sinopse */}
          <div className="space-y-2">
            <Label htmlFor="synopsis">Sinopse</Label>
            <Textarea
              id="synopsis"
              placeholder="Descreva a história..."
              rows={4}
              value={formData.synopsis}
              onChange={(e) => handleInputChange("synopsis", e.target.value)}
              className={errors.synopsis ? "border-red-500" : ""}
            />
            {errors.synopsis && (
              <p className="text-sm text-red-500">{errors.synopsis}</p>
            )}
          </div>

          {/* URLs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL da Miniatura</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://exemplo.com/miniatura.jpg"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  handleInputChange("thumbnailUrl", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                placeholder="https://exemplo.com/video.mp4"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Tamanho do Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="sizeGB">Tamanho do Arquivo (GB)</Label>
            <Input
              id="sizeGB"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="2.5"
              value={formData.sizeGB || ""}
              onChange={(e) =>
                handleInputChange("sizeGB", Number(e.target.value))
              }
              className={errors.sizeGB ? "border-red-500" : ""}
            />
            {errors.sizeGB && (
              <p className="text-sm text-red-500">{errors.sizeGB}</p>
            )}
          </div>

          {/* Calculadora de Blocos */}
          {showBlockCalculator && (
            <Alert
              className={`${canAfford ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}
            >
              <Calculator
                className={`h-4 w-4 ${canAfford ? "text-green-600" : "text-red-600"}`}
              />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Tamanho do arquivo:</span>
                    <Badge variant="secondary">{formData.sizeGB} GB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Blocos necessários:</span>
                    <Badge variant="secondary">{blocksNeeded} bloco(s)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Blocos disponíveis:</span>
                    <Badge variant={canAfford ? "default" : "destructive"}>
                      {creatorData?.blocksAvailable || 0} bloco(s)
                    </Badge>
                  </div>

                  {!canAfford && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Você precisa comprar{" "}
                        {blocksNeeded - (creatorData?.blocksAvailable || 0)}{" "}
                        bloco(s) adicional(is)
                      </p>
                      <Button
                        type="button"
                        onClick={buyBlocks}
                        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        size="sm"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar Blocos - R${" "}
                        {(
                          (blocksNeeded - (creatorData?.blocksAvailable || 0)) *
                          1000
                        ).toLocaleString("pt-BR")}
                      </Button>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Errors */}
          {errors.blocks && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {errors.blocks}
              </AlertDescription>
            </Alert>
          )}

          {errors.submit && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: "",
                  type: "filme",
                  season: 1,
                  episode: 1,
                  duration: 0,
                  releaseDate: "",
                  director: "",
                  cast: "",
                  genre: "",
                  synopsis: "",
                  language: "Português",
                  thumbnailUrl: "",
                  videoUrl: "",
                  description: "",
                  category: "geral",
                  tags: "",
                  sizeGB: 0,
                });
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              Limpar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !canAfford}
              className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Vídeo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default VideoUploadForm;
