import React, { useState, useEffect } from "react";
import "@/utils/suppressWarnings";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Crown,
  DollarSign,
  Video,
  Eye,
  Users,
  Calendar,
  Clock,
  Upload,
  Copy,
  ExternalLink,
  Settings,
  CreditCard,
  TrendingUp,
  PlayCircle,
  FileText,
  Share2,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Wallet,
  PiggyBank,
  Calculator,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useApiVideoAnalytics as useGoogleAnalytics } from "@/hooks/useApiVideoAnalytics";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import currentConfig from "@/lib/config";
import EnhancedBlockCalculator from "@/components/EnhancedBlockCalculator";
import AIChatButton from "@/components/AIChatButton";
import { useToast } from "@/hooks/use-toast";

// Legacy mock data - replaced by Google Analytics real-time data (GA4: G-FMZQ1MHE5G)
// These constants remain for fallback purposes only
const mockAnalytics = {
  views: 12543,
  subscribers: 1234,
  revenue: 5678.9,
  videos: 23,
  graceMonthsLeft: 2,
  subscriptionRate: 4.5,
  monthlyGrowth: 23.5,
};

const mockRevenueData = [
  { month: "Jan", revenue: 1200, views: 8500 },
  { month: "Fev", revenue: 1800, views: 12000 },
  { month: "Mar", revenue: 2200, views: 15000 },
  { month: "Abr", revenue: 2800, views: 18500 },
  { month: "Mai", revenue: 3500, views: 22000 },
  { month: "Jun", revenue: 4200, views: 28000 },
];

const mockViewsData = [
  { name: "Ficção", views: 4500, percentage: 35 },
  { name: "Documentário", views: 3200, percentage: 25 },
  { name: "Drama", views: 2800, percentage: 22 },
  { name: "Comédia", views: 2300, percentage: 18 },
];

const mockVideos = [
  {
    id: 1,
    title: "Entre o Céu e o Inferno - Episódio 1",
    status: "published",
    views: 5430,
    revenue: 234.5,
    uploadDate: "2024-01-15",
    duration: "45:30",
  },
  {
    id: 2,
    title: "Documentário: Amazônia Secreta",
    status: "pending",
    views: 0,
    revenue: 0,
    uploadDate: "2024-01-20",
    duration: "32:15",
  },
  {
    id: 3,
    title: "Making Of - Bastidores",
    status: "rejected",
    views: 0,
    revenue: 0,
    uploadDate: "2024-01-18",
    duration: "12:45",
  },
];

const COLORS = ["#FF8C42", "#9B59B6", "#3498DB", "#E74C3C"];

const GraceDates: React.FC = () => {
  const [dates, setDates] = React.useState<{ start?: string|null; end?: string|null; left?: number|null }>({});
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/creators/analytics", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
        const j = await resp.json();
        const o = j?.data?.overview || {};
        const fmt = (d: any) => (d ? new Date(d).toLocaleDateString("pt-BR") : null);
        setDates({ start: fmt(o.graceStartDate), end: fmt(o.graceEndDate), left: typeof o.graceMonthsLeft === "number" ? o.graceMonthsLeft : null });
      } catch {}
    };
    load();
  }, []);
  if (!dates.start && !dates.end) return <span>Sem carência ativa</span>;
  return <span>Início: {dates.start || "-"} • Fim: {dates.end || "-"} {typeof dates.left === "number" ? `(faltam ${dates.left} meses)` : ""}</span>;
};

