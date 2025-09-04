import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HardDrive,
  Video,
  Crown,
  Clock,
  DollarSign,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
  User,
  Calendar,
  TrendingUp,
  Ban,
  Unlock,
  Edit,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorLimitData {
  storageUsedGB: number;
  storageLimitGB: number;
  storageUsedPercentage: number;
  videoCount: number;
  videoCountLimit: number;
  graceMonthsLeft: number;
  isGracePeriod: boolean;
  totalRevenue: number;
  totalViews: number;
  currentCommissionRate: number;
  remainingStorageGB: number;
  restrictions: {
    canUpload: boolean;
    reason?: string;
  };
}

interface CreatorLimitsProps {
  creatorId?: string;
  showAdminControls?: boolean;
  onLimitsUpdate?: (limits: CreatorLimitData) => void;
}

export const CreatorLimits: React.FC<CreatorLimitsProps> = ({
  creatorId,
  showAdminControls = false,
  onLimitsUpdate,
}) => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<CreatorLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [newStorageLimit, setNewStorageLimit] = useState("");
  const [newVideoLimit, setNewVideoLimit] = useState("");

  const targetCreatorId = creatorId || user?.id;

  // Fetch creator limits
  const fetchLimits = async () => {
    if (!targetCreatorId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/creators/${targetCreatorId}/limits`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLimits(data.limits);
        if (onLimitsUpdate) {
          onLimitsUpdate(data.limits);
        }
      }
    } catch (error) {
      console.error("Error fetching creator limits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [targetCreatorId]);

  // Handle restriction toggle
  const handleRestrictionToggle = async (restrict: boolean) => {
    if (!targetCreatorId || !limits) return;

    if (restrict && !restrictionReason.trim()) {
      alert("Motivo da restrição é obrigatório");
      return;
    }

    setActionLoading(true);
    try {
      const endpoint = restrict ? "restrict" : "allow";
      const response = await fetch(
        `/api/admin/creators/${targetCreatorId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
          body: JSON.stringify({
            reason: restrict ? restrictionReason.trim() : undefined,
          }),
        },
      );

      if (response.ok) {
        await fetchLimits();
        setRestrictionReason("");
      } else {
        throw new Error("Falha ao alterar restrição");
      }
    } catch (error) {
      console.error("Error toggling restriction:", error);
      alert("Erro ao alterar restrição");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle limits update
  const handleLimitsUpdate = async () => {
    if (!targetCreatorId || !newStorageLimit || !newVideoLimit) {
      alert("Todos os campos são obrigatórios");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/creators/${targetCreatorId}/limits`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
          body: JSON.stringify({
            storageLimit: parseFloat(newStorageLimit) * 1024 * 1024 * 1024, // GB to bytes
            videoCountLimit: parseInt(newVideoLimit),
          }),
        },
      );

      if (response.ok) {
        await fetchLimits();
        setNewStorageLimit("");
        setNewVideoLimit("");
      } else {
        throw new Error("Falha ao atualizar limites");
      }
    } catch (error) {
      console.error("Error updating limits:", error);
      alert("Erro ao atualizar limites");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limits) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p>Não foi possível carregar os limites do criador</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLimits}
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Armazenamento</p>
                <p className="font-semibold">
                  {limits.storageUsedGB.toFixed(2)} / {limits.storageLimitGB} GB
                </p>
                <Progress
                  value={limits.storageUsedPercentage}
                  className="mt-2"
                  color={
                    limits.storageUsedPercentage > 90
                      ? "bg-red-500"
                      : limits.storageUsedPercentage > 75
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }
                />
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
                <p className="text-sm text-muted-foreground">Vídeos</p>
                <p className="font-semibold">
                  {limits.videoCount} / {limits.videoCountLimit}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((limits.videoCount / limits.videoCountLimit) * 100).toFixed(
                    1,
                  )}
                  % usado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Período de Carência
                </p>
                <p className="font-semibold">
                  {limits.isGracePeriod
                    ? `${limits.graceMonthsLeft} meses`
                    : "Finalizado"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comissão: {limits.currentCommissionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="font-semibold">
                  R$ {limits.totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {limits.totalViews.toLocaleString("pt-BR")} visualizações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Status de Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          {limits.restrictions.canUpload ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Upload Liberado:</strong> Você pode enviar novos vídeos
                para a plataforma.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <Ban className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Upload Restrito:</strong>{" "}
                {limits.restrictions.reason || "Restrição ativa"}
              </AlertDescription>
            </Alert>
          )}

          {/* Storage Warning */}
          {limits.storageUsedPercentage > 90 && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 mt-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Aviso:</strong> Armazenamento quase esgotado (
                {limits.storageUsedPercentage.toFixed(1)}%). Considere deletar
                vídeos antigos ou solicitar aumento de limite.
              </AlertDescription>
            </Alert>
          )}

          {/* Video Limit Warning */}
          {limits.videoCount / limits.videoCountLimit > 0.9 && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 mt-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Aviso:</strong> Limite de vídeos quase atingido (
                {limits.videoCount}/{limits.videoCountLimit}).
                {showAdminControls
                  ? "Considere aumentar o limite."
                  : "Entre em contato para solicitar aumento."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Admin Controls */}
      {showAdminControls && user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Controles de Administrador
            </CardTitle>
            <CardDescription>
              Gerencie limites e restrições do criador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restriction Controls */}
            <div className="space-y-4">
              <Label>Controle de Restrições</Label>
              <div className="flex gap-4">
                {limits.restrictions.canUpload ? (
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Motivo da restrição (obrigatório)"
                      value={restrictionReason}
                      onChange={(e) => setRestrictionReason(e.target.value)}
                      rows={2}
                    />
                    <Button
                      variant="destructive"
                      onClick={() => handleRestrictionToggle(true)}
                      disabled={!restrictionReason.trim() || actionLoading}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {actionLoading ? "Restringindo..." : "Restringir Upload"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleRestrictionToggle(false)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {actionLoading ? "Liberando..." : "Liberar Upload"}
                  </Button>
                )}
              </div>
            </div>

            {/* Limits Update */}
            <div className="space-y-4">
              <Label>Atualizar Limites</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storage-limit">
                    Limite de Armazenamento (GB)
                  </Label>
                  <Input
                    id="storage-limit"
                    type="number"
                    min="1"
                    max="10000"
                    value={newStorageLimit}
                    onChange={(e) => setNewStorageLimit(e.target.value)}
                    placeholder={limits.storageLimitGB.toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-limit">Limite de Vídeos</Label>
                  <Input
                    id="video-limit"
                    type="number"
                    min="1"
                    max="10000"
                    value={newVideoLimit}
                    onChange={(e) => setNewVideoLimit(e.target.value)}
                    placeholder={limits.videoCountLimit.toString()}
                  />
                </div>
              </div>
              <Button
                onClick={handleLimitsUpdate}
                disabled={!newStorageLimit || !newVideoLimit || actionLoading}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {actionLoading ? "Atualizando..." : "Atualizar Limites"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grace Period Info */}
      {limits.isGracePeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-green-500" />
              Período de Carência Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  🎉 Benefícios do Período de Carência
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>
                    • <strong>100% da receita</strong> é sua por{" "}
                    {limits.graceMonthsLeft} meses
                  </li>
                  <li>• Sem comissões da plataforma</li>
                  <li>• Tempo para estabelecer sua audiência</li>
                  <li>• Suporte prioritário da equipe</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">
                    Após o período de carência:
                  </p>
                  <p className="text-muted-foreground">
                    70% para você, 30% para a plataforma
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Tempo restante:</p>
                  <p className="text-muted-foreground">
                    {limits.graceMonthsLeft} meses
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchLimits} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};

export default CreatorLimits;
