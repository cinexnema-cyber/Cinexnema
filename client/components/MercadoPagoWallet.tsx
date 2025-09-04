import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface MercadoPagoWalletProps {
  preferenceId: string;
  checkoutUrl?: string; // preferível: init_point retornado pela API
  onPaymentComplete?: (status: string) => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoWallet({ 
  preferenceId,
  checkoutUrl,
  onPaymentComplete, 
  onError 
}: MercadoPagoWalletProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [preparedUrl, setPreparedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const prepareUrl = async () => {
      try {
        if (checkoutUrl) {
          setPreparedUrl(checkoutUrl);
          setIsLoading(false);
          return;
        }
        if (!preferenceId) {
          throw new Error('Preferência inválida');
        }
        const url = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
        setPreparedUrl(url);
        setIsLoading(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao preparar checkout';
        console.error('Erro ao preparar checkout:', err);
        setError(msg);
        onError?.(msg);
        setIsLoading(false);
      }
    };

    prepareUrl();
  }, [preferenceId, checkoutUrl, onError]);

  const redirectToCheckout = () => {
    if (preparedUrl) {
      window.location.href = preparedUrl;
      onPaymentComplete?.('redirected');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900/90 rounded-2xl p-8 backdrop-blur-md border border-neutral-800 ring-1 ring-neutral-700 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-xnema-orange border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Preparando checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 rounded-2xl p-8 backdrop-blur-md border border-red-500/20">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-white mb-2">Erro no Checkout</h3>
          <p className="text-neutral-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/90 rounded-2xl p-8 backdrop-blur-md border border-neutral-800 ring-1 ring-neutral-700 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
      <div className="text-center">
        <div className="text-6xl mb-6">💳</div>
        <h3 className="text-2xl font-bold text-white mb-4">Finalizar Pagamento</h3>
        <p className="text-neutral-300 mb-6">Clique no botão abaixo para ser redirecionado ao checkout seguro do Mercado Pago</p>
        <Button
          onClick={redirectToCheckout}
          className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-purple hover:to-xnema-orange text-black font-bold py-4 px-8 rounded-full text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 mb-4 shadow-[0_0_26px_rgba(255,108,54,0.45)] hover:shadow-[0_0_40px_rgba(255,140,66,0.6)] hover:scale-[1.02] active:scale-[0.99]"
          size="lg"
        >
          🔐 Pagar com Mercado Pago
        </Button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-xs text-neutral-400">Cartão</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-neutral-400">PIX</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🏦</div>
            <div className="text-xs text-neutral-400">Boleto</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📱</div>
            <div className="text-xs text-neutral-400">Débito</div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-neutral-900/70 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-300">
            <span>🔒</span>
            <span>Checkout 100% seguro pelo Mercado Pago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