export default function CreatorPortal() {
  const {
    analyticsData,
    revenueData,
    viewsData,
    videosData,
    trackPageView,
    refreshData,
  } = useGoogleAnalytics();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const location = useLocation();
  const [affiliateLink, setAffiliateLink] = useState("");
  const [paymentData, setPaymentData] = useState({
    bankName: "",
    accountType: "",
    agency: "",
    account: "",
    pixKey: "",
    cpfCnpj: "",
    fullName: "",
  });

  const [calcSubs, setCalcSubs] = useState(0);
  const [calcPrice, setCalcPrice] = useState(0);
  const [editSearch, setEditSearch] = useState("");
  const [editStatus, setEditStatus] = useState("all");
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [videosPeriod, setVideosPeriod] = useState<"daily"|"weekly"|"monthly">("monthly");
  const [modalVideos, setModalVideos] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [activeVideosCount, setActiveVideosCount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!showVideosModal) return;
      try {
        setModalLoading(true);
        setModalError("");
        const token = localStorage.getItem("xnema_token") || localStorage.getItem("token");
        if (!token) { setModalVideos([]); return; }
        const r = await fetch(`/api/creator/videos?period=${videosPeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ct = r.headers.get("content-type") || "";
        const t = await r.text();
        let j: any = {};
        if (ct.includes("application/json")) {
          try { j = t ? JSON.parse(t) : {}; } catch { j = {}; }
        }
        if (!r.ok) {
          const msg = j?.message || (r.status === 401 ? "Sessão expirada. Faça login." : `Erro ${r.status}`);
          setModalError(msg);
          setModalVideos([]);
          return;
        }
        const arr = Array.isArray(j?.videos) ? j.videos : (Array.isArray(j) ? j : []);
        setModalVideos(arr);
        setModalError("");
      } catch {
        // Silencia erros de parse/redes para evitar mensagem 'Unexpected token <'
        setModalError("");
        setModalVideos([]);
      } finally {
        setModalLoading(false);
      }
    };
    load();
  }, [showVideosModal, videosPeriod]);

  useEffect(() => {
    if (!user) return;
    const code = `creator_${String(user.id || "").slice(-8)}`;
    const base = currentConfig.baseUrl.replace(/\/$/, "");
    setAffiliateLink(`${base}/ref/${code}`);
  }, [user]);

  // Load real approved videos count for the card
  useEffect(() => {
    const loadCount = async () => {
      try {
        const token = localStorage.getItem("xnema_token") || localStorage.getItem("token");
        if (!user || !token) { setActiveVideosCount(0); return; }
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 3000);
        const r = await fetch(`/api/creator/active-videos`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(to);
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        const arr = Array.isArray(j) ? j : Array.isArray(j?.videos) ? j.videos : [];
        setActiveVideosCount(arr.length || 0);
      } catch {
        setActiveVideosCount(0);
      }
    };
    loadCount();
  }, [user]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      const tab = params.get("tab");
      if (tab) {
        setActiveTab(tab);
      } else if (location.pathname === "/creator") {
        setActiveTab("content");
      }
    } catch {}
  }, [location]);

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    // Show toast notification
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "published":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Publicado
          </Badge>
        );
      case "pending":
      case "pending_approval":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const calculateEstimatedBilling = () => {
    const monthlyFee = 1000;
    const currentRevenue = mockAnalytics.revenue;
    const estimatedDeduction = Math.min(currentRevenue * 0.3, monthlyFee);
    return {
      monthlyFee,
      currentRevenue,
      estimatedDeduction,
      netRevenue: currentRevenue - estimatedDeduction,
    };
  };

  const billing = calculateEstimatedBilling();

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Portal do{" "}
                  <span className="text-transparent bg-gradient-to-r from-green-500 to-green-700 bg-clip-text">
                    Criador
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Gerencie seu conteúdo. Dados aparecem aqui quando disponíveis.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  {analyticsData.loading
                    ? "Carregando..."
                    : analyticsData.graceMonthsLeft > 0
                      ? `Carência: ${analyticsData.graceMonthsLeft} meses`
                      : "Sem carência ativa"}
                </Badge>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Link to="/video-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Vídeo
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={analyticsData.loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${analyticsData.loading ? "animate-spin" : ""}`}
                  />
                  {analyticsData.loading ? "Atualizando..." : "Atualizar Dados"}
                </Button>
              </div>
            </div>
          </div>


          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6 lg:w-max">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <BarChart className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="affiliate"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Afiliação
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Cobrança
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Receita Total
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : `R$ ${analyticsData.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analyticsData.loading ? "..." : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Visualizações
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : analyticsData.views.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">&nbsp;</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Assinantes
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : analyticsData.subscribers.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analyticsData.loading ? "..." : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer" onClick={() => setShowVideosModal(true)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Vídeos Ativos
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {activeVideosCount}
                        </p>
                      </div>
                      <Video className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowVideosModal(true); }}>
                        Ver detalhes
                      </Button>
                      <Button asChild size="sm" className="bg-green-500 hover:bg-green-600 text-black" onClick={(e)=>e.stopPropagation()}>
                        <Link to="/creator/active-videos">Ir para Vídeos Ativos</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fetch modal videos */}
              {/* eslint-disable react-hooks/exhaustive-deps */}
              {(() => { /* self-invoking to keep hooks above returns */ return null; })()}

              <Dialog open={showVideosModal} onOpenChange={(o)=>{ setShowVideosModal(o); if (o) { /* trigger fetch */ } }}>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Meus Vídeos e Analytics</DialogTitle>
                    <DialogDescription>
                      Perfil do criador e métricas por vídeo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-muted" />
                      <div>
                        <div className="font-semibold">{user?.name || user?.email}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground">Vídeos</div>
                          <div className="text-2xl font-bold">{modalVideos.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground">Aprovados</div>
                          <div className="text-2xl font-bold text-green-600">{modalVideos.filter((v:any)=>String(v.status).includes("approved")).length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground">Pendentes</div>
                          <div className="text-2xl font-bold text-yellow-600">{modalVideos.filter((v:any)=>String(v.status).includes("pending")).length}</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-muted-foreground">Período:</div>
                      <Select value={videosPeriod} onValueChange={(v:any)=>setVideosPeriod(v)}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Mensal" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {modalError && (
                      <div className="text-sm text-red-500">{modalError}</div>
                    )}

                    <div className="space-y-3">
                      {modalLoading && <div className="text-sm text-muted-foreground">Carregando vídeos...</div>}
                      {!modalLoading && modalVideos.length === 0 && (
                        <div className="text-sm text-muted-foreground">Sem vídeos encontrados.</div>
                      )}
                      {modalVideos.map((v:any)=> (
                        <div key={v.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{v.title}</div>
                            <Badge variant={String(v.status).includes("approved")?"default":String(v.status).includes("rejected")?"destructive":"secondary"}>
                              {String(v.status)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{v.duration ? `${v.duration} min` : "-"} • {v.uploadedAt ? new Date(v.uploadedAt).toLocaleDateString("pt-BR") : "-"}</div>
                          <div className="flex items-center gap-6 mt-2 text-sm">
                            <span>Views: {Number(v?.analytics?.views||0).toLocaleString()}</span>
                            <span>Cliques: {Number(v?.analytics?.clicks||0).toLocaleString()}</span>
                            <span>Tempo assistido: {Number(v?.analytics?.watch_time||0)} s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Receita</CardTitle>
                  <CardDescription>
                    Receita mensal dos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Array.isArray(revenueData) && revenueData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          {/* Avoid XAxis/YAxis when unnecessary by gating on data */}
                          <XAxis dataKey="month" className="text-xs" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis className="text-xs" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                          <Line type="monotone" dataKey="revenue" stroke="#FF8C42" strokeWidth={3} dot={{ fill: "#FF8C42", strokeWidth: 2, r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Sem dados suficientes para o gráfico.</div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>Vídeos Recentes</CardTitle>
                  <CardDescription>
                    Seus uploads mais recentes e status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videosData.slice(0, 3).map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {video.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {video.duration} • {video.uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {video.views.toLocaleString()} views
                            </p>
                            <p className="text-xs text-green-600">
                              R$ {video.revenue.toFixed(2)}
                            </p>
                          </div>
                          {getStatusBadge(video.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Gerenciar Conteúdo
                  </h2>
                  <p className="text-muted-foreground">
                    Upload, edite e monitore seus vídeos
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                >
                  <Link to="/video-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Novo Upload
                  </Link>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Calculadora de Blocos</CardTitle>
                  <CardDescription>
                    Estime o custo do envio/armazenamento. Durante a carência, o valor pode ser R$ 0,00, mas planeje-se para depois.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedBlockCalculator />
                </CardContent>
              </Card>

              <AIChatButton />

              {/* Content List */}
              <Card>
                <CardHeader>
                  <CardTitle>Todos os Vídeos</CardTitle>
                  <CardDescription>
                    Gerencie toda sua biblioteca de conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videosData.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum vídeo encontrado.</p>
                    )}
                    {videosData.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center overflow-hidden">
                            {video.thumbnailUrl ? (
                              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <PlayCircle className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {video.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {video.duration} • Enviado {video.uploadDate}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {video.views.toLocaleString()} visualizações
                              </span>
                              <span className="text-xs text-green-600">
                                R$ {video.revenue.toFixed(2)} receita
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(video.status)}
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/content/${video.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/content/${video.id}/history`}>
                              <FileText className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Meus Uploads para Edição */}
              <Card>
                <CardHeader>
                  <CardTitle>Meus Uploads (Editar)</CardTitle>
                  <CardDescription>Filtre e edite seus vídeos enviados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
                    <Input
                      placeholder="Buscar por título..."
                      value={editSearch}
                      onChange={(e) => setEditSearch(e.target.value)}
                      className="max-w-md"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Select value={editStatus} onValueChange={(v) => setEditStatus(v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="pending_approval">Pendente</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-2">Vídeo</th>
                          <th className="py-2 pr-2">Enviado</th>
                          <th className="py-2 pr-2">Views</th>
                          <th className="py-2 pr-2">Status</th>
                          <th className="py-2 pr-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videosData
                          .filter((v) => {
                            const s = (editStatus === "pending" ? ["pending", "pending_approval"] : [editStatus]).filter(Boolean);
                            const okStatus = editStatus === "all" ? true : s.includes(String(v.status));
                            const okSearch = !editSearch || v.title.toLowerCase().includes(editSearch.toLowerCase());
                            return okStatus && okSearch;
                          })
                          .map((v) => (
                            <tr key={`row-${v.id}`} className="border-t">
                              <td className="py-3 pr-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-20 h-14 rounded bg-muted overflow-hidden flex items-center justify-center">
                                    {v.thumbnailUrl ? (
                                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <PlayCircle className="w-6 h-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">{v.title}</div>
                                    <div className="text-xs text-muted-foreground">{v.duration}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-2">{v.uploadDate || "-"}</td>
                              <td className="py-3 pr-2">{(v.views ?? 0).toLocaleString("pt-BR")}</td>
                              <td className="py-3 pr-2">{getStatusBadge(String(v.status))}</td>
                              <td className="py-3 pr-0">
                                <div className="flex items-center gap-2 justify-end">
                                  <Link
                                    to={`/content/${v.id}/edit`}
                                    className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-[length:200%_200%] animate-gradient"
                                  >
                                    Editar
                                  </Link>
                                  <Link
                                    to={`/content/${v.id}/history`}
                                    className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-[length:200%_200%] animate-gradient"
                                  >
                                    Histórico
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {videosData.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">Nenhum vídeo encontrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico do Criador */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico do Criador</CardTitle>
                  <CardDescription>Uploads, aprovações e rejeições</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videosData.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sem eventos ainda.</p>
                    )}
                    {videosData
                      .slice()
                      .sort((a: any, b: any) => {
                        const da = (a.approvedAt || a.uploadDate) ? new Date(a.approvedAt || a.uploadDate).getTime() : 0;
                        const db = (b.approvedAt || b.uploadDate) ? new Date(b.approvedAt || b.uploadDate).getTime() : 0;
                        return db - da;
                      })
                      .map((v: any) => {
                        const status = String(v.status || "");
                        const isApproved = status === "approved" || status === "published";
                        const isRejected = status === "rejected";
                        const iconClass = isApproved
                          ? "text-green-600"
                          : isRejected
                          ? "text-red-600"
                          : "text-muted-foreground";
                        const label = isApproved
                          ? `Aprovado ${v.approvedAt ? `em ${v.approvedAt}` : ""}`
                          : isRejected
                          ? "Rejeitado"
                          : `Enviado em ${v.uploadDate || ""}`;
                        return (
                          <div key={`hist-${v.id}`} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              {isApproved ? (
                                <CheckCircle className={`w-5 h-5 ${iconClass}`} />
                              ) : isRejected ? (
                                <XCircle className={`w-5 h-5 ${iconClass}`} />
                              ) : (
                                <Clock className={`w-5 h-5 ${iconClass}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">{v.title}</h4>
                                {getStatusBadge(status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{label}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Analytics Detalhados
                </h2>
                <p className="text-muted-foreground">
                  Insights profundos sobre seu desempenho
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizações por Categoria</CardTitle>
                    <CardDescription>
                      Distribuição do seu conteúdo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(viewsData) && viewsData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={viewsData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name} ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="views"
                            >
                              {viewsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Sem dados suficientes para o gráfico.</div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Mensal</CardTitle>
                    <CardDescription>Visualizações vs receita</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Sem dados suficientes para o gráfico.</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">45:30</p>
                      <p className="text-sm text-muted-foreground">
                        Tempo médio assistido
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-sm text-muted-foreground">
                        Taxa de retenção
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">234</p>
                      <p className="text-sm text-muted-foreground">
                        Novos assinantes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Affiliate Tab */}
            <TabsContent value="affiliate" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sistema de Afiliação
                </h2>
                <p className="text-muted-foreground">
                  Compartilhe seus links e ganhe comissões
                </p>
              </div>

              {/* Affiliate Link */}
              <Card>
                <CardHeader>
                  <CardTitle>Seu Link de Afiliação</CardTitle>
                  <CardDescription>
                    Compartilhe este link para receber comissões de novos
                    assinantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={affiliateLink}
                      readOnly
                      className="font-mono"
                    />
                    <Button onClick={copyAffiliateLink} variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>

                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      Cada novo assinante que se cadastrar através do seu link em cinexnema.com gera uma comissão de 15% sobre o valor da assinatura.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">42</p>
                      <p className="text-sm text-muted-foreground">
                        Cliques no link
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <UserPlus className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">
                        Novos assinantes
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">R$ 127,80</p>
                      <p className="text-sm text-muted-foreground">
                        Comissão acumulada
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Share */}
              <Card>
                <CardHeader>
                  <CardTitle>Compartilhar nas Redes Sociais</CardTitle>
                  <CardDescription>
                    Use estes bot��es para compartilhar facilmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Dados para Pagamento
                </h2>
                <p className="text-muted-foreground">
                  Configure suas informações bancárias para receber pagamentos
                </p>
              </div>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Bancárias</CardTitle>
                  <CardDescription>
                    Dados necessários para transferências e PIX
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={paymentData.fullName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                      <Input
                        id="cpfCnpj"
                        value={paymentData.cpfCnpj}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cpfCnpj: e.target.value,
                          })
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Bancários</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco</Label>
                        <Select
                          value={paymentData.bankName}
                          onValueChange={(value) =>
                            setPaymentData({ ...paymentData, bankName: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o banco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="001">Banco do Brasil</SelectItem>
                            <SelectItem value="237">Bradesco</SelectItem>
                            <SelectItem value="104">Caixa Econômica</SelectItem>
                            <SelectItem value="341">Itaú</SelectItem>
                            <SelectItem value="033">Santander</SelectItem>
                            <SelectItem value="260">Nu Pagamentos</SelectItem>
                            <SelectItem value="077">Banco Inter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Conta</Label>
                        <Select
                          value={paymentData.accountType}
                          onValueChange={(value) =>
                            setPaymentData({
                              ...paymentData,
                              accountType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo da conta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corrente">
                              Conta Corrente
                            </SelectItem>
                            <SelectItem value="poupanca">
                              Conta Poupança
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência</Label>
                        <Input
                          id="agency"
                          value={paymentData.agency}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              agency: e.target.value,
                            })
                          }
                          placeholder="0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account">Conta</Label>
                        <Input
                          id="account"
                          value={paymentData.account}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              account: e.target.value,
                            })
                          }
                          placeholder="00000-0"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">PIX</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={paymentData.pixKey}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            pixKey: e.target.value,
                          })
                        }
                        placeholder="CPF, email, telefone ou chave aleatória"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={async()=>{
                      if (!user) return;
                      try {
                        const resp = await fetch(`/api/creators/${encodeURIComponent(user.id)}/bank`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
                          body: JSON.stringify({
                            fullName: paymentData.fullName,
                            cpfCnpj: paymentData.cpfCnpj,
                            bankName: paymentData.bankName,
                            accountType: paymentData.accountType,
                            agency: paymentData.agency,
                            account: paymentData.account,
                            pixKey: paymentData.pixKey,
                          }),
                        });
                        if (!resp.ok) throw new Error("Falha ao salvar");
                        toast({ title: "Dados salvos", description: "Informações bancárias atualizadas." });
                      } catch (e:any) {
                        toast({ title: "Erro ao salvar", description: e?.message || "Tente novamente", variant: "destructive" });
                      }
                    }}>
                      Salvar Dados
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Aguardando dados reais do analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                    Nenhum pagamento registrado ainda.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sistema de Cobrança
                </h2>
                <p className="text-muted-foreground">
                  Gerencie pagamentos automáticos e mensalidades
                </p>
              </div>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Atual</CardTitle>
                  <CardDescription>
                    Período de carência e próximas cobranças
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <PiggyBank className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-600">
                            Período de Carência
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <GraceDates />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Após o período de carência, será cobrada mensalidade
                          de R$ 1.000,00 que pode ser descontada automaticamente
                          da sua receita.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 70% Subscription Revenue Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculadora de Receita (ATÉ 70% das assinaturas)</CardTitle>
                  <CardDescription>
                    Baseado nas assinaturas geradas pelos seus links de criador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="calc-subs">Assinaturas geradas</Label>
                      <Input id="calc-subs" type="number" min={0} defaultValue={0} onChange={(e:any)=>setCalcSubs(Number(e.target.value)||0)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calc-price">Valor por assinatura (R$)</Label>
                      <Input id="calc-price" type="number" min={0} step="0.01" defaultValue={0} onChange={(e:any)=>setCalcPrice(Number(e.target.value)||0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Seu ganho (ATÉ 70%)</Label>
                      <div className="text-2xl font-bold text-green-600">R$ {(calcSubs*calcPrice*0.7).toFixed(2)}</div>
                    </div>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Este cálculo considera apenas assinaturas atribuídas aos seus links. Integração com dados reais em breve.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Compra de Blocos */}
              <Card>
                <CardHeader>
                  <CardTitle>Compra de Blocos</CardTitle>
                  <CardDescription>
                    Adquira capacidade de upload através de blocos. Cada bloco libera armazenamento e envio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 border-2 border-green-500">
                      <div className="text-center">
                        <Wallet className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-green-700">Entenda os Blocos</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Os blocos definem sua capacidade de envio/armazenamento. Após a carência, a mensalidade pode ser descontada da sua receita.
                        </p>
                        <Button asChild className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" size="sm">
                          <Link to="/blocks-policy">Saiba mais</Link>
                        </Button>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold">Comprar Blocos</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Direcione para a página de política de blocos para detalhes e aquisição.
                        </p>
                        <Button asChild variant="outline" className="w-full mt-4" size="sm">
                          <Link to="/blocks-policy">Comprar</Link>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Calculadora de Blocos */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculadora de Blocos</CardTitle>
                  <CardDescription>Planeje sua necessidade de blocos</CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedBlockCalculator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
