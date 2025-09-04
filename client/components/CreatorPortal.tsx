import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Video,
  Eye,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorData {
  access: boolean;
  blocksAvailable: number;
  blocksFree: number;
  blocksPurchased: number;
  blocksUsed: number;
  freeBlockActive: boolean;
  freeBlockExpiry: string;
  storageInfo: {
    totalGB: number;
    usedGB: number;
    availableGB: number;
  };
  videosUploaded: number;
  message?: string;
}

interface CreatorPortalProps {
  creatorData?: CreatorData;
  onDataUpdate?: () => void;
}

export function CreatorPortal({
  creatorData,
  onDataUpdate,
}: CreatorPortalProps) {
  const { user } = useAuth();
  const [data, setData] = useState<CreatorData | null>(creatorData || null);
  const [isLoading, setIsLoading] = useState(!creatorData);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!creatorData) {
      fetchCreatorData();
    }
  }, [creatorData]);

  const fetchCreatorData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/creator/access", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do criador:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buyBlocks = async (blocksToAdd: number = 1) => {
    try {
      setIsPurchasing(true);

      const response = await fetch(`/api/creator-blocks/${user?.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({ blocks: blocksToAdd }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar compra");
      }

      const result = await response.json();

      // Redirect to Mercado Pago
      window.location.href = result.purchase.checkoutUrl;
    } catch (error) {
      console.error("Erro na compra:", error);
      alert("Erro ao processar pagamento");
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.access) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Acesso Indisponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {data?.message || "Aguardando dados reais"}
            </p>
            <p className="text-sm">
              Blocos disponíveis: {data?.blocksAvailable || 0}
            </p>

            <div className="space-y-2">
              <p className="font-medium">Para começar a fazer upload:</p>
              <Button
                onClick={() => buyBlocks(1)}
                disabled={isPurchasing}
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isPurchasing
                  ? "Processando..."
                  : "Comprar Primeiro Bloco - R$ 1.000"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const storageUsagePercentage =
    data.storageInfo.totalGB > 0
      ? Math.round((data.storageInfo.usedGB / data.storageInfo.totalGB) * 100)
      : 0;

  const blocksUsagePercentage =
    data.blocksFree + data.blocksPurchased > 0
      ? Math.round(
          (data.blocksUsed / (data.blocksFree + data.blocksPurchased)) * 100,
        )
      : 0;

  const daysUntilExpiry = data.freeBlockActive
    ? getDaysUntilExpiry(data.freeBlockExpiry)
    : 0;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Blocos Disponíveis
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.blocksAvailable}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vídeos Enviados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.videosUploaded}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(data.storageInfo.usedGB * 10) / 10}GB
                </p>
                <p className="text-xs text-muted-foreground">
                  de {Math.round(data.storageInfo.totalGB * 10) / 10}GB
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
                  Blocos Comprados
                </p>
                <p className="text-2xl font-bold text-xnema-orange">
                  {data.blocksPurchased}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Free Block Status */}
      {data.freeBlockActive && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">🎉 Bloco Gratuito Ativo!</p>
                <p className="text-sm">
                  Você tem {data.blocksFree} bloco gratuito válido por mais{" "}
                  {daysUntilExpiry} dias (até {formatDate(data.freeBlockExpiry)}
                  )
                </p>
              </div>
              <Badge className="bg-green-600 text-white">
                <Calendar className="w-3 h-3 mr-1" />
                {daysUntilExpiry} dias
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-500" />
            Uso do Armazenamento
          </CardTitle>
          <CardDescription>
            Acompanhe o uso dos seus blocos de armazenamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blocks Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Blocos Usados</span>
              <span className="text-sm text-muted-foreground">
                {data.blocksUsed} de {data.blocksFree + data.blocksPurchased}{" "}
                blocos
              </span>
            </div>
            <Progress value={blocksUsagePercentage} className="h-2" />
          </div>

          {/* Storage Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Armazenamento Usado</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.storageInfo.usedGB * 10) / 10}GB de{" "}
                {Math.round(data.storageInfo.totalGB * 10) / 10}GB
              </span>
            </div>
            <Progress value={storageUsagePercentage} className="h-2" />
          </div>

          {/* Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium">Blocos Gratuitos</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {data.blocksFree}
                </span>
                <Badge variant={data.freeBlockActive ? "default" : "secondary"}>
                  {data.freeBlockActive ? "Ativo" : "Expirado"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Blocos Comprados</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {data.blocksPurchased}
                </span>
                <Badge variant="outline">Permanente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-xnema-orange" />
            Comprar Mais Blocos
          </CardTitle>
          <CardDescription>
            Aumente sua capacidade de armazenamento comprando blocos adicionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.blocksAvailable === 0 ? (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Limite de blocos atingido!</strong> Você precisa comprar
                mais blocos para continuar enviando vídeos.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950 mb-4">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Você ainda tem <strong>{data.blocksAvailable} bloco(s)</strong>{" "}
                disponível(is) para upload.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 hover:border-xnema-orange/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="space-y-3">
                  <h3 className="font-semibold">1 Bloco</h3>
                  <p className="text-2xl font-bold text-xnema-orange">
                    R$ 1.000
                  </p>
                  <p className="text-sm text-muted-foreground">
                    7,3 GB de armazenamento
                  </p>
                  <Button
                    onClick={() => buyBlocks(1)}
                    disabled={isPurchasing}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPurchasing ? "Processando..." : "Comprar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-xnema-orange/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="space-y-3">
                  <h3 className="font-semibold">5 Blocos</h3>
                  <p className="text-2xl font-bold text-xnema-orange">
                    R$ 4.750
                  </p>
                  <p className="text-sm text-muted-foreground">
                    36,5 GB de armazenamento
                  </p>
                  <Badge className="bg-green-500 text-white mb-2">
                    5% de desconto
                  </Badge>
                  <Button
                    onClick={() => buyBlocks(5)}
                    disabled={isPurchasing}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPurchasing ? "Processando..." : "Comprar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-xnema-orange/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="space-y-3">
                  <h3 className="font-semibold">10 Blocos</h3>
                  <p className="text-2xl font-bold text-xnema-orange">
                    R$ 9.000
                  </p>
                  <p className="text-sm text-muted-foreground">
                    73 GB de armazenamento
                  </p>
                  <Badge className="bg-blue-500 text-white mb-2">
                    10% de desconto
                  </Badge>
                  <Button
                    onClick={() => buyBlocks(10)}
                    disabled={isPurchasing}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPurchasing ? "Processando..." : "Comprar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">Como funciona:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1 bloco = 7,3 GB de armazenamento por R$ 1.000</li>
                  <li>• Pagamento via Mercado Pago com liberação automática</li>
                  <li>• Blocos são válidos permanentemente (não expiram)</li>
                  <li>• Use apenas os blocos necessários para cada vídeo</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            fetchCreatorData();
            if (onDataUpdate) onDataUpdate();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Atualizar Dados
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default CreatorPortal;
