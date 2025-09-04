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
import { useAuth } from "@/contexts/AuthContext";
import VideoApproval from "@/components/VideoApproval";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Users,
  Video,
  BarChart,
  Settings,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  UserCheck,
  UserX,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  createdAt: string;
}

interface PendingCreator extends User {
  profile: {
    bio?: string;
    portfolio?: string;
    status: "pending" | "approved" | "rejected";
  };
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingCreators, setPendingCreators] = useState<PendingCreator[]>([]);
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [creatorsFull, setCreatorsFull] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUsers();
    fetchPendingContent();
    fetchCreatorsFull();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPendingCreators(
          data.users.filter(
            (u: any) => u.role === "creator" && u.profile?.status === "pending",
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorsFull = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let response = await fetch("/api/admin/creators-full", { headers });
      if (response.ok) {
        const data = await response.json();
        const list = data.creators || [];
        setCreatorsFull(list);
        // If empty, try to import from Supabase and re-fetch
        if (Array.isArray(list) && list.length === 0) {
          try {
            await fetch("/api/admin/import-supabase-users", { method: "POST", headers });
            response = await fetch("/api/admin/creators-full", { headers });
            if (response.ok) {
              const d2 = await response.json();
              setCreatorsFull(d2.creators || []);
            }
          } catch (e) {
            console.warn("Auto-sync from Supabase failed:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };

  const fetchPendingContent = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/content/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingContent(data.content || []);
      }
    } catch (error) {
      console.error("Error fetching pending content:", error);
    }
  };

  const handleCreatorApproval = async (creatorId: string, approve: boolean) => {
    // This would be implemented with a proper API endpoint
    console.log(`${approve ? "Approving" : "Rejecting"} creator:`, creatorId);
    // Update local state for demo
    setPendingCreators((prev) => prev.filter((c) => c.id !== creatorId));
  };

  const stats = {
    totalUsers: users.length,
    subscribers: users.filter((u) => u.role === "subscriber").length,
    creators: users.filter((u) => u.role === "creator").length,
    pendingApprovals: pendingCreators.length,
    monthlyRevenue: 5840.5,
    contentViews: 12450,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Carregando painel administrativo...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel <span className="text-xnema-orange">Administrativo</span>
              </h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.name}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.subscribers} assinantes, {stats.creators} criadores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aprovações Pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {stats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Criadores aguardando aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Mensal
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  R$ {stats.monthlyRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Visualizações
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.contentViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de views</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("xnema_token");
                  await fetch("/api/admin/import-supabase-users", {
                    method: "POST",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  });
                  await fetchUsers();
                  await fetchCreatorsFull();
                } catch (e) {
                  console.error("Sync from Supabase failed:", e);
                }
              }}
            >
              Sincronizar do Supabase
            </Button>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="creators">
                <Video className="w-4 h-4 mr-2" />
                Criadores
              </TabsTrigger>
              <TabsTrigger value="content">
                <Settings className="w-4 h-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Usuários</CardTitle>
                  <CardDescription>
                    Visualizar e gerenciar todos os usuários da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-xnema-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                            {user.role === "admin" ? (
                              <Settings className="w-5 h-5 text-black" />
                            ) : user.role === "creator" ? (
                              <Video className="w-5 h-5 text-black" />
                            ) : (
                              <Crown className="w-5 h-5 text-black" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {user.name}
                            </h4>
                            {user.role !== "admin" && (
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : user.role === "creator"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {user.role === "admin"
                              ? "Admin"
                              : user.role === "creator"
                                ? "Criador"
                                : "Assinante"}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Creators Management */}
            <TabsContent value="creators" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Criadores</CardTitle>
                  <CardDescription>
                    Lista de criadores com histórico de conteúdos, views e receita estimada (USD)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {creatorsFull.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum criador encontrado</div>
                  ) : (
                    <div className="space-y-4">
                      {creatorsFull.map((c: any) => (
                        <div key={c.id} className="p-4 border border-xnema-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{c.name}</h4>
                              <p className="text-sm text-muted-foreground">{c.email}</p>
                              <p className="text-xs text-muted-foreground">Desde {new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Receita (USD)</p>
                              <p className="text-lg font-bold text-green-500">${(c.totalRevenueUSD || 0).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Views: {(c.totalViews || 0).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Vídeos: {c.totalVideos || 0}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">Conteúdos</h5>
                            {(!c.videos || c.videos.length === 0) ? (
                              <p className="text-xs text-muted-foreground">Sem vídeos cadastrados</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {c.videos.slice(0, 6).map((v: any) => (
                                  <div key={v.id} className="text-sm flex items-center justify-between p-2 border rounded">
                                    <span className="truncate mr-2">{v.title}</span>
                                    <span className="text-xs text-muted-foreground">{v.views || 0} views • ${(Number(v.revenueUSD || 0)).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-1">Dados Bancários (PIX)</h5>
                            {c.bank ? (
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Tipo: {c.bank.pix_type || 'chave'}</p>
                                <p>Chave: <span className="font-mono">{c.bank.pix_key}</span></p>
                                <p>Titular: {c.bank.holder_name} {c.bank.cpf ? `• CPF: ${c.bank.cpf}` : ''}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(String(c.bank.pix_key || ''))}>Copiar chave PIX</Button>
                                  <span className="text-[10px] text-muted-foreground">Use seu app bancário: Pagamentos &gt; PIX &gt; Transferir &gt; Colar chave</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Sem dados bancários cadastrados</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management */}
            <TabsContent value="content" className="space-y-6">
              <VideoApproval />
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics da Plataforma</CardTitle>
                  <CardDescription>
                    Métricas e relatórios detalhados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Dashboard de Analytics
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Relatórios detalhados sobre usuários, receita e
                      engajamento.
                    </p>
                    <Button variant="outline">Em Desenvolvimento</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
