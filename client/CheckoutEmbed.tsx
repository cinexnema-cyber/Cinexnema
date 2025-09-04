import { useEffect, useState } from "react";
import MercadoPagoWallet from "@/components/MercadoPagoWallet";

export interface CheckoutPlan {
  type: string;
  price: number;
  description: string;
}

interface CheckoutEmbedProps {
  plan: CheckoutPlan;
  apiBase?: string; // "" (mesmo host) ou "https://api.seusite.com"
  onBack?: () => void;
  onError?: (message: string) => void;
}

import { useAuth as useAuthLegacy } from "@/contexts/AuthContext";
import { useAuth as useAuthReal } from "@/contexts/AuthContextReal";
export default function CheckoutEmbed({ plan, apiBase = "", onBack, onError }: CheckoutEmbedProps) {
  const [preferenceId, setPreferenceId] = useState<string>("");
  const [initPoint, setInitPoint] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const legacy = (() => { try { return useAuthLegacy?.(); } catch { return null; } })();
  const real = (() => { try { return useAuthReal?.(); } catch { return null; } })();
  const currentUser: any = (real as any)?.user || (legacy as any)?.user || null;

  useEffect(() => {
    const createPaymentPreference = async () => {
      try {
        setIsLoading(true);
        const userEmail = currentUser?.email || "anon";
        const userId = currentUser?.id || currentUser?._id || "na";
        const paymentData = {
          items: [{ title: plan.description, unit_price: plan.price, quantity: 1 }],
          external_reference: `cinexnema:${plan.type}:${userEmail}:${userId}:${Date.now()}`,
          back_urls: {
            success: `${window.location.origin}/payment-success?status=approved`,
            failure: `${window.location.origin}/payment-success?status=rejected`,
            pending: `${window.location.origin}/payment-success?status=pending`,
          },
          auto_return: "approved",
          statement_descriptor: "CINEXNEMA",
          payment_methods: { installments: plan.type === "yearly" ? 12 : 1 },
        };

        const url = `${apiBase}/api/mercadopago/create-preference`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });
        if (!response.ok) {
          let msg = `Erro ${response.status}`;
          try {
            const data = await response.json();
            msg = (data as any)?.message || (data as any)?.error || msg;
          } catch {}
          throw new Error(msg);
        }
        const result = await response.json();
        if ((result as any).success && (result as any).preference_id) {
          setPreferenceId((result as any).preference_id);
          setInitPoint((result as any).init_point || (result as any).sandbox_init_point || "");
        } else {
          throw new Error((result as any).message || "Erro ao criar pagamento");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        onError?.(msg);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentPreference();
  }, [plan?.type, plan?.price, plan?.description, apiBase, currentUser?.email, currentUser?.id]);

  if (isLoading) {
    return (
      <div className="text-white text-center py-16">
        <div className="text-2xl mb-2">Preparando Pagamento</div>
        <div className="opacity-80">Criando sua preferência de pagamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white">
        <div className="text-center p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
          <div className="text-5xl mb-2">❌</div>
          <div className="text-2xl font-bold mb-3">Erro no Pagamento</div>
          <div className="opacity-90 mb-4">{error}</div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 rounded-full font-bold bg-gradient-to-r from-xnema-orange to-xnema-purple text-black">
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="text-lg font-bold mb-4">Método de Pagamento</div>
        {preferenceId ? (
          <div>
            <MercadoPagoWallet preferenceId={preferenceId} checkoutUrl={initPoint} />
            {initPoint && (
              <div className="text-center pt-4 border-t border-neutral-800 mt-4">
                <div className="text-xs text-neutral-400 mb-2">Problemas com o checkout? Use o link direto:</div>
                <button onClick={() => (window.location.href = initPoint)} className="px-4 py-2 rounded-lg font-bold border border-xnema-orange text-xnema-orange">
                  🔗 Ir Direto ao Mercado Pago
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6">Carregando opções de pagamento...</div>
        )}
      </div>
    </div>
  );
}

/* removed legacy MPWalletEmbed in favor of styled MercadoPagoWallet */
function MPWalletEmbed({ preferenceId, checkoutUrl }: { preferenceId: string; checkoutUrl?: string }) {
  const [preparedUrl, setPreparedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      if (checkoutUrl) {
        setPreparedUrl(checkoutUrl);
        setIsLoading(false);
        return;
      }
      if (!preferenceId) throw new Error("Preferência inválida");
      setPreparedUrl(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`);
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao preparar checkout");
      setIsLoading(false);
    }
  }, [preferenceId, checkoutUrl]);

  if (isLoading) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid #2a2a2a",
          textAlign: "center",
        }}
      >
        Preparando checkout...
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "rgba(255,0,0,0.08)",
          border: "1px solid rgba(255,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        background: "rgba(0,0,0,0.6)",
        border: "1px solid #2a2a2a",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Finalizar Pagamento</div>
      <div style={{ color: "#bbb", marginBottom: 16 }}>
        Clique no botão abaixo para ir ao checkout seguro do Mercado Pago
      </div>
      <button
        onClick={() => (window.location.href = preparedUrl)}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 999,
          fontWeight: 800,
          background: "linear-gradient(90deg,#ff5a00,#ff9c1a)",
          color: "#000",
          border: "none",
          cursor: "pointer",
        }}
      >
        🔐 Pagar com Mercado Pago
      </button>
    </div>
  );
}
