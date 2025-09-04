import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Video, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  Upload, 
  Calendar, 
  Users, 
  Star,
  Play,
  BarChart3,
  LogOut,
  Settings,
  Award
} from "lucide-react";

interface VideoStats {
  id: string;
  title: string;
  views: number;
  earnings: number;
  uploadDate: string;
  status: 'published' | 'pending' | 'draft';
  thumbnail: string;
}

export default function CreatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Dados simulados do criador (em produção, viriam da API)
  const [creatorStats] = useState({
    totalVideos: 12,
    totalViews: 45630,
    totalEarnings: 2847.50,
    monthlyEarnings: 680.30,
    subscribersGained: 234,
    avgRating: 4.8,
    lastPayment: "15/03/2024",
    nextPayment: "15/04/2024"
  });

  const [videos] = useState<VideoStats[]>([
    {
      id: "1",
      title: "Episódio 1 - A Jornada Começa",
      views: 12450,
      earnings: 456.80,
      uploadDate: "2024-03-10",
      status: 'published',
      thumbnail: "https://images.unsplash.com/photo-1478720568477-b0b5f3fb4b6e?w=300&h=200&fit=crop"
    },
    {
      id: "2", 
      title: "Bastidores da Produção",
      views: 8320,
      earnings: 298.50,
      uploadDate: "2024-03-15",
      status: 'published',
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=200&fit=crop"
    },
    {
      id: "3",
      title: "Episódio 2 - O Conflito",
      views: 9876,
      earnings: 352.70,
      uploadDate: "2024-03-20",
      status: 'published',
      thumbnail: "https://images.unsplash.com/photo-1489599639166-9d01aee85cef?w=300&h=200&fit=crop"
    },
    {
      id: "4",
      title: "Episódio 3 - Em Produção",
      views: 0,
      earnings: 0,
      uploadDate: "2024-03-25",
      status: 'draft',
      thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=200&fit=crop"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publicado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-xnema-purple rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Portal do Criador</h1>
                  <p className="text-muted-foreground">
                    Bem-vindo de volta, {user.displayName}!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-xnema-purple text-white px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  Criador Verificado
                </Badge>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="content">Meu Conteúdo</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Ganhos</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{creatorStats.totalVideos}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 este mês
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(creatorStats.totalViews)}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% este mês
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(creatorStats.totalEarnings)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(creatorStats.monthlyEarnings)} este mês
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{creatorStats.avgRating}</div>
                    <p className="text-xs text-muted-foreground">
                      De {creatorStats.subscribersGained} avaliações
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Recente */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance do Mês</CardTitle>
                    <CardDescription>
                      Progresso em direção às suas metas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Meta de Visualizações</span>
                        <span className="text-sm text-muted-foreground">8,5K / 10K</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Meta de Ganhos</span>
                        <span className="text-sm text-muted-foreground">R$ 680 / R$ 800</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uploads Planejados</span>
                        <span className="text-sm text-muted-foreground">3 / 4</span>
                      </div>
                      <Progress value={75} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Pagamentos</CardTitle>
                    <CardDescription>
                      Cronograma de pagamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div>
                          <div className="font-semibold text-green-700 dark:text-green-300">
                            Último Pagamento
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {creatorStats.lastPayment}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {formatCurrency(580.25)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div>
                          <div className="font-semibold text-blue-700 dark:text-blue-300">
                            Próximo Pagamento
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {creatorStats.nextPayment}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {formatCurrency(creatorStats.monthlyEarnings)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Meu Conteúdo */}
            <TabsContent value="content" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Meu Conteúdo</h2>
                  <p className="text-muted-foreground">Gerencie todos os seus vídeos</p>
                </div>
                <Button className="bg-xnema-purple hover:bg-xnema-purple/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Novo Upload
                </Button>
              </div>

              <div className="grid gap-6">
                {videos.map((video) => (
                  <Card key={video.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{video.title}</h3>
                            {getStatusBadge(video.status)}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {formatNumber(video.views)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(video.earnings)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(video.uploadDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          {video.status === 'published' && (
                            <Button variant="outline" size="sm">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analytics
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Detalhados</CardTitle>
                  <CardDescription>
                    Insights sobre o desempenho do seu conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Avançados</h3>
                    <p className="text-muted-foreground mb-4">
                      Gráficos detalhados e métricas de performance estarão disponíveis em breve
                    </p>
                    <Button variant="outline">
                      Solicitar Acesso Beta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ganhos */}
            <TabsContent value="earnings" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Ganhos Este Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(creatorStats.monthlyEarnings)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +23% vs mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">RPM Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 15,40</div>
                    <p className="text-xs text-muted-foreground">
                      Por mil visualizações
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15/04</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(creatorStats.monthlyEarnings)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: '15/03/2024', amount: 580.25, status: 'paid' },
                      { date: '15/02/2024', amount: 445.80, status: 'paid' },
                      { date: '15/01/2024', amount: 612.90, status: 'paid' },
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{payment.date}</div>
                          <div className="text-sm text-muted-foreground">Pagamento mensal</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                          <Badge className="bg-green-500">Pago</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ferramentas */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ferramentas de Upload</CardTitle>
                    <CardDescription>
                      Envie e gerencie seus vídeos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-xnema-purple hover:bg-xnema-purple/90">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload de Vídeo
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações de Upload
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suporte</CardTitle>
                    <CardDescription>
                      Recursos e ajuda para criadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Comunidade de Criadores
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Award className="w-4 h-4 mr-2" />
                      Centro de Ajuda
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
