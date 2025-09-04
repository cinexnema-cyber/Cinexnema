import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  HardDrive,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap,
} from "lucide-react";

// Tabela de referência baseada na especificação
const VIDEO_SIZE_TABLE = {
  "720p": {
    name: "HD (720p)",
    sizePerMinute: 0.73 / 40, // GB por minuto
    quality: "HD",
  },
  "1080p": {
    name: "Full HD (1080p)",
    sizePerMinute: 1.46 / 40, // GB por minuto
    quality: "Full HD",
  },
  "4k": {
    name: "4K Ultra HD",
    sizePerMinute: 4.39 / 40, // GB por minuto
    quality: "Ultra HD",
  },
};

const BLOCK_SIZE_GB = 7.3;
const BLOCK_PRICE = 1000;

interface CalculationResult {
  totalSizeGB: number;
  blocksNeeded: number;
  totalPrice: number;
  canAfford: boolean;
  details: {
    resolution: string;
    duration: number;
    videoCount: number;
    sizePerVideo: number;
  };
}

interface VideoBlockCalculatorProps {
  onCalculationChange?: (result: CalculationResult) => void;
  maxBlocksAvailable?: number;
  className?: string;
}

export const VideoBlockCalculator: React.FC<VideoBlockCalculatorProps> = ({
  onCalculationChange,
  maxBlocksAvailable = 10,
  className = "",
}) => {
  const [duration, setDuration] = useState<number>(40);
  const [resolution, setResolution] = useState<string>("1080p");
  const [videoCount, setVideoCount] = useState<number>(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null,
  );

  // Calcular automaticamente quando inputs mudam
  useEffect(() => {
    calculateBlocks();
  }, [duration, resolution, videoCount]);

  const calculateBlocks = () => {
    if (!duration || duration <= 0 || !resolution || videoCount <= 0) {
      setCalculation(null);
      return;
    }

    const resolutionData =
      VIDEO_SIZE_TABLE[resolution as keyof typeof VIDEO_SIZE_TABLE];
    if (!resolutionData) {
      setCalculation(null);
      return;
    }

    // Calcular tamanho por vídeo
    const sizePerVideo = duration * resolutionData.sizePerMinute;

    // Calcular total
    const totalSizeGB = sizePerVideo * videoCount;

    // Calcular blocos necessários (sempre arredondar para cima)
    const blocksNeeded = Math.ceil(totalSizeGB / BLOCK_SIZE_GB);

    // Calcular preço total
    const totalPrice = blocksNeeded * BLOCK_PRICE;

    // Verificar se pode pagar (baseado no limite disponível)
    const canAfford = blocksNeeded <= maxBlocksAvailable;

    const result: CalculationResult = {
      totalSizeGB: Math.round(totalSizeGB * 100) / 100,
      blocksNeeded,
      totalPrice,
      canAfford,
      details: {
        resolution: resolutionData.name,
        duration,
        videoCount,
        sizePerVideo: Math.round(sizePerVideo * 100) / 100,
      },
    };

    setCalculation(result);

    // Notificar componente pai
    if (onCalculationChange) {
      onCalculationChange(result);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getExampleVideos = () => {
    if (!calculation) return [];

    return [
      {
        resolution: "720p",
        duration: 40,
        size: 0.73,
        blocks: 1,
        price: 1000,
      },
      {
        resolution: "1080p",
        duration: 90,
        size: 3.3,
        blocks: 1,
        price: 1000,
      },
      {
        resolution: "4K",
        duration: 90,
        size: 9.9,
        blocks: 2,
        price: 2000,
      },
    ];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculadora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-xnema-orange" />
            Calculadora de Blocos
          </CardTitle>
          <CardDescription>
            Calcule o custo de armazenamento para seus vídeos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="300"
                value={duration || ""}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolução</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a resolução" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">HD (720p)</SelectItem>
                  <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoCount">Quantidade de Vídeos</Label>
              <Input
                id="videoCount"
                type="number"
                min="1"
                max="100"
                value={videoCount || ""}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                placeholder="1"
              />
            </div>
          </div>

          {/* Resultado */}
          {calculation && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <HardDrive className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Espaço Total</p>
                  <p className="font-bold text-lg">
                    {calculation.totalSizeGB} GB
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-xnema-orange mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Blocos</p>
                  <p className="font-bold text-lg">
                    {calculation.blocksNeeded}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <CreditCard className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-bold text-lg text-green-600">
                    {formatPrice(calculation.totalPrice)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  {calculation.canAfford ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      calculation.canAfford ? "bg-green-500" : "bg-red-500"
                    }
                  >
                    {calculation.canAfford ? "Disponível" : "Excede Limite"}
                  </Badge>
                </div>
              </div>

              {/* Detalhes */}
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Detalhes do Cálculo:</strong>
                    </p>
                    <p>
                      • {calculation.details.videoCount} vídeo(s) em{" "}
                      {calculation.details.resolution}
                    </p>
                    <p>
                      • {calculation.details.duration} minutos cada ={" "}
                      {calculation.details.sizePerVideo} GB por vídeo
                    </p>
                    <p>
                      • Total: {calculation.totalSizeGB} GB ÷ {BLOCK_SIZE_GB}{" "}
                      GB/bloco = {calculation.blocksNeeded} bloco(s)
                    </p>
                    <p>
                      • Preço: {calculation.blocksNeeded} ×{" "}
                      {formatPrice(BLOCK_PRICE)} ={" "}
                      {formatPrice(calculation.totalPrice)}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {!calculation.canAfford && (
                <Alert className="border-red-500 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Limite Excedido:</strong> Você precisaria de{" "}
                    {calculation.blocksNeeded} blocos, mas o limite atual é{" "}
                    {maxBlocksAvailable} blocos. Considere reduzir a duração,
                    resolução ou quantidade de vídeos.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Referência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Tabela de Referência
          </CardTitle>
          <CardDescription>
            Exemplos de tamanhos e custos por resolução e duração
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Resolução</th>
                  <th className="text-left p-2">Duração</th>
                  <th className="text-left p-2">Tamanho</th>
                  <th className="text-left p-2">Blocos</th>
                  <th className="text-left p-2">Preço</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">720p (HD)</td>
                  <td className="p-2">40 min</td>
                  <td className="p-2">0,73 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">1080p (Full HD)</td>
                  <td className="p-2">40 min</td>
                  <td className="p-2">1,46 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">4K (Ultra HD)</td>
                  <td className="p-2">40 min</td>
                  <td className="p-2">4,39 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">720p (HD)</td>
                  <td className="p-2">90 min</td>
                  <td className="p-2">1,65 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">1080p (Full HD)</td>
                  <td className="p-2">90 min</td>
                  <td className="p-2">3,30 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b bg-yellow-50 dark:bg-yellow-950">
                  <td className="p-2">4K (Ultra HD)</td>
                  <td className="p-2">90 min</td>
                  <td className="p-2">9,90 GB</td>
                  <td className="p-2 font-semibold">2 blocos</td>
                  <td className="p-2 text-yellow-600 font-semibold">R$2.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">720p (HD)</td>
                  <td className="p-2">120 min</td>
                  <td className="p-2">2,20 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">1080p (Full HD)</td>
                  <td className="p-2">120 min</td>
                  <td className="p-2">4,40 GB</td>
                  <td className="p-2">1 bloco</td>
                  <td className="p-2 text-green-600 font-semibold">R$1.000</td>
                </tr>
                <tr className="bg-yellow-50 dark:bg-yellow-950">
                  <td className="p-2">4K (Ultra HD)</td>
                  <td className="p-2">120 min</td>
                  <td className="p-2">13,2 GB</td>
                  <td className="p-2 font-semibold">2 blocos</td>
                  <td className="p-2 text-yellow-600 font-semibold">R$2.000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Regra:</strong> 1 bloco = 7,3 GB = R$1.000 • Blocos são
              sempre arredondados para cima
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoBlockCalculator;
export type { CalculationResult };
