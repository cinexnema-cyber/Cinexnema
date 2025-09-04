import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  PaymentHistoryService,
  PaymentRecord,
  PaymentSummary,
} from "@/lib/paymentHistory";
import {
  ArrowLeft,
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Receipt,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function PaymentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentData();
    }
  }, [user]);

  const loadPaymentData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      // Busca histórico de pagamentos
      const historyResult = await PaymentHistoryService.getUserPaymentHistory(
        user.id,
      );
      if (historyResult.success && historyResult.data) {
        setPayments(historyResult.data);
      } else {
        // Se não há dados, cria alguns exemplos para demonstração
        console.log("Criando dados de exemplo...");
        await PaymentHistoryService.createSamplePayments(user.id, user.email);

        // Recarrega após criar exemplos
        const retryResult = await PaymentHistoryService.getUserPaymentHistory(
          user.id,
        );
        if (retryResult.success && retryResult.data) {
          setPayments(retryResult.data);
        }
      }

      // Busca resumo
      const summaryResult = await PaymentHistoryService.getUserPaymentSummary(
        user.id,
      );
      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados de pagamento:", error);
      setError("Erro ao carregar histórico de pagamentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPaymentData();
    setIsRefreshing(false);
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    if (payment.metadata?.receipt_url) {
      window.open(payment.metadata.receipt_url, "_blank");
    } else {
      // Gera uma "fatura" simples
      const receiptContent = `
        XNEMA - Comprovante de Pagamento
        
        ID da Transação: ${payment.id}
        Data: ${PaymentHistoryService.formatDate(payment.payment_date)}
        Valor: ${PaymentHistoryService.formatCurrency(payment.amount, payment.currency)}
        Método: ${PaymentHistoryService.getPaymentMethodName(payment.payment_method)}
        Plano: ${payment.plan_type === "monthly" ? "Mensal" : "Anual"}
        Status: ${PaymentHistoryService.getStatusText(payment.status)}
        
        Email: ${payment.user_email}
        
        Obrigado por escolher a XNEMA!
      `;

      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xnema-receipt-${payment.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <Card className="bg-xnema-surface border-xnema-border p-8">
            <CardContent className="text-center">
              <p className="text-white">
                Você precisa estar logado para ver o histórico de pagamentos.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-4 bg-xnema-orange hover:bg-xnema-orange/90 text-black"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white py-8">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Histórico de Pagamentos</h1>
                <p className="text-gray-400">
                  Gerencie suas assinaturas e faturas
                </p>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-xnema-border text-white hover:bg-xnema-surface"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Alert className="border-red-600 bg-red-900/20 mb-6">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-xnema-orange mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">
                  Carregando histórico de pagamentos...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Payment Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-xnema-surface border-xnema-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-xnema-orange" />
                      Resumo da Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summary && (
                      <>
                        <div className="p-4 bg-xnema-dark rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">
                              Total Pago
                            </span>
                            <span className="text-lg font-bold text-xnema-orange">
                              {PaymentHistoryService.formatCurrency(
                                summary.total_paid,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Transações
                            </span>
                            <span className="text-sm">
                              {summary.total_transactions}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-gray-600" />

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Status da Assinatura
                            </span>
                            <Badge
                              className={
                                summary.active_subscription
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-600 text-white"
                              }
                            >
                              {summary.active_subscription
                                ? "Ativa"
                                : "Inativa"}
                            </Badge>
                          </div>

                          {summary.active_subscription &&
                            summary.subscription_type && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">
                                  Plano Atual
                                </span>
                                <span className="text-sm">
                                  {summary.subscription_type === "monthly"
                                    ? "Mensal"
                                    : "Anual"}
                                </span>
                              </div>
                            )}

                          {summary.next_billing_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">
                                Próximo Vencimento
                              </span>
                              <span className="text-sm">
                                {PaymentHistoryService.formatDate(
                                  summary.next_billing_date,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Separator className="bg-gray-600" />

                    <div className="space-y-2">
                      <Button
                        onClick={() => navigate("/pricing")}
                        className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Gerenciar Assinatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <div className="lg:col-span-2">
                <Card className="bg-xnema-surface border-xnema-border">
                  <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>
                      Visualize todas as suas transações e baixe comprovantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <Receipt className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhuma transação encontrada
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Você ainda não possui histórico de pagamentos.
                        </p>
                        <Button
                          onClick={() => navigate("/pricing")}
                          className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        >
                          Fazer Primeira Assinatura
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="p-4 border border-gray-700 rounded-lg hover:border-xnema-orange/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-xnema-dark rounded-full flex items-center justify-center">
                                  <span className="text-lg">
                                    {PaymentHistoryService.getPaymentMethodIcon(
                                      payment.payment_method,
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">
                                      Plano{" "}
                                      {payment.plan_type === "monthly"
                                        ? "Mensal"
                                        : "Anual"}
                                    </h3>
                                    {getStatusIcon(payment.status)}
                                    <Badge
                                      className={`${PaymentHistoryService.getStatusColor(payment.status)} bg-transparent border-current`}
                                    >
                                      {PaymentHistoryService.getStatusText(
                                        payment.status,
                                      )}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {PaymentHistoryService.formatDate(
                                        payment.payment_date,
                                      )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CreditCard className="w-3 h-3" />
                                      {PaymentHistoryService.getPaymentMethodName(
                                        payment.payment_method,
                                      )}
                                    </span>
                                  </div>
                                  {payment.metadata?.notes && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      {payment.metadata.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-xnema-orange">
                                    {PaymentHistoryService.formatCurrency(
                                      payment.amount,
                                      payment.currency,
                                    )}
                                  </div>
                                  {payment.subscription_end_date && (
                                    <div className="text-xs text-gray-400">
                                      Válido até{" "}
                                      {PaymentHistoryService.formatDate(
                                        payment.subscription_end_date,
                                      )}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(payment)}
                                  className="border-xnema-border text-white hover:bg-xnema-surface"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Comprovante
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 p-6 bg-xnema-surface/50 rounded-lg border border-xnema-border">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  💳 Métodos de Pagamento
                </h4>
                <p>
                  Aceitamos cartão de crédito, PIX, boleto bancário e Mercado
                  Pago para sua conveniência.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  🔄 Cancelamento
                </h4>
                <p>
                  Você pode cancelar a qualquer momento nas configurações da sua
                  conta ou entrando em contato conosco.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">📞 Suporte</h4>
                <p>
                  Em caso de problemas com pagamentos, entre em contato:
                  cinexnema@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
