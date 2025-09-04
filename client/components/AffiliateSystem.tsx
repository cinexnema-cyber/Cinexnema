import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Link,
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  QrCode,
  ExternalLink,
  CheckCircle,
  Gift,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalEarnings: number;
  conversionRate: number;
  recentReferrals: Array<{
    id: string;
    userName: string;
    signupDate: string;
    planType: string;
    commission: number;
    status: "pending" | "paid";
  }>;
}

interface AffiliateSystemProps {
  className?: string;
}

export const AffiliateSystem: React.FC<AffiliateSystemProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [affiliateLink, setAffiliateLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user && user.tipo === "criador") {
      generateAffiliateLink();
      fetchAffiliateStats();
    }
  }, [user]);

  const generateAffiliateLink = async () => {
    try {
      const response = await fetch("/api/affiliate/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({
          creatorId: user?.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAffiliateLink(result.affiliateLink);
        setQrCodeUrl(result.qrCodeUrl);
      }
    } catch (error) {
      console.error("Erro ao gerar link de afiliação:", error);
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/affiliate/stats/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    const message = encodeURIComponent(
      "Descubra o melhor conteúdo brasileiro na XNEMA! Use meu link para 1 mês grátis:",
    );
    const url = encodeURIComponent(affiliateLink);

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${message}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${message}&url=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram não permite links diretos
    };

    if (platform === "instagram") {
      // Para Instagram, copiamos o link e orientamos o usuário
      copyToClipboard();
      alert("Link copiado! Cole na bio ou stories do Instagram.");
      return;
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!user || user.tipo !== "criador") {
    return (
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <Gift className="h-4 w-4" />
        <AlertDescription>
          O sistema de afiliação está disponível apenas para criadores
          aprovados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Link de Afiliação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-xnema-orange" />
            Seu Link de Afiliação
          </CardTitle>
          <CardDescription>
            Compartilhe este link e ganhe 15% de comissão sobre cada nova
            assinatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={affiliateLink}
              readOnly
              className="font-mono text-sm bg-muted"
              placeholder="Gerando link..."
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copySuccess ? "Copiado!" : "Copiar"}
            </Button>
            <Button variant="outline">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <Gift className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Como funciona:</strong> Cada pessoa que se cadastrar
              através do seu link ganhará 1 mês grátis e você receberá 15% de
              comissão sobre os pagamentos mensais dela.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Compartilhamento Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Compartilhar nas Redes Sociais
          </CardTitle>
          <CardDescription>
            Use estes botões para compartilhar facilmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button
              variant="outline"
              onClick={() => shareOnSocialMedia("whatsapp")}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
            >
              <span className="text-lg">📱</span>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => shareOnSocialMedia("instagram")}
              className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20"
            >
              <span className="text-lg">📷</span>
              Instagram
            </Button>
            <Button
              variant="outline"
              onClick={() => shareOnSocialMedia("facebook")}
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/20"
            >
              <span className="text-lg">👤</span>
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => shareOnSocialMedia("twitter")}
              className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20"
            >
              <span className="text-lg">🐦</span>
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => shareOnSocialMedia("telegram")}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
            >
              <span className="text-lg">✈️</span>
              Telegram
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliques Totais</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : stats?.totalClicks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Novos Assinantes
                </p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : stats?.totalSignups || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Taxa de Conversão
                </p>
                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : `${(stats?.conversionRate || 0).toFixed(1)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-xnema-orange/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-xnema-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Comissões Acumuladas
                </p>
                <p className="text-2xl font-bold text-xnema-orange">
                  {loading ? "..." : formatCurrency(stats?.totalEarnings || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referidos Recentes */}
      {stats && stats.recentReferrals && stats.recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referidos Recentes</CardTitle>
            <CardDescription>
              Últimas pessoas que se cadastraram com seu link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {referral.planType} •{" "}
                        {new Date(referral.signupDate).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(referral.commission)}
                    </p>
                    <Badge
                      className={
                        referral.status === "paid"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {referral.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas para Melhorar Conversão */}
      <Card className="bg-gradient-to-br from-xnema-orange/10 to-xnema-purple/10 border-xnema-orange/20">
        <CardHeader>
          <CardTitle className="text-xnema-orange">
            💡 Dicas para Aumentar suas Comissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>
                ✅ <strong>Crie conteúdo autêntico</strong> sobre a XNEMA
              </p>
              <p>
                ✅ <strong>Compartilhe nos stories</strong> do Instagram
                regularmente
              </p>
              <p>
                ✅ <strong>Use chamadas atrativas</strong> como "1 mês grátis"
              </p>
            </div>
            <div className="space-y-2">
              <p>
                ✅ <strong>Engaje com seguidores</strong> que comentam sobre
                filmes
              </p>
              <p>
                ✅ <strong>Publique reviews</strong> dos conteúdos exclusivos
              </p>
              <p>
                ✅ <strong>Mencione benefícios</strong> como qualidade 4K
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSystem;
