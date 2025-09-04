import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useContentAccess } from "@/hooks/useContentAccess";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Crown, Lock, AlertCircle, CreditCard, Play } from "lucide-react";

interface ProtectedContentProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
  showPreview?: boolean;
  previewDuration?: number; // in seconds
  title?: string;
  description?: string;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  requiresSubscription = true,
  showPreview = false,
  previewDuration = 30,
  title = "Conteúdo Premium",
  description = "Este conteúdo está disponível apenas para assinantes premium.",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    hasAccess,
    isSubscriber,
    subscriptionStatus,
    isLoading,
    paymentConfirmed,
    subscriptionDetails,
  } = useContentAccess();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Verificando acesso ao conteúdo...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If content doesn't require subscription, show it
  if (!requiresSubscription) {
    return <>{children}</>;
  }

  // If user has access, show content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show different messages based on user status
  const getAccessMessage = () => {
    if (!user) {
      return {
        title: "Login Necessário",
        description: "Faça login para acessar este conteúdo premium.",
        action: () => navigate("/login"),
        actionText: "Fazer Login",
        icon: <Lock className="w-6 h-6" />,
      };
    }

    if (user.role === "creator") {
      return {
        title: "Acesso Limitado",
        description:
          "Este conteúdo é exclusivo para assinantes. Criadores podem acessar apenas o portal do criador.",
        action: () => navigate("/creator-portal"),
        actionText: "Ir para Portal do Criador",
        icon: <Lock className="w-6 h-6" />,
      };
    }

    if (isSubscriber) {
      if (!paymentConfirmed) {
        return {
          title: "Pagamento Pendente",
          description:
            "Sua assinatura foi criada, mas o pagamento ainda não foi confirmado. Vídeos serão liberados apenas após confirmação do pagamento.",
          action: () => navigate("/payment-history"),
          actionText: "Verificar Pagamento",
          icon: <AlertCircle className="w-6 h-6" />,
        };
      }

      if (subscriptionStatus === "pending") {
        return {
          title: "Pagamento em Processamento",
          description:
            "Seu pagamento está sendo processado. Você receberá acesso assim que for aprovado.",
          action: () => navigate("/dashboard"),
          actionText: "Ver Status da Assinatura",
          icon: <AlertCircle className="w-6 h-6" />,
        };
      }

      if (
        subscriptionStatus === "cancelled" ||
        subscriptionStatus === "inactive" ||
        subscriptionStatus === "inativo"
      ) {
        return {
          title: "Assinatura Inativa",
          description:
            "Sua assinatura está inativa. Renove para continuar acessando o conteúdo premium.",
          action: () => navigate("/pricing"),
          actionText: "Renovar Assinatura",
          icon: <Crown className="w-6 h-6" />,
        };
      }
    }

    // Default message for non-subscribers
    return {
      title: "Conteúdo Premium",
      description:
        "Este conteúdo está disponível apenas para assinantes premium da XNEMA.",
      action: () => navigate("/pricing"),
      actionText: "Assinar Agora",
      icon: <Crown className="w-6 h-6" />,
    };
  };

  const accessInfo = getAccessMessage();

  return (
    <Card className="w-full border-xnema-orange/20">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
          {accessInfo.icon}
        </div>
        <CardTitle className="text-2xl">{accessInfo.title}</CardTitle>
        <CardDescription className="text-lg">
          {accessInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mostrar informações de status de pagamento se usuário é assinante mas sem acesso */}
        {isSubscriber && !hasAccess && !paymentConfirmed && (
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              <strong>Aguardando Confirmação:</strong> Sua assinatura foi
              criada, mas os vídeos só serão liberados após a confirmação do
              pagamento.
              {subscriptionDetails && (
                <div className="mt-2 text-xs">
                  Plano: {subscriptionDetails.plan_type} | Status:{" "}
                  {subscriptionDetails.status}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {showPreview && (
          <Alert>
            <Play className="h-4 w-4" />
            <AlertDescription>
              Preview disponível por {previewDuration} segundos para não
              assinantes.
            </AlertDescription>
          </Alert>
        )}

        {/* Preview content for non-subscribers */}
        {showPreview && !hasAccess && (
          <div className="relative">
            <div className="opacity-50 pointer-events-none">{children}</div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-8">
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-2">
                  Continue assistindo com XNEMA Premium
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Acesso completo a todo catálogo
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <Button
            onClick={accessInfo.action}
            className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple text-black font-semibold"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {accessInfo.actionText}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-xnema-orange hover:underline"
              >
                Faça login
              </button>
            </p>
          )}
        </div>

        {/* Features list for non-subscribers */}
        {!hasAccess && (
          <div className="border-t border-xnema-border pt-6">
            <h4 className="font-semibold text-foreground mb-3">
              Com XNEMA Premium você tem:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-xnema-orange rounded-full" />
                <span>Acesso completo ao catálogo</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-xnema-orange rounded-full" />
                <span>Streaming em 4K Ultra HD</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-xnema-orange rounded-full" />
                <span>Between Heaven and Hell exclusivo</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-xnema-orange rounded-full" />
                <span>Sem anúncios ou interrupções</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
