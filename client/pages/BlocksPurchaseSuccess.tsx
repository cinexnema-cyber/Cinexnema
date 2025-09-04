import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextReal";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  HardDrive,
  Zap,
  ArrowRight,
  Upload,
  Loader2,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BlocksPurchaseSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [blocksInfo, setBlocksInfo] = useState<any>(null);

  // Parâmetros que podem vir do Mercado Pago
  const collection_id = searchParams.get("collection_id");
  const collection_status = searchParams.get("collection_status");
  const external_reference = searchParams.get("external_reference");

  useEffect(() => {
    const confirmPurchase = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Aguardar processamento do webhook
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Buscar informações atualizadas dos blocos
        const response = await fetch(`/api/creator-blocks/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setBlocksInfo(result);
        }

        // Verificar se a compra foi confirmada
        if (collection_status === "approved") {
          setPurchaseConfirmed(true);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Erro ao confirmar compra:", err);
        setError(
          "Erro ao confirmar compra. Por favor, verifique seus blocos no painel.",
        );
        setLoading(false);
      }
    };

    confirmPurchase();
  }, [user, collection_status, navigate]);

  const handleContinueUpload = () => {
    navigate("/video-upload");
  };

  useEffect(() => {
    if (purchaseConfirmed) {
      const t = setTimeout(() => navigate("/video-upload"), 1200);
      return () => clearTimeout(t);
    }
  }, [purchaseConfirmed, navigate]);

  const handleViewBlocks = () => {
    navigate("/creator-dashboard");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-xnema-dark">
          <Card className="w-full max-w-md bg-xnema-surface border-gray-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-xnema-orange mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-white mb-2">
                Confirmando Compra
              </h2>
              <p className="text-gray-400">
                Aguarde enquanto processamos a compra dos seus blocos...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen py-20 bg-xnema-dark">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="bg-xnema-surface border-red-500">
              <CardHeader className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">
                  Problema na Confirmação
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Houve um problema ao confirmar sua compra de blocos
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <p className="text-gray-400 mb-6">
                    Se você efetuou o pagamento, os blocos serão adicionados em
                    breve. Verifique seu painel de blocos ou entre em contato
                    conosco.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleViewBlocks}
                      variant="outline"
                      className="w-full"
                    >
                      Ver Painel de Blocos
                    </Button>

                    <Button
                      onClick={() => navigate("/contact")}
                      className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    >
                      Entrar em Contato
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-xnema-surface border-green-500">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <Badge className="bg-green-500 text-white mb-4 px-4 py-2">
                ✅ Compra Confirmada
              </Badge>
              <CardTitle className="text-3xl text-white mb-2">
                Blocos Adicionados{" "}
                <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                  com Sucesso!
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Seus blocos de armazenamento foram adicionados à sua conta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Informações dos Blocos */}
              {blocksInfo && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    Status Atual dos Blocos
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {blocksInfo.creatorBlocks.totalBlocks}
                      </p>
                      <p className="text-gray-400">Total de Blocos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {blocksInfo.creatorBlocks.availableBlocks}
                      </p>
                      <p className="text-gray-400">Blocos Disponíveis</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {blocksInfo.summary.storage.totalGB.toFixed(1)} GB
                      </p>
                      <p className="text-gray-400">Armazenamento Total</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações da Compra */}
              <div className="bg-muted border border-gray-600 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-xnema-orange" />
                  Detalhes da Compra
                </h3>

                <div className="space-y-3 text-sm">
                  {collection_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID da Transação:</span>
                      <span className="text-white font-mono text-xs">
                        {collection_id}
                      </span>
                    </div>
                  )}
                  {external_reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referência:</span>
                      <span className="text-white font-mono text-xs">
                        {external_reference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-500 text-white">Aprovado</Badge>
                  </div>
                </div>
              </div>

              {/* Como Usar */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Agora você pode:</h3>

                <div className="grid gap-3">
                  {[
                    "Fazer upload de vídeos sem limitações",
                    "O sistema calculará automaticamente os blocos necessários",
                    "Seus vídeos serão processados em qualidade 4K",
                    "Após aprovação, começar a ganhar 70% da receita",
                    "Comprar mais blocos quando necessário",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                <Button
                  onClick={handleContinueUpload}
                  className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Começar Upload de Vídeo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleViewBlocks}
                    className="flex items-center justify-center gap-2"
                  >
                    <HardDrive className="w-4 h-4" />
                    Ver Blocos
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/creator-dashboard")}
                    className="flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Dashboard
                  </Button>
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg p-4">
                <h4 className="font-semibold text-xnema-orange mb-2">
                  📧 Confirmação por Email
                </h4>
                <p className="text-gray-400 text-sm">
                  Enviamos uma confirmação da compra para seu email. Seus blocos
                  já estão disponíveis para uso e não expiram. Use-os quando
                  quiser!
                </p>
              </div>

              {/* Sistema de Blocos Explicado */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">
                  💡 Como Funciona o Sistema
                </h4>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>
                    • <strong>1 bloco = 7,3 GB</strong> de armazenamento por R$
                    1.000
                  </p>
                  <p>
                    • Blocos são calculados automaticamente baseado no seu vídeo
                  </p>
                  <p>
                    • Vídeos 4K de 90+ minutos podem precisar de 2 blocos ou
                    mais
                  </p>
                  <p>• Pagamento único por bloco, sem mensalidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
