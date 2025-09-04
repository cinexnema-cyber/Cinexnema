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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  X,
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  checkoutUrl: string;
  features: string[];
}

interface SubscriptionData {
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    nextBilling?: string;
    paymentMethod?: string;
  } | null;
  isActive: boolean;
  hasAccess: boolean;
}

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (user?.role === "subscriber") {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          // Open Mercado Pago checkout in new window
          window.open(data.checkoutUrl, "_blank");
        }
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "User requested cancellation" }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchSubscriptionStatus(); // Refresh status
        setShowCancelDialog(false);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Carregando informações da assinatura...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Current subscription display
  if (subscriptionData?.subscription) {
    const { subscription, isActive, hasAccess } = subscriptionData;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-xnema-orange" />
              <span>Sua Assinatura</span>
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura XNEMA Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Plano {subscription.plan === "premium" ? "Premium" : "Básico"}
                </h3>
                <p className="text-muted-foreground">
                  R$ {subscription.plan === "premium" ? "19,90" : "19,90"}/mês
                </p>
              </div>
              <Badge variant={isActive ? "default" : "secondary"}>
                {subscription.status === "active"
                  ? "Ativo"
                  : subscription.status === "pending"
                    ? "Pendente"
                    : subscription.status === "cancelled"
                      ? "Cancelado"
                      : "Inativo"}
              </Badge>
            </div>

            {isActive && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua assinatura está ativa! Aproveite todo o catálogo premium.
                </AlertDescription>
              </Alert>
            )}

            {subscription.status === "pending" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pagamento em processamento. Você será notificado quando
                  aprovado.
                </AlertDescription>
              </Alert>
            )}

            {subscription.status === "cancelled" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Assinatura cancelada. Você manterá acesso até{" "}
                  {subscription.nextBilling
                    ? new Date(subscription.nextBilling).toLocaleDateString(
                        "pt-BR",
                      )
                    : "o final do período"}
                  .
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Início da assinatura</p>
                <p className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {subscription.nextBilling && (
                <div>
                  <p className="text-muted-foreground">Próxima cobrança</p>
                  <p className="font-medium">
                    {new Date(subscription.nextBilling).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              )}
            </div>

            {isActive && subscription.status !== "cancelled" && (
              <div className="pt-4 border-t border-xnema-border">
                <h4 className="font-medium text-foreground mb-2">
                  Cancelar Assinatura
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode cancelar sua assinatura a qualquer momento. O acesso
                  será mantido até o final do período pago.
                </p>

                {!showCancelDialog ? (
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancelar Assinatura
                  </Button>
                ) : (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Confirmar Cancelamento
                    </h5>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Tem certeza que deseja cancelar sua assinatura? Esta ação
                      não pode ser desfeita.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                      >
                        {cancelling
                          ? "Cancelando..."
                          : "Confirmar Cancelamento"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCancelDialog(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Manter Assinatura
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subscription plans display for non-subscribers
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planos de Assinatura</CardTitle>
          <CardDescription>Escolha o plano ideal para você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.id === "premium" ? "border-xnema-orange" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.id === "premium" && (
                      <Badge className="bg-xnema-orange text-black">
                        Recomendado
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      R$ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.id === "premium" ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Assinar Agora
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
