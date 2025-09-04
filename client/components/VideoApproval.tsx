import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Calendar,
  FileVideo,
  Play,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  Download,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Video {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize: number;
  originalFilename: string;
  category: string;
  tags: string[];
  uploadedAt: string;
  processedAt?: string;
  status: "pending_approval" | "approved" | "rejected" | "processing";
  creatorStats?: {
    storageUsedGB: number;
    videoCount: number;
    graceMonthsLeft: number;
    totalRevenue: number;
  };
}

interface ApprovalStats {
  totalPending: number;
  [key: string]: any;
}

export const VideoApproval: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApprovalStats>({ totalPending: 0 });
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "pending_approval",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch pending/all videos with fallbacks
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("xnema_token") || "";
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (filters.status !== "pending_approval") params.set("status", filters.status);

      const endpoints = filters.status === "pending_approval"
        ? [
            `/api/admin/videos/pending?${params}`,
            `/api/admin/pending-videos?${params}`,
            `/api/videos/pending-approval?${params}`,
          ]
        : [
            `/api/admin/videos?${params}`,
          ];

      let data: any = null;
      for (const url of endpoints) {
        try {
          const resp = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (resp.ok) {
            try {
              data = await resp.json();
            } catch {
              data = {};
            }
            break;
          }
          if (resp.status === 401 || resp.status === 403) {
            setVideos([]);
            setStats({ totalPending: 0 });
            setTotalPages(1);
            return;
          }
        } catch (e) {
          // try next endpoint
          continue;
        }
      }

      if (!data) {
        // As a last resort, show empty list instead of throwing
        setVideos([]);
        setStats({ totalPending: 0 });
        setTotalPages(1);
        return;
      }

      let videos = Array.isArray(data.videos) ? data.videos : [];
      let stats = data.stats || { totalPending: data.total || 0 };
      let pages = data.pagination?.pages || 1;

      // Fallback: include ContentModel pending items
      if (filters.status === "pending_approval") {
        try {
          const altResp = await fetch(`/api/content/pending`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (altResp.ok) {
            const alt = await altResp.json();
            const extra = Array.isArray(alt?.content) ? alt.content : [];
            const mapped = extra.map((c: any) => ({
              id: String(c._id),
              title: c.title,
              description: c.description,
              creatorId: c.creatorId,
              creatorName: c.creatorName || "",
              thumbnailUrl: c.thumbnailUrl,
              duration: c.duration,
              fileSize: 0,
              originalFilename: c.originalFilename || "",
              category: c.category || "geral",
              tags: Array.isArray(c.tags) ? c.tags : [],
              uploadedAt: c.createdAt || c.uploadDate || new Date().toISOString(),
              processedAt: c.createdAt,
              status: "pending_approval" as const,
            }));
            videos = [...videos, ...mapped];
            stats = { ...stats, totalPending: (stats.totalPending || 0) + mapped.length };
          }
        } catch {}
      }

      setVideos(videos);
      setStats(stats);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
      setStats({ totalPending: 0 });
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filters.status, page]);

  // Handle video approval
  const handleApprove = async (videoId: string) => {
    setActionLoading(videoId);
    try {
      const token = localStorage.getItem("xnema_token") || "";
      const urls = [
        `/api/admin/videos/${videoId}/approve`,
        `/api/videos/${videoId}/approve`,
      ];
      let ok = false;
      for (const u of urls) {
        const resp = await fetch(u, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (resp.ok) { ok = true; break; }
        if (resp.status === 401 || resp.status === 403) { break; }
      }
      if (!ok) {
        // Try content approval endpoint
        const resp = await fetch(`/api/content/${videoId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ status: "approved" }),
        });
        ok = resp.ok;
      }
      if (!ok) throw new Error("Falha ao aprovar vídeo");
      await fetchVideos();
      setSelectedVideo(null);
    } catch (error) {
      console.error("Error approving video:", error);
      alert("Erro ao aprovar vídeo");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle video rejection
  const handleReject = async (videoId: string) => {
    if (!rejectionReason.trim()) {
      alert("Motivo da rejeição é obrigatório");
      return;
    }

    setActionLoading(videoId);
    try {
      const token = localStorage.getItem("xnema_token") || "";
      const payload = { reason: rejectionReason.trim() };
      const urls = [
        `/api/admin/videos/${videoId}/reject`,
        `/api/videos/${videoId}/reject`,
      ];
      let ok = false;
      for (const u of urls) {
        const resp = await fetch(u, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload),
        });
        if (resp.ok) { ok = true; break; }
        if (resp.status === 401 || resp.status === 403) { break; }
      }
      if (!ok) {
        const resp = await fetch(`/api/content/${videoId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ status: "rejected", reason: rejectionReason.trim() }),
        });
        ok = resp.ok;
      }
      if (!ok) throw new Error("Falha ao rejeitar vídeo");
      await fetchVideos();
      setSelectedVideo(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting video:", error);
      alert("Erro ao rejeitar vídeo");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle video deletion
  const handleDelete = async (videoId: string) => {
    if (!confirm("Tem certeza que deseja deletar este vídeo? Esta ação não pode ser desfeita.")) {
      return;
    }

    setActionLoading(videoId);
    try {
      const token = localStorage.getItem("xnema_token") || "";
      const urls = [
        `/api/admin/videos/${videoId}`,
        `/api/videos/${videoId}`,
      ];
      let ok = false;
      for (const u of urls) {
        const resp = await fetch(u, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (resp.ok) { ok = true; break; }
        if (resp.status === 401 || resp.status === 403) { break; }
      }
      if (!ok) throw new Error("Falha ao deletar vídeo");
      await fetchVideos();
      setSelectedVideo(null);
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Erro ao deletar vídeo");
    } finally {
      setActionLoading(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pendente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejeitado
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Processando
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      video.creatorName.toLowerCase().includes(filters.search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Aprovação de Vídeos
        </h2>
        <p className="text-muted-foreground">
          Gerencie e aprove vídeos enviados pelos criadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.approved?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.rejected?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileVideo className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(stats).reduce(
                    (acc: number, stat: any) => acc + (stat.count || 0),
                    0,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar vídeos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar por título ou criador..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="pending_approval">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
                <option value="processing">Processando</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vídeos{" "}
            {filters.status === "pending_approval"
              ? "Pendentes"
              : getStatusBadge(filters.status)}
          </CardTitle>
          <CardDescription>
            {loading
              ? "Carregando..."
              : `${filteredVideos.length} vídeo(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center p-8">
              <FileVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum vídeo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Play className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                              {video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {video.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                {video.creatorName}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  new Date(video.uploadedAt),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR },
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FileVideo className="w-4 h-4" />
                                {formatFileSize(video.fileSize)}
                              </div>
                              {video.duration && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {getStatusBadge(video.status)}
                              <Badge variant="secondary">
                                {video.category}
                              </Badge>
                              {video.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Revisar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Revisar Vídeo</DialogTitle>
                                  <DialogDescription>
                                    Detalhes completos do vídeo para aprovação
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedVideo && (
                                  <div className="space-y-6">
                                    {/* Video Preview */}
                                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                      {selectedVideo.thumbnailUrl ? (
                                        <img
                                          src={selectedVideo.thumbnailUrl}
                                          alt={selectedVideo.title}
                                          className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                      ) : (
                                        <div className="text-center text-white">
                                          <Play className="w-16 h-16 mx-auto mb-4" />
                                          <p>Preview não disponível</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Video Details */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Título</Label>
                                          <p className="font-medium">
                                            {selectedVideo.title}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Descrição</Label>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedVideo.description}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Tags</Label>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedVideo.tags.map(
                                              (tag, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {tag}
                                                </Badge>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <Label>Criador</Label>
                                          <p className="font-medium">
                                            {selectedVideo.creatorName}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Categoria</Label>
                                          <p className="capitalize">
                                            {selectedVideo.category}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Arquivo Original</Label>
                                          <p className="text-sm">
                                            {selectedVideo.originalFilename}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatFileSize(
                                              selectedVideo.fileSize,
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Data de Upload</Label>
                                          <p className="text-sm">
                                            {format(
                                              new Date(
                                                selectedVideo.uploadedAt,
                                              ),
                                              "dd/MM/yyyy HH:mm",
                                              { locale: ptBR },
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Creator Stats */}
                                    {selectedVideo.creatorStats && (
                                      <div>
                                        <Label>Estatísticas do Criador</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                          <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                              Armazenamento
                                            </p>
                                            <p className="font-medium">
                                              {selectedVideo.creatorStats.storageUsedGB.toFixed(
                                                2,
                                              )}{" "}
                                              GB
                                            </p>
                                          </div>
                                          <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                              Vídeos
                                            </p>
                                            <p className="font-medium">
                                              {
                                                selectedVideo.creatorStats
                                                  .videoCount
                                              }
                                            </p>
                                          </div>
                                          <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                              Carência
                                            </p>
                                            <p className="font-medium">
                                              {
                                                selectedVideo.creatorStats
                                                  .graceMonthsLeft
                                              }{" "}
                                              meses
                                            </p>
                                          </div>
                                          <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                              Receita Total
                                            </p>
                                            <p className="font-medium">
                                              R${" "}
                                              {selectedVideo.creatorStats.totalRevenue.toFixed(
                                                2,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    {selectedVideo.status ===
                                      "pending_approval" && (
                                      <div className="space-y-4">
                                        <div className="flex gap-4">
                                          <Button
                                            onClick={() =>
                                              handleApprove(selectedVideo.id)
                                            }
                                            disabled={
                                              actionLoading === selectedVideo.id
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            {actionLoading === selectedVideo.id
                                              ? "Aprovando..."
                                              : "Aprovar"}
                                          </Button>

                                          <div className="flex-1">
                                            <div className="flex gap-2">
                                              <Textarea
                                                placeholder="Motivo da rejeição (obrigatório)"
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                  setRejectionReason(
                                                    e.target.value,
                                                  )
                                                }
                                                rows={2}
                                                className="flex-1"
                                              />
                                              <Button
                                                variant="destructive"
                                                onClick={() =>
                                                  handleReject(selectedVideo.id)
                                                }
                                                disabled={
                                                  !rejectionReason.trim() ||
                                                  actionLoading ===
                                                    selectedVideo.id
                                                }
                                              >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                {actionLoading ===
                                                selectedVideo.id
                                                  ? "Rejeitando..."
                                                  : "Rejeitar"}
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Delete Option */}
                                    <div className="border-t pt-4">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleDelete(selectedVideo.id)
                                        }
                                        disabled={
                                          actionLoading === selectedVideo.id
                                        }
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {actionLoading === selectedVideo.id
                                          ? "Deletando..."
                                          : "Deletar Vídeo"}
                                      </Button>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Esta ação não pode ser desfeita
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoApproval;
