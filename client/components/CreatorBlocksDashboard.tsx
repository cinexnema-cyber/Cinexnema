import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HardDrive,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  FileVideo,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorBlocksData {
  creatorBlocks: {
    totalBlocks: number;
    usedBlocks: number;
    availableBlocks: number;
    totalStorageGB: number;
    usedStorageGB: number;
    availableStorageGB: number;
    stats: {
      totalVideoCount: number;
      totalRevenue: number;
      totalViews: number;
      averageSizePerVideo: number;
    };
    canUpload: boolean;
    restrictions?: {
      reason?: string;
      restrictedAt?: string;
    };
  };
  summary: {
    blocks: {
      total: number;
      used: number;
      available: number;
      usagePercentage: number;
    };
    storage: {
      totalGB: number;
      usedGB: number;
      availableGB: number;
      usagePercentage: number;
    };
  };
}

interface PurchaseHistory {
  id: string;
  date: string;
  blocks: number;
  amountFormatted: string;
  status: "pending" | "approved" | "rejected";
  transactionId: string;
}

interface CreatorBlocksDashboardProps {
  creatorId?: string;
  onPurchaseComplete?: () => void;
  className?: string;
}

export const CreatorBlocksDashboard: React.FC<CreatorBlocksDashboardProps> = ({
  creatorId,
  onPurchaseComplete,
  className = "",
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<CreatorBlocksData | null>(null);
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [purchasing, setPurchasing] = useState(false);

  const targetCreatorId = creatorId || user?.id;

  useEffect(() => {
    if (targetCreatorId) {
      fetchCreatorBlocks();
      fetchPurchaseHistory();
    }
  }, [targetCreatorId]);

  const fetchCreatorBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/creator-blocks/${targetCreatorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar dados dos blocos");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch(
        `/api/creator-blocks/${targetCreatorId}/purchases`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setPurchases(result.purchases.slice(0, 5)); // Últimas 5 compras
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };

  const handlePurchaseBlocks = async (blocks: number) => {
    try {
      setPurchasing(true);
      const response = await fetch(
        `/api/creator-blocks/${targetCreatorId}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
          body: JSON.stringify({ blocks }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao iniciar compra");
      }

      const result = await response.json();

      // Redirecionar para Mercado Pago
      window.location.href = result.purchase.checkoutUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      case "rejected":
        return "Rejeitado";
      default:
        return "Desconhecido";
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const { creatorBlocks, summary } = data;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Blocos Disponíveis
                </p>
                <p className="text-2xl font-bold">
                  {creatorBlocks.availableBlocks}
                </p>
                <p className="text-xs text-muted-foreground">
                  de {creatorBlocks.totalBlocks} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold">
                  {summary.storage.availableGB.toFixed(1)} GB
                </p>
                <p className="text-xs text-muted-foreground">
                  de {summary.storage.totalGB.toFixed(1)} GB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vídeos</p>
                <p className="text-2xl font-bold">
                  {creatorBlocks.stats.totalVideoCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {creatorBlocks.stats.averageSizePerVideo.toFixed(1)} GB média
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
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">
                  {formatPrice(creatorBlocks.stats.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {creatorBlocks.stats.totalViews.toLocaleString()} views
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uso de Blocos</CardTitle>
            <CardDescription>
              {summary.blocks.used} de {summary.blocks.total} blocos utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress
                value={summary.blocks.usagePercentage}
                className="h-3"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{summary.blocks.usagePercentage}% utilizado</span>
                <span>{summary.blocks.available} blocos restantes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uso de Armazenamento</CardTitle>
            <CardDescription>
              {summary.storage.usedGB.toFixed(1)} GB de{" "}
              {summary.storage.totalGB.toFixed(1)} GB utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress
                value={summary.storage.usagePercentage}
                className="h-3"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{summary.storage.usagePercentage}% utilizado</span>
                <span>
                  {summary.storage.availableGB.toFixed(1)} GB restantes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status */}
      {!creatorBlocks.canUpload && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Upload Restrito:</strong>{" "}
            {creatorBlocks.restrictions?.reason}
          </AlertDescription>
        </Alert>
      )}

      {/* Purchase Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-xnema-orange" />
            Comprar Mais Blocos
          </CardTitle>
          <CardDescription>
            Cada bloco oferece 7,3 GB de armazenamento por R$ 1.000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[1, 5, 10].map((blocks) => (
              <Card
                key={blocks}
                className="border-2 hover:border-xnema-orange transition-colors cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <p className="text-2xl font-bold">{blocks}</p>
                    <p className="text-sm text-muted-foreground">
                      bloco{blocks > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-lg text-muted-foreground">
                      {(blocks * 7.3).toFixed(1)} GB
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(blocks * 100000)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePurchaseBlocks(blocks)}
                    disabled={purchasing}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Pagamento Seguro:</strong> Processado via Mercado Pago.
              Após a confirmação, os blocos serão adicionados automaticamente à
              sua conta.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Compras Recentes
            </CardTitle>
            <CardDescription>Últimas transações de blocos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(purchase.status)}>
                      {getStatusText(purchase.status)}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {purchase.blocks} bloco{purchase.blocks > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {purchase.amountFormatted}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{purchase.transactionId.slice(-8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorBlocksDashboard;
