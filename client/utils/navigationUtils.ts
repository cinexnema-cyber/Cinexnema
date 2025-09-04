import { AuthUser } from "@/contexts/AuthContext";

export interface NavigationRule {
  hasAccess: boolean;
  redirectTo?: string;
  message?: string;
}

/**
 * Smart navigation utility that checks user permissions and payment status
 * to determine where users should be redirected
 */
export class SmartNavigator {
  
  /**
   * Check if user can access premium content
   */
  static canAccessPremiumContent(user: AuthUser | null): NavigationRule {
    if (!user) {
      return {
        hasAccess: false,
        redirectTo: "/login",
        message: "Faça login para acessar este conteúdo"
      };
    }

    // Admins always have access
    if (user.role === "admin") {
      return { hasAccess: true };
    }

    // Approved creators have access
    if (user.role === "creator" && user.creatorProfile?.status === "approved") {
      return { hasAccess: true };
    }

    // Check if user has active subscription
    if (user.assinante && user.subscriptionStatus === "ativo") {
      return { hasAccess: true };
    }

    // User needs to subscribe
    return {
      hasAccess: false,
      redirectTo: "/pricing",
      message: "Assine agora para acessar conteúdo premium"
    };
  }

  /**
   * Check if user can access creator features
   */
  static canAccessCreatorPortal(user: AuthUser | null): NavigationRule {
    if (!user) {
      return {
        hasAccess: false,
        redirectTo: "/creator-login",
        message: "Faça login como criador para acessar"
      };
    }

    // Admins always have access
    if (user.role === "admin") {
      return { hasAccess: true };
    }

    // Check creator status
    if (user.role === "creator") {
      if (user.creatorProfile?.status === "approved") {
        return { hasAccess: true };
      } else if (user.creatorProfile?.status === "pending") {
        return {
          hasAccess: false,
          redirectTo: "/creator-login",
          message: "Sua solicitação está sendo analisada. Aguarde aprovação."
        };
      } else if (user.creatorProfile?.status === "rejected") {
        return {
          hasAccess: false,
          redirectTo: "/creator-login",
          message: "Sua solicitação foi rejeitada. Entre em contato para mais informações."
        };
      }
    }

    // User is not a creator
    return {
      hasAccess: false,
      redirectTo: "/creator-login",
      message: "Solicite acesso como criador para usar este portal"
    };
  }

  /**
   * Get the appropriate dashboard based on user role and status
   */
  static getDashboardRoute(user: AuthUser | null): string {
    if (!user) {
      return "/login";
    }

    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
        
      case "creator":
        if (user.creatorProfile?.status === "approved") {
          return "/creator-dashboard";
        } else {
          return "/creator-login";
        }
        
      case "subscriber":
        if (user.assinante && user.subscriptionStatus === "ativo") {
          return "/subscriber-dashboard";
        } else {
          return "/pricing";
        }
        
      case "user":
      default:
        return "/pricing";
    }
  }

  /**
   * Smart redirect for payment buttons
   */
  static getPaymentRedirect(user: AuthUser | null, plan: "monthly" | "yearly" | "creator"): string {
    if (!user) {
      return "/register";
    }

    // If user already has active subscription, redirect to dashboard
    if (user.assinante && user.subscriptionStatus === "ativo") {
      return this.getDashboardRoute(user);
    }

    // Direct to enhanced payment options with plan
    return `/payment-options-enhanced?plan=${plan}&email=${user.email}`;
  }

  /**
   * Check video access and get appropriate redirect
   */
  static canWatchVideo(user: AuthUser | null, contentId: string): NavigationRule {
    const premiumAccess = this.canAccessPremiumContent(user);
    
    if (!premiumAccess.hasAccess) {
      return {
        hasAccess: false,
        redirectTo: premiumAccess.redirectTo,
        message: `${premiumAccess.message} para assistir este vídeo`
      };
    }

    return { hasAccess: true };
  }

  /**
   * Get subscription status message
   */
  static getSubscriptionStatus(user: AuthUser | null): {
    status: "active" | "inactive" | "expired" | "pending" | "none";
    message: string;
    action?: { text: string; link: string };
  } {
    if (!user) {
      return {
        status: "none",
        message: "Faça login para verificar sua assinatura",
        action: { text: "Fazer Login", link: "/login" }
      };
    }

    if (user.role === "admin") {
      return {
        status: "active",
        message: "Acesso administrativo ativo"
      };
    }

    if (user.role === "creator" && user.creatorProfile?.status === "approved") {
      return {
        status: "active",
        message: "Acesso de criador aprovado"
      };
    }

    if (user.assinante && user.subscriptionStatus === "ativo") {
      return {
        status: "active",
        message: "Assinatura ativa"
      };
    }

    if (user.subscriptionStatus === "inativo") {
      return {
        status: "inactive",
        message: "Assinatura inativa",
        action: { text: "Reativar", link: "/pricing" }
      };
    }

    return {
      status: "none",
      message: "Nenhuma assinatura ativa",
      action: { text: "Assinar Agora", link: "/pricing" }
    };
  }

  /**
   * Handle button click with smart navigation
   */
  static handleContentAccess(user: AuthUser | null, contentType: "video" | "series" | "premium", contentId?: string) {
    const rule = this.canAccessPremiumContent(user);
    
    if (rule.hasAccess) {
      // User has access, proceed to content
      if (contentType === "video" && contentId) {
        return `/watch/${contentId}`;
      } else if (contentType === "series") {
        return "/between-heaven-hell";
      } else {
        return "/catalog";
      }
    } else {
      // User needs subscription, redirect to payment
      return rule.redirectTo || "/pricing";
    }
  }
}

// Export helper functions for easy use in components
export const canAccessPremium = SmartNavigator.canAccessPremiumContent;
export const canAccessCreator = SmartNavigator.canAccessCreatorPortal;
export const getDashboard = SmartNavigator.getDashboardRoute;
export const getPaymentLink = SmartNavigator.getPaymentRedirect;
export const canWatch = SmartNavigator.canWatchVideo;
export const getSubscriptionStatus = SmartNavigator.getSubscriptionStatus;
export const handleContentClick = SmartNavigator.handleContentAccess;
