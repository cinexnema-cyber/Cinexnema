import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Video,
  UserPlus,
  CreditCard,
  UserMinus,
  Crown,
  Smartphone,
  Monitor,
  Tablet,
  Tv,
  MapPin,
  Eye,
  Calendar,
  AlertCircle,
  Download
} from "lucide-react";

interface PlatformAnalyticsData {
  today: {
    total_users: number;
    total_subscribers: number;
    total_creators: number;
    daily_signups: number;
    daily_subscriptions: number;
    daily_cancellations: number;
    daily_revenue: number;
    creator_fees_collected: number;
    commission_paid_to_creators: number;
    top_content: Array<{
      title: string;
      views: number;
      revenue_generated: number;
    }>;
    traffic_sources: {
      direct: number;
      organic: number;
      referrals: number;
      creator_links: number;
    };
    device_stats: {
      mobile: number;
      desktop: number;
      tablet: number;
      tv: number;
    };
    geographic_data: Array<{
      state: string;
      city: string;
      users: number;
      subscribers: number;
    }>;
  };
  monthly: {
    total_revenue: number;
    total_signups: number;
    total_subscriptions: number;
    total_cancellations: number;
    total_creator_fees: number;
    total_commissions_paid: number;
  };
}

export default function PlatformAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se é o admin da plataforma
    if (!user || user.email !== 'cinexnema@gmail.com') {
      navigate('/dashboard');
      return;
    }

    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/platform', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('xnema_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Erro ao carregar dados de analytics');
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email !== 'cinexnema@gmail.com') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
            <p className="text-muted-foreground">Apenas para administradores da plataforma XNEMA.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Carregando analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analytics) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-500">Erro</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchAnalytics} className="mt-4">Tentar Novamente</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { today, monthly } = analytics;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics da Plataforma</h1>
            <p className="text-muted-foreground">Dashboard executivo - XNEMA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Badge className="bg-green-500 text-white">
              Administrador
            </Badge>
          </div>
        </div>

        {/* Métricas Principais - Hoje */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.total_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{today.daily_signups} hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{today.total_subscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{today.daily_subscriptions} novos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                R$ {today.daily_revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                R$ {monthly.total_revenue.toFixed(2)} no mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Criadores Ativos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.total_creators}</div>
              <p className="text-xs text-muted-foreground">
                R$ {today.creator_fees_collected.toFixed(2)} em taxas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Financeiro do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Receita de Assinaturas</span>
                <span className="font-bold text-green-500">R$ {today.daily_revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxas de Criadores</span>
                <span className="font-bold text-blue-500">R$ {today.creator_fees_collected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Comissões Pagas</span>
                <span className="font-bold text-orange-500">R$ {today.commission_paid_to_creators.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lucro Líquido</span>
                  <span className="font-bold text-green-600">
                    R$ {(today.daily_revenue + today.creator_fees_collected - today.commission_paid_to_creators).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Novos Usuários</span>
                <span className="font-bold">{monthly.total_signups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Novas Assinaturas</span>
                <span className="font-bold text-green-500">{monthly.total_subscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cancelamentos</span>
                <span className="font-bold text-red-500">{monthly.total_cancellations}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Receita Total</span>
                  <span className="font-bold text-green-600">R$ {monthly.total_revenue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fontes de Tráfego e Dispositivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Tráfego</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Direto</span>
                  </div>
                  <span className="font-bold">{today.traffic_sources.direct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Orgânico</span>
                  </div>
                  <span className="font-bold">{today.traffic_sources.organic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Referências</span>
                  </div>
                  <span className="font-bold">{today.traffic_sources.referrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Links de Criadores</span>
                  </div>
                  <span className="font-bold">{today.traffic_sources.creator_links}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Mobile</span>
                  </div>
                  <span className="font-bold">{today.device_stats.mobile}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Desktop</span>
                  </div>
                  <span className="font-bold">{today.device_stats.desktop}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Tablet</span>
                  </div>
                  <span className="font-bold">{today.device_stats.tablet}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Smart TV</span>
                  </div>
                  <span className="font-bold">{today.device_stats.tv}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Top e Geografia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {today.top_content.map((content, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{content.title}</p>
                      <p className="text-xs text-muted-foreground">{content.views} visualizações</p>
                    </div>
                    <span className="font-bold text-green-500">R$ {content.revenue_generated.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geografia - Top Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {today.geographic_data.map((geo, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{geo.state}</p>
                        <p className="text-xs text-muted-foreground">{geo.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{geo.users} usuários</p>
                      <p className="text-xs text-green-500">{geo.subscribers} assinantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
