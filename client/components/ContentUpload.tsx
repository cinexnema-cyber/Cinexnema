import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Check, AlertCircle } from "lucide-react";

interface ContentUploadProps {
  onUploadSuccess?: () => void;
}

export const ContentUpload: React.FC<ContentUploadProps> = ({
  onUploadSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    thumbnailUrl: "",
    videoUrl: "",
    duration: "",
  });
  const [currentTag, setCurrentTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    { value: "series", label: "Série" },
    { value: "movie", label: "Filme" },
    { value: "documentary", label: "Documentário" },
    { value: "short", label: "Curta-metragem" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("xnema_token");

      const payload = {
        ...formData,
        duration: formData.duration
          ? parseInt(formData.duration) * 60
          : undefined, // Convert minutes to seconds
      };

      const response = await fetch("/api/content/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          tags: [],
          thumbnailUrl: "",
          videoUrl: "",
          duration: "",
        });
        onUploadSuccess?.();
      } else {
        setUploadStatus("error");
        setErrorMessage(data.message || "Erro ao enviar conteúdo");
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage("Erro de conexão");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    formData.title && formData.description && formData.category;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-xnema-orange" />
          <span>Enviar Novo Conteúdo</span>
        </CardTitle>
        <CardDescription>
          Envie seu conteúdo para análise e aprovação da equipe XNEMA
        </CardDescription>
      </CardHeader>

      <CardContent>
        {uploadStatus === "success" && (
          <Alert className="mb-6">
            <Check className="h-4 w-4" />
            <AlertDescription>
              Conteúdo enviado com sucesso! Aguarde a aprovação da equipe XNEMA.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do seu conteúdo"
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva seu conteúdo em detalhes"
              maxLength={1000}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 caracteres
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (máximo 10)</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Digite uma tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!currentTag.trim() || formData.tags.length >= 10}
              >
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                handleInputChange("thumbnailUrl", e.target.value)
              }
              placeholder="https://exemplo.com/thumbnail.jpg"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL do Vídeo</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              placeholder="https://exemplo.com/video.mp4"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (em minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="300"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              placeholder="120"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  category: "",
                  tags: [],
                  thumbnailUrl: "",
                  videoUrl: "",
                  duration: "",
                });
                setUploadStatus("idle");
              }}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black"
              disabled={!isFormValid || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar para Aprovação
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
