import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calculator, HardDrive, DollarSign, AlertTriangle, CheckCircle, Info } from "lucide-react";

const BLOCK_SIZE_GB = 7.3;
const BLOCK_PRICE = 1000; // R$

export interface UploadProgressStats {
  loaded: number;
  total: number;
  speedBps: number;
  etaSec: number;
}

interface RealTimeBlockEstimatorProps {
  file: File | null;
  progress: UploadProgressStats | null;
  className?: string;
}

const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const bytesToGB = (bytes: number) => {
  const gb = bytes / (1024 ** 3);
  return Math.round(gb * 100) / 100;
};

export const RealTimeBlockEstimator: React.FC<RealTimeBlockEstimatorProps> = ({ file, progress, className = "" }) => {
  const totalBytes = useMemo(() => {
    if (progress?.total && progress.total > 0) return progress.total;
    if (file?.size) return file.size;
    return 0;
  }, [progress?.total, file?.size]);

  if (!file || !totalBytes) return null;

  const totalGB = bytesToGB(totalBytes);
  const blocksNeeded = Math.max(1, Math.ceil(totalGB / BLOCK_SIZE_GB));
  const priceAfterGrace = blocksNeeded * BLOCK_PRICE;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-xnema-orange" />
          Calculadora Automática de Blocos
        </CardTitle>
        <CardDescription>
          Estimativa baseada no arquivo selecionado (tamanho real)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <HardDrive className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tamanho Total</p>
            <p className="font-bold text-lg">{totalGB} GB</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 text-center">
            <Badge className="bg-purple-600 text-white mb-2">{BLOCK_SIZE_GB} GB/bloco</Badge>
            <p className="text-sm text-muted-foreground">Blocos Necessários</p>
            <p className="font-bold text-lg">{blocksNeeded}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Durante Carência (3 meses)</p>
            <p className="font-bold text-lg text-green-600">GRÁTIS</p>
          </div>
          <div className="bg-xnema-orange/10 rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 text-xnema-orange mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Após Carência</p>
            <p className="font-bold text-lg text-xnema-orange">{formatCurrencyBRL(priceAfterGrace)}</p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="text-sm space-y-1">
              <p>• Regra: 1 bloco = {BLOCK_SIZE_GB} GB = {formatCurrencyBRL(BLOCK_PRICE)}</p>
              <p>• O custo será zero durante o período de carência. Fora da carência, o valor estimado é {formatCurrencyBRL(priceAfterGrace)} para este arquivo.</p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default RealTimeBlockEstimator;
