import React from "react";
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
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentError() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parâmetros que podem vir do Mercado Pago
  const collection_status = searchParams.get("collection_status");
  const status = searchParams.get("status");
  const status_detail = searchParams.get("status_detail");
  const external_reference = searchParams.get("external_reference");

  const getErrorMessage = () => {
    switch (collection_status || status) {
      case "rejected":
        return "Seu pagamento foi rejeitado. Verifique os dados do cartão ou tente outro método de pagamento.";
      case "cancelled":
        return "O pagamento foi cancelado. Você pode tentar novamente quando quiser.";
      case "pending":
        return "Seu pagamento está pendente. Aguarde a confirmação ou entre em contato conosco.";
      default:
        return "Houve um problema ao processar seu pagamento. Tente novamente ou entre em contato conosco.";
    }
  };

  const getErrorTitle = () => {
    switch (collection_status || status) {
      case "rejected":
        return "Pagamento Rejeitado";
      case "cancelled":
        return "Pagamento Cancelado";
      case "pending":
        return "Pagamento Pendente";
      default:
        return "Erro no Pagamento";
    }
  };

  const handleTryAgain = () => {
    // Se havia um plano na referência externa, tenta preservar
    const planFromRef = external_reference?.includes("monthly")
      ? "monthly"
      : external_reference?.includes("yearly")
        ? "yearly"
        : "monthly";
    navigate(`/payments?plan=${planFromRef}`);
  };

  const handleContact = () => {
    navigate("/contact");
  };

  const handleBackToCatalog = () => {
    navigate("/catalog");
  };

  const isPending = collection_status === "pending" || status === "pending";

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card
            className={`bg-xnema-surface ${isPending ? "border-yellow-500" : "border-red-500"}`}
          >
            <CardHeader className="text-center">
              {isPending ? (
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}

              <Badge
                className={`${isPending ? "bg-yellow-500" : "bg-red-500"} text-white mb-4 px-4 py-2`}
              >
                {isPending
                  ? "⏳ Pagamento Pendente"
                  : "❌ Pagamento Não Realizado"}
              </Badge>

              <CardTitle className="text-2xl text-white mb-2">
                {getErrorTitle()}
              </CardTitle>
              <CardDescription className="text-lg text-gray-300">
                {getErrorMessage()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Informações do Erro */}
              <Alert
                className={`${isPending ? "border-yellow-500 bg-yellow-500/10" : "border-red-500 bg-red-500/10"}`}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription
                  className={isPending ? "text-yellow-400" : "text-red-400"}
                >
                  {isPending
                    ? "Seu pagamento está sendo processado. Isso pode levar alguns minutos. Se aprovado, você receberá um email de confirmação."
                    : "Não se preocupe, nenhum valor foi cobrado. Você pode tentar novamente ou escolher outro método de pagamento."}
                </AlertDescription>
              </Alert>

              {/* Detalhes Técnicos (se disponível) */}
              {(status_detail || external_reference) && (
                <div className="bg-muted border border-gray-600 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">
                    Detalhes Técnicos
                  </h3>
                  <div className="space-y-2 text-sm">
                    {status_detail && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Detalhes:</span>
                        <span className="text-white">{status_detail}</span>
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
                  </div>
                </div>
              )}

              {/* Possíveis Soluções */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">
                  O que você pode fazer:
                </h3>

                <div className="grid gap-4">
                  {!isPending && (
                    <div className="flex items-start gap-3 p-4 bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg">
                      <CreditCard className="w-6 h-6 text-xnema-orange mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          Verificar dados do cartão
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Confirme se os dados do cartão estão corretos: número,
                          validade, CVV e nome do titular.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Tentar novamente
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {isPending
                          ? "Se o pagamento não for confirmado em alguns minutos, você pode tentar novamente."
                          : "Você pode tentar novamente com os dados corretos ou outro cartão."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Entrar em contato
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Nossa equipe de suporte está pronta para ajudar com
                        qualquer problema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                {!isPending && (
                  <Button
                    onClick={handleTryAgain}
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold py-6"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Tentar Novamente
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleContact}
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Suporte
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleBackToCatalog}
                    className="flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                </div>
              </div>

              {/* Garantia */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-green-400 mb-2">
                  🛡️ Garantia de Segurança
                </h4>
                <p className="text-gray-400 text-sm">
                  Todos os pagamentos são processados com segurança pelo Mercado
                  Pago. Seus dados estão protegidos e nenhum valor é cobrado em
                  caso de erro.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
