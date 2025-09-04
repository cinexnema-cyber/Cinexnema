import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Video, Link as LinkIcon, Eye, Save, Send, CheckCircle, AlertTriangle, Image, FileText, Tag, Calendar, Users, TrendingUp, FolderOpen, Play, X } from "lucide-react";
import { useState, useRef } from "react";

export default function ContentCreator() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [contentData, setContentData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: "",
    tags: "",
    privacy: "public",
    series: "",
    season: 1,
    episode: 1
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');

  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Between Heaven and Hell",
    "Drama",
    "Ação",
    "Ficção Científica", 
    "Romance",
    "Thriller",
    "Documentário",
    "Comédia",
    "Histórico"
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateVideoUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/,
      /^https?:\/\/(www\.)?vimeo\.com\//,
      /^https?:\/\/(www\.)?dailymotion\.com\//,
      /^https?:\/\/(www\.)?twitch\.tv\//
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const extractVideoId = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publishing process
    setTimeout(() => {
      setIsPublishing(false);
      alert("Conteúdo publicado com sucesso! Já está disponível para os assinantes.");
    }, 3000);
  };

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simular upload com progresso
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Simular URL do arquivo enviado
          const mockUrl = `https://xnema.com/uploads/${file.name}`;
          if (type === 'video') {
            handleInputChange('videoUrl', mockUrl);
          } else {
            handleInputChange('thumbnailUrl', mockUrl);
          }

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é arquivo de vídeo
      const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (!videoTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo de vídeo válido (.mp4, .webm, .ogg, .avi, .mov)');
        return;
      }

      // Verificar tamanho (máx 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 2GB');
        return;
      }

      setVideoFile(file);
      handleFileUpload(file, 'video');
    }
  };

  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é arquivo de imagem
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!imageTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo de imagem válido (.jpg, .png, .webp, .gif)');
        return;
      }

      setThumbnailFile(file);

      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('thumbnailUrl', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateThumbnail = () => {
    if (contentData.videoUrl && validateVideoUrl(contentData.videoUrl)) {
      const videoId = extractVideoId(contentData.videoUrl);
      if (videoId && contentData.videoUrl.includes('youtube')) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        handleInputChange('thumbnailUrl', thumbnailUrl);
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Criar Novo Conteúdo
            </h1>
            <p className="text-muted-foreground">
              Publique seu conteúdo para os assinantes da XNEMA
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Form */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="video">Vídeo</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                {/* Basic Information */}
                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                      <CardDescription>Dados essenciais do seu conteúdo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Título</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Between Heaven and Hell - Episódio 1"
                          value={contentData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Descrição</label>
                        <textarea 
                          placeholder="Descreva seu conteúdo..."
                          rows={4}
                          value={contentData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="flex w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">Categoria</label>
                          <select 
                            value={contentData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                          >
                            <option value="">Selecione uma categoria</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">Tags</label>
                          <input 
                            type="text" 
                            placeholder="drama, sobrenatural, episódio"
                            value={contentData.tags}
                            onChange={(e) => handleInputChange('tags', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                          />
                          <p className="text-xs text-muted-foreground">Separe as tags com vírgulas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Video Configuration */}
                <TabsContent value="video" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuração de Vídeo</CardTitle>
                      <CardDescription>Upload de arquivo ou link do seu vídeo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Upload Type Selection */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Tipo de Upload</label>
                        <div className="flex space-x-2">
                          <Button
                            variant={uploadType === 'file' ? 'default' : 'outline'}
                            onClick={() => setUploadType('file')}
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload de Arquivo
                          </Button>
                          <Button
                            variant={uploadType === 'url' ? 'default' : 'outline'}
                            onClick={() => setUploadType('url')}
                            className="flex-1"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            URL/Link
                          </Button>
                        </div>
                      </div>

                      {/* File Upload */}
                      {uploadType === 'file' && (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-xnema-border rounded-lg p-8 text-center hover:border-xnema-orange transition-colors">
                            <input
                              type="file"
                              ref={videoFileRef}
                              onChange={handleVideoFileSelect}
                              accept="video/*"
                              className="hidden"
                            />
                            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-foreground font-semibold mb-2">
                              {videoFile ? videoFile.name : 'Clique para selecionar vídeo'}
                            </p>
                            <p className="text-muted-foreground text-sm mb-4">
                              Formatos: MP4, WebM, OGG, AVI, MOV (máx. 2GB)
                            </p>
                            <Button
                              onClick={() => videoFileRef.current?.click()}
                              disabled={isUploading}
                            >
                              {videoFile ? 'Alterar Vídeo' : 'Selecionar Vídeo'}
                            </Button>
                          </div>

                          {isUploading && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Fazendo upload...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-xnema-orange h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* URL Input */}
                      {uploadType === 'url' && (
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">Link do Vídeo</label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <input
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                value={contentData.videoUrl}
                                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                                className="pl-10 flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                              />
                            </div>
                            <Button
                              onClick={generateThumbnail}
                              variant="outline"
                              disabled={!validateVideoUrl(contentData.videoUrl)}
                            >
                              Gerar Thumb
                            </Button>
                          </div>
                          {contentData.videoUrl && !validateVideoUrl(contentData.videoUrl) && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>URL de vídeo inválida. Use YouTube, Vimeo, Dailymotion ou Twitch.</span>
                            </p>
                          )}
                          {validateVideoUrl(contentData.videoUrl) && (
                            <p className="text-xs text-green-500 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>URL válida! O vídeo será incorporado automaticamente.</span>
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Thumbnail Section */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Thumbnail (Opcional)</label>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Upload de arquivo */}
                          <div className="border-2 border-dashed border-xnema-border rounded-lg p-4 text-center hover:border-xnema-purple transition-colors">
                            <input
                              type="file"
                              ref={thumbnailFileRef}
                              onChange={handleThumbnailFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-foreground mb-2">
                              {thumbnailFile ? thumbnailFile.name : 'Upload de Imagem'}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => thumbnailFileRef.current?.click()}
                            >
                              Selecionar Arquivo
                            </Button>
                          </div>

                          {/* Geração automática */}
                          <div className="flex flex-col justify-center space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={generateThumbnail}
                              disabled={uploadType !== 'url' || !contentData.videoUrl || !validateVideoUrl(contentData.videoUrl)}
                              className="w-full"
                            >
                              Gerar Automático
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                              Para vídeos do YouTube
                            </p>
                          </div>
                        </div>

                        {/* URL Manual */}
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Ou inserir URL:</label>
                          <input
                            type="url"
                            placeholder="https://exemplo.com/thumbnail.jpg"
                            value={contentData.thumbnailUrl}
                            onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                          />
                        </div>

                        {contentData.thumbnailUrl && (
                          <div className="mt-2">
                            <img
                              src={contentData.thumbnailUrl}
                              alt="Preview"
                              className="w-full max-w-xs aspect-video object-cover rounded border border-xnema-border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {contentData.category === "Between Heaven and Hell" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Temporada</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="7"
                              value={contentData.season}
                              onChange={(e) => handleInputChange('season', parseInt(e.target.value))}
                              className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">Episódio</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="12"
                              value={contentData.episode}
                              onChange={(e) => handleInputChange('episode', parseInt(e.target.value))}
                              className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details */}
                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações Avançadas</CardTitle>
                      <CardDescription>Privacidade e configurações extras</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">Privacidade</label>
                        <select 
                          value={contentData.privacy}
                          onChange={(e) => handleInputChange('privacy', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                        >
                          <option value="public">Público (Todos os assinantes)</option>
                          <option value="premium">Premium (Apenas assinantes pagantes)</option>
                          <option value="scheduled">Agendado</option>
                          <option value="draft">Rascunho</option>
                        </select>
                      </div>
                      
                      {contentData.privacy === "scheduled" && (
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">Data de Publicação</label>
                          <input 
                            type="datetime-local" 
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-xnema-orange"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Configurações Extras</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded border-xnema-border" />
                            <span className="text-sm text-foreground">Permitir comentários</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded border-xnema-border" />
                            <span className="text-sm text-foreground">Mostrar estatísticas públicas</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded border-xnema-border" />
                            <span className="text-sm text-foreground">Notificar assinantes</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preview */}
                <TabsContent value="preview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview do Conteúdo</CardTitle>
                      <CardDescription>Como aparecerá para os assinantes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Preview Card */}
                        <div className="bg-xnema-surface rounded-xl p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {contentData.thumbnailUrl ? (
                                <img 
                                  src={contentData.thumbnailUrl} 
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Video className="w-12 h-12 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="md:col-span-2">
                              <h3 className="text-xl font-bold text-foreground mb-2">
                                {contentData.title || "Título do Conteúdo"}
                              </h3>
                              <p className="text-muted-foreground mb-4">
                                {contentData.description || "Descrição do conteúdo aparecerá aqui..."}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Tag className="w-4 h-4" />
                                  <span>{contentData.category || "Categoria"}</span>
                                </span>
                                {contentData.category === "Between Heaven and Hell" && (
                                  <span>T{contentData.season}E{contentData.episode}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Video Preview */}
                        {contentData.videoUrl && validateVideoUrl(contentData.videoUrl) && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              width="100%"
                              height="100%"
                              src={contentData.videoUrl.replace('watch?v=', 'embed/')}
                              title="Video Preview"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {/* Save draft */}}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                  
                  <Button 
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    onClick={handlePublish}
                    disabled={isPublishing || !contentData.title || !contentData.videoUrl}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isPublishing ? "Publicando..." : "Publicar Agora"}
                  </Button>
                  
                  {isPublishing && (
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-xnema-orange h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Processando conteúdo...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Previstas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alcance Estimado</span>
                    <span className="font-semibold text-foreground">~2.5K visualizações</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Receita Estimada</span>
                    <span className="font-semibold text-xnema-orange">R$ 45-85</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Categoria Popular</span>
                    <span className="font-semibold text-green-500">
                      {contentData.category ? "Sim" : "Selecione"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Dicas para Sucesso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Use thumbnails atrativas em alta resolução</p>
                  <p>�� Títulos claros aumentam 40% as visualizações</p>
                  <p>• Publique entre 19h-21h para maior engajamento</p>
                  <p>• Responda aos comentários rapidamente</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
