import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface ContentAccessInfo {
  hasAccess: boolean;
  isSubscriber: boolean;
  subscriptionStatus: string | null;
  isLoading: boolean;
  paymentConfirmed: boolean;
  subscriptionDetails: any;
}

export const useContentAccess = (): ContentAccessInfo => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (user.role === "admin") {
      // Admins have full access
      setSubscriptionData({ hasAccess: true, isActive: true });
      setPaymentConfirmed(true);
      setIsLoading(false);
      return;
    }

    try {
      // Verificar no Supabase primeiro
      if (user.user_id) {
        const { data: supabaseUser, error: userError } = await supabase
          .from("CineXnema")
          .select("*")
          .eq("user_id", user.user_id)
          .single();

        if (!userError && supabaseUser) {
          const isActiveSubscriber =
            supabaseUser.subscriptionStatus === "ativo";
          setSubscriptionData({
            hasAccess: isActiveSubscriber,
            isActive: isActiveSubscriber,
          });
          setPaymentConfirmed(isActiveSubscriber);

          // Verificar detalhes da assinatura
          const { data: subscriptionDetails, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.user_id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!subError && subscriptionDetails) {
            setSubscriptionDetails(subscriptionDetails);
          }
        }
      }

      // Fallback para sistema MongoDB
      if (user.role === "subscriber") {
        const token = localStorage.getItem("xnema_token");
        const response = await fetch("/api/subscription/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
          setPaymentConfirmed(data?.paymentConfirmed || false);
        }
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check access - agora mais rigoroso, requer pagamento confirmado
  const hasAccess =
    user?.role === "admin" ||
    (user &&
      ((user as any).assinante === true ||
        user.subscriptionStatus === "ativo") &&
      paymentConfirmed) ||
    (user?.role === "subscriber" &&
      subscriptionData?.hasAccess &&
      paymentConfirmed);

  const isSubscriber =
    user?.role === "subscriber" || user?.subscriptionStatus === "ativo";
  const subscriptionStatus =
    subscriptionData?.subscription?.status || user?.subscriptionStatus || null;

  return {
    hasAccess,
    isSubscriber,
    subscriptionStatus,
    isLoading,
    paymentConfirmed,
    subscriptionDetails,
  };
};
