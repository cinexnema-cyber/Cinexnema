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
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { useAuth } from "@/contexts/AuthContextReal";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Play,
  Star,
  CreditCard,
  Download,
  Settings,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Tv,
  Monitor,
  Tablet,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, Suspense } from "react";
import ContinueWatching from "@/components/ContinueWatching";

export default function SmartDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<
    "active" | "expired" | "processing"
  >("active");
  const [watchTime, setWatchTime] = useState(0);
  const [recommendedContent, setRecommendedContent] = useState<any[]>([]);

  // Handle user authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Devices hooks must be declared before any early return to keep hooks order stable
  type DeviceItem = { id: string | number; device_id?: string; email?: string | null; ip?: string | null; user_agent?: string | null; created_at?: string | null };
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [trustedEmail, setTrustedEmail] = useState("");
  type ChildRow = { id: string | number; email: string; status?: string };
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [trustedEmailsList, setTrustedEmailsList] = useState<string[]>([]);
  const [localChildEmails, setLocalChildEmails] = useState<string[]>([]);

  const fetchDevices = async () => {
    try {
      const r = await fetch("/api/devices", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
      const j = await r.json();
      setDevices(Array.isArray(j?.devices) ? j.devices : []);
    } catch {
      setDevices([]);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const fetchChildren = async () => {
    try {
      setLoadingChildren(true);
      let r = await fetch("/api/child_accounts", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
      if (r.status === 404) r = await fetch("/api/child-accounts", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
      const txt = await r.text();
      const j = txt ? JSON.parse(txt) : {};
      setChildren(Array.isArray(j?.children) ? j.children : []);
    } catch { setChildren([]); } finally { setLoadingChildren(false); }
  };
  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    try {
      const arr = (user as any)?.trusted_emails;
      setTrustedEmailsList(Array.isArray(arr) ? arr : []);
    } catch { setTrustedEmailsList([]); }
  }, [user]);

  // Load locally cached child emails (immediate UI feedback)
  useEffect(() => {
    const key = `xnema_child_emails_${(user as any)?.id || "anon"}`;
    try {
      const raw = localStorage.getItem(key);
      setLocalChildEmails(raw ? JSON.parse(raw) : []);
    } catch {
      setLocalChildEmails([]);
    }
  }, [user]);

  const emancipar = async (id: string | number) => {
    await fetch(`/api/child_accounts/${id}/emancipate`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    fetchChildren();
    alert("Conta emancipada. O email agora pode realizar pagamentos e gerenciar contas.");
  };

  const emanciparEmail = async (email: string) => {
    await fetch(`/api/child_accounts/emancipate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
      body: JSON.stringify({ email }),
    });
    setTrustedEmailsList((arr) => arr.filter((e) => e.toLowerCase() !== email.toLowerCase()));
    alert("Email emancipado. Agora é uma conta independente.");
  };

  const remover = async (id: string | number) => {
    await fetch(`/api/devices/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    fetchDevices();
  };

  const adicionarEmail = async () => {
    if (!trustedEmail) return;
    setAddingChild(true);
    const payload = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
      body: JSON.stringify({ email: trustedEmail.trim().toLowerCase() }),
    } as RequestInit;
    try {
      let r = await fetch("/api/child_accounts", payload);
      if (r.status === 404) r = await fetch("/api/child-accounts", payload);
      if (r.status === 404) r = await fetch("/api/devices/trusted", payload);
      if (r.ok) {
        const txt = await r.text();
        try {
          const j = txt ? JSON.parse(txt) : {};
          if (Array.isArray(j?.trusted_emails)) setTrustedEmailsList(j.trusted_emails);
        } catch {}
        setTrustedEmail("");
        await fetchChildren();
        // update local cache for instant display
        try {
          const key = `xnema_child_emails_${(user as any)?.id || "anon"}`;
          const next = Array.from(new Set([...(localChildEmails || []), trustedEmail.trim().toLowerCase()]));
          setLocalChildEmails(next);
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        alert("Conta filho adicionada");
      } else {
        const t = await r.text();
        try { const j = t ? JSON.parse(t) : {}; alert(j?.error || `Erro (${r.status}) ao adicionar conta filho`); } catch { alert(`Erro (${r.status}) ao adicionar conta filho`); }
      }
    } finally {
      setAddingChild(false);
    }
  };

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const userProfile = {
    name: user.name,
    email: user.email,
    subscriptionDate: user.subscriptionStart
      ? new Date(user.subscriptionStart).toLocaleDateString("pt-BR")
      : "2024-12-15",
    nextBilling: user.subscriptionStart
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "pt-BR",
        )
      : "2025-01-15",
    plan: user.assinante
      ? "Premium"
      : user.role.charAt(0).toUpperCase() + user.role.slice(1),
    devices: 4,
    activeDevices: 2,
  };

  // Real data will be loaded by ContinueWatching component

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tv":
        return <Tv className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handlePaymentRenewal = () => {
    window.open("https://mpago.la/1p9Jkyy", "_blank");
  };

  const handleOfflineDownload = (contentId: number) => {
    // Simulate download
    alert(`Iniciando download para visualização offline...`);
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Olá, {userProfile.name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta à sua experiência XNEMA{" "}
                  {user.assinante ? "Premium" : ""}
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-lg px-4 py-2">
                <Crown className="w-5 h-5 text-black" />
                <span className="text-black font-semibold">
                  {userProfile.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status da Assinatura
                </CardTitle>
                <Crown className="h-4 w-4 text-xnema-orange" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${user.assinante ? "text-green-500" : "text-yellow-500"}`}
                >
                  {user.assinante ? "Ativa" : "Inativa"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.assinante
                    ? `Renova em ${userProfile.nextBilling}`
                    : "Assine para ter acesso completo"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Assistido
                </CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h 32min</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dispositivos Ativos
                </CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile.activeDevices}/{userProfile.devices}
                </div>
                <p className="text-xs text-muted-foreground">
                  Máximo permitido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conteúdo Favorito
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Itens salvos</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="continue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="continue">Continuar</TabsTrigger>
              <TabsTrigger value="recommended">Para Você</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              <TabsTrigger value="billing">Cobrança</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Continue Watching */}
            <TabsContent value="continue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Assistindo</CardTitle>
                  <CardDescription>Retome de onde parou</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-1">
                    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando...</div>}>
                      <ContinueWatching />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations */}
            <TabsContent value="recommended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendado Para Você</CardTitle>
                  <CardDescription>
                    Baseado no seu histórico de visualização e preferências
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedContent.map((item, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted mb-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>

                          {/* Recommendation Badge */}
                          <div className="absolute top-2 left-2 bg-xnema-orange text-black text-xs px-2 py-1 rounded font-semibold">
                            {item.reason}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices */}
            <TabsContent value="devices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos Conectados</CardTitle>
                  <CardDescription>
                    Gerencie onde você assiste XNEMA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {devices.length === 0 && (
                      <div className="text-sm text-muted-foreground">Nenhum dispositivo registrado.</div>
                    )}

                    {/* Contas Filho */}
                    <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <div className="font-semibold">Contas Filho</div>
                      <div className="text-xs text-muted-foreground">Use o campo abaixo para adicionar e gerenciar</div>
                    </div>

                    {devices.map((device) => (
                      <div
                        key={String(device.id)}
                        className="flex items-center justify-between p-4 bg-xnema-surface rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-green-500`}>
                            {getDeviceIcon("mobile")}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {device.user_agent?.slice(0, 28) || device.device_id}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{device.email || ""} {device.created_at ? `• ${new Date(device.created_at).toLocaleString("pt-BR")}` : ""}</span>
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => remover(device.id)}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="email"
                        value={trustedEmail}
                        onChange={(e) => setTrustedEmail(e.target.value)}
                        placeholder="Email da conta filho"
                        className="border p-2 rounded bg-background text-foreground flex-1"
                      />
                      <Button size="sm" onClick={adicionarEmail} className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 text-black font-semibold shadow-[0_0_18px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_rgba(16,185,129,0.8)] bg-[length:200%_200%] animate-gradient">
                        {addingChild ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
                            Adicionando...
                          </span>
                        ) : (
                          "Adicionar Conta Filho"
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate("/emancipacao")}>
                        Emancipação de Conta
                      </Button>
                    </div>

                    {/* Lista de contas filho (abaixo do input) */}
                    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <div className="font-semibold mb-2">Minhas Contas Filho</div>
                      {loadingChildren ? (
                        <div className="text-sm text-muted-foreground">Carregando...</div>
                      ) : (() => {
                        const all = Array.from(new Set([...(trustedEmailsList || []), ...(children || []).map((c) => c.email), ...(localChildEmails || [])]));
                        if (all.length === 0) return <div className="text-sm text-muted-foreground">Nenhuma conta filho cadastrada.</div>;
                        return (
                          <div className="space-y-2">
                            {all.map((email) => (
                              <div key={email} className="flex items-center justify-between p-2 rounded bg-background/50">
                                <div>
                                  <div className="font-medium">{email}</div>
                                  <div className="text-xs text-muted-foreground">Conta filho</div>
                                </div>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => emanciparEmail(email)}>
                                  Emancipar
                                </Button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">
                      📱 Compatibilidade Total
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      XNEMA funciona perfeitamente em Smart TVs, celulares,
                      tablets, computadores e navegadores web. Qualidade
                      adaptativa automática para cada dispositivo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Cobrança</CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura e método de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className={`flex items-center justify-between p-4 ${user.assinante ? "bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30" : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"} rounded-lg`}
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {user.assinante
                          ? "Assinatura Premium Ativa"
                          : "Sem Assinatura Ativa"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.assinante
                          ? `Pr��xima cobrança: ${userProfile.nextBilling}`
                          : "Assine para ter acesso completo ao conteúdo"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${user.assinante ? "text-green-500" : "text-yellow-500"}`}
                      >
                        R$ 19,90
                      </div>
                      <div className="text-sm text-muted-foreground">
                        mensal
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">
                        Método de Pagamento
                      </h4>
                      <div className="p-4 bg-xnema-surface rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-8 h-8 text-xnema-orange" />
                          <div>
                            <p className="font-semibold text-foreground">
                              Mercado Pago
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Renovação automática
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Ações</h4>
                      <div className="space-y-2">
                        {user.assinante ? (
                          <>
                            <Button
                              onClick={handlePaymentRenewal}
                              className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                            >
                              Renovar Agora
                            </Button>
                            <Button variant="outline" className="w-full">
                              Alterar Método
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                            >
                              Cancelar Assinatura
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => navigate("/pricing")}
                              className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                            >
                              Assinar Premium
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => navigate("/pricing")}
                            >
                              Ver Planos
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      💳 Pagamento Automático Ativo
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sua assinatura será renovada automaticamente. Você
                      receberá um email de confirmação antes de cada cobrança.
                      Link de pagamento: https://mpago.la/1p9Jkyy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>
                    Personalize sua experiência XNEMA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      Preferências de Reprodução
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Qualidade padrão
                        </span>
                        <select className="bg-background border border-xnema-border rounded px-3 py-1">
                          <option>Auto (Recomendado)</option>
                          <option>4K Ultra HD</option>
                          <option>1080p Full HD</option>
                          <option>720p HD</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Reprodução automática
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Legendas automáticas
                        </span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      Notificações
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Novos episódios</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Recomendações personalizadas
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Ofertas especiais
                        </span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
