import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SmartNavigator } from "@/utils/navigationUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, CreditCard, Play, ArrowRight } from "lucide-react";

interface PaymentGateProps {
  children: React.ReactNode;
  contentType: "video" | "series" | "premium" | "creator";
  contentId?: string;
  title?: string;
  description?: string;
  showPreview?: boolean;
}

export function PaymentGate({
  children,
  contentType,
  contentId,
  title,
  description,
  showPreview = false,
}: PaymentGateProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check access based on content type
  const getAccessRule = () => {
    switch (contentType) {
      case "creator":
        return SmartNavigator.canAccessCreatorPortal(user);
      case "video":
      case "series":
      case "premium":
      default:
        return SmartNavigator.canAccessPremiumContent(user);
    }
  };

  const accessRule = getAccessRule();
  const subscriptionStatus = SmartNavigator.getSubscriptionStatus(user);

  // If user has access, render content
  if (accessRule.hasAccess) {
    return <>{children}</>;
  }

  // Render payment gate
  const getGateContent = () => {
    switch (contentType) {
      case "creator":
        return {
          icon: Crown,
          title: title || "Portal do Criador",
          description:
            description || "Acesso exclusivo para criadores aprovados",
          badge: "Criadores",
          buttonText: "Solicitar Acesso",
          buttonAction: () => navigate("/creator-login"),
        };

      case "video":
        return {
          icon: Play,
          title: title || "Vídeo Premium",
          description:
            description || "Este vídeo está disponível apenas para assinantes",
          badge: "Premium",
          buttonText: "Assinar para Assistir",
          buttonAction: () => navigate("/payments?plan=monthly"),
        };

      case "series":
        return {
          icon: Play,
          title: title || "Série Exclusiva",
          description:
            description || "Conteúdo exclusivo para assinantes premium",
          badge: "Exclusivo",
          buttonText: "Assinar Agora",
          buttonAction: () => navigate("/payments?plan=yearly"),
        };

      default:
        return {
          icon: Lock,
          title: title || "Conteúdo Premium",
          description:
            description || "Faça sua assinatura para acessar este conteúdo",
          badge: "Premium",
          buttonText: "Ver Planos",
          buttonAction: () => navigate("/pricing"),
        };
    }
  };

  const gateContent = getGateContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-xnema-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <gateContent.icon className="w-8 h-8 text-xnema-orange" />
          </div>

          <div className="mb-2">
            <Badge className="bg-xnema-orange text-black">
              {gateContent.badge}
            </Badge>
          </div>

          <CardTitle className="text-xl text-foreground">
            {gateContent.title}
          </CardTitle>
          <CardDescription>{gateContent.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Subscription Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status da Assinatura:</span>
              <Badge
                variant={
                  subscriptionStatus.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {subscriptionStatus.status === "active" ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {subscriptionStatus.message}
            </p>
          </div>

          {/* Preview if enabled */}
          {showPreview && (
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Preview disponível
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Conteúdo completo para assinantes</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={gateContent.buttonAction}
              className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {gateContent.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {subscriptionStatus.action && (
              <Button
                variant="outline"
                onClick={() => navigate(subscriptionStatus.action!.link)}
                className="w-full"
              >
                {subscriptionStatus.action.text}
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {accessRule.message}
            </p>

            {!user && (
              <div className="mt-3">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xnema-orange"
                >
                  Já tem conta? Faça login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for inline payment gates
export function InlinePaymentGate({
  contentType,
  title,
  buttonText = "Assinar Agora",
}: {
  contentType: PaymentGateProps["contentType"];
  title?: string;
  buttonText?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (contentType === "creator") {
      navigate("/creator-login");
    } else {
      navigate("/payments?plan=monthly");
    }
  };

  return (
    <div className="bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg p-4 text-center">
      <Lock className="w-6 h-6 text-xnema-orange mx-auto mb-2" />
      <h3 className="font-semibold text-foreground mb-2">
        {title || "Conteúdo Premium"}
      </h3>
      <Button
        onClick={handleClick}
        size="sm"
        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
      >
        {buttonText}
      </Button>
    </div>
  );
}

export default PaymentGate;
