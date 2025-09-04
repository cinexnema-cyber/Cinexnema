import { Layout } from "@/components/layout/Layout";
import CheckoutEmbed from "../CheckoutEmbed";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Check,
  Star,
  Shield,
  Smartphone,
  Tv,
  CreditCard,
  ExternalLink,
  Zap,
  Users,
  Download,
  Play,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { StripeService } from "@/lib/stripe";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "family" | null>(null);

  const plans = [
    {
      id: "monthly",
      name: "Mensal",
      price: 19.9,
      period: "mês",
      description: "Acesso completo por 30 dias",
      popular: false,
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "2 telas simultâneas",
        "Suporte via chat",
        "Acesso a lançamentos exclusivos",
      ],
    },
    {
      id: "yearly",
      name: "Anual",
      price: 199.0,
      originalPrice: 238.8,
      period: "ano",
      description: "Melhor custo-benefício",
      popular: true,
      savings: "Economize R$ 39,80 (16%)",
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "4 telas simultâneas",
        "Download para assistir offline",
        "Suporte prioritário",
        "Acesso antecipado a novos lançamentos",
        "Primeiro mês incluído",
      ],
    },
  ];

  if (selectedPlan) {
    const price = selectedPlan === "yearly" ? 199.0 : selectedPlan === "family" ? 49.9 : 19.9;
    const desc = `XNEMA - Assinatura ${selectedPlan === "yearly" ? "Anual" : selectedPlan === "family" ? "Família" : "Mensal"}`;
    return (
      <Layout>
        <div className="min-h-screen py-16 bg-gradient-to-br from-black via-[#0b0b0b] to-[#111]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setSelectedPlan(null)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              >
                ← Voltar aos Planos
              </Button>
              <div className="text-sm text-neutral-400">Plano selecionado: <span className="text-white font-semibold">{selectedPlan === "yearly" ? "Anual" : selectedPlan === "family" ? "Família" : "Mensal"}</span></div>
            </div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Finalizar Assinatura</h2>
              <p className="text-neutral-400">{desc} • {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <CheckoutEmbed
              plan={{ type: selectedPlan, price, description: desc }}
              apiBase=""
              onBack={() => setSelectedPlan(null)}
            />
          </div>
        </div>
      </Layout>
    );
  }

  const features = [
    {
      icon: Play,
      title: "Conteúdo Exclusivo",
      description: "Séries e filmes produzidos especialmente para XNEMA",
    },
    {
      icon: Star,
      title: "Qualidade Premium",
      description: "Streaming em 4K com áudio surround e HDR",
    },
    {
      icon: Smartphone,
      title: "Multiplataforma",
      description: "Assista em TV, celular, tablet ou computador",
    },
    {
      icon: Shield,
      title: "Sem Compromisso",
      description: "Cancele quando quiser, sem taxa de cancelamento",
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.subscriptionStatus === "ativo") {
      // User already has subscription
      navigate("/subscriber-dashboard");
      return;
    }

    // Abrir checkout Mercado Pago integrado nesta página
    setSelectedPlan(planId as "monthly" | "yearly" | "family");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Layout>
      <div className="min-h-screen py-16 bg-gradient-to-br from-[#0b0b0f] via-[#12121b] to-[#1a1a25]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <Badge className="bg-cinexnema-accent text-black mb-4 px-4 py-2">
              🎬 Streaming Premium
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight bg-clip-text text-transparent">
              Assinatura Premium
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Acesso ilimitado ao melhor do entretenimento brasileiro em 4K, sem anúncios e com suporte premium.
            </p>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 ring-1 ring-neutral-700 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] p-8 md:p-12 text-center">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-cinexnema-accent/60 text-cinexnema-highlight">
                🔥 MAIS POPULAR • Melhor custo-benefício
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Oferta Premium XNEMA</h2>
            <p className="text-neutral-300 mb-8">Catálogo completo, 4K/HDR, sem anúncios, até 4 telas, downloads e estreias antecipadas.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 text-left">
                <div className="text-neutral-400 text-sm mb-1">Plano Mensal</div>
                <div className="text-4xl font-extrabold text-white mb-2">R$ 19,90 <span className="text-base text-neutral-400 font-medium">/mês</span></div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Catálogo completo sem limites",
                    "Qualidade 4K e HDR",
                    "Sem anúncios",
                    "2 telas simultâneas",
                    "Suporte via chat",
                    "Acesso a lançamentos exclusivos",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleSubscribe("monthly")} className="w-full bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight hover:from-cinexnema-highlight hover:to-cinexnema-accent text-black font-bold py-4 rounded-full text-lg transition-all hover:-translate-y-1 shadow-[0_0_26px_rgba(255,90,0,0.45)] hover:shadow-[0_0_40px_rgba(255,156,26,0.6)]">
                  Assinar Mensal
                </Button>
              </div>
              <div className="p-4 rounded-2xl border border-cinexnema-accent ring-4 ring-cinexnema-accent/40 bg-neutral-900/70 shadow-[0_0_40px_rgba(255,90,0,0.35)] scale-105 text-left">
                <div className="text-neutral-400 text-sm mb-1">Plano Anual</div>
                <div className="text-4xl font-extrabold text-white mb-2">R$ 199,00 <span className="text-base text-neutral-400 font-medium">/ano</span></div>
                <div className="text-xs text-green-400 mb-3">Economize 16% • 7 dias grátis</div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Tudo do plano Mensal",
                    "Até 5 telas vinculadas (um único login)",
                    "Download para assistir offline",
                    "Suporte prioritário",
                    "Acesso antecipado a novos lançamentos",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleSubscribe("yearly")} className="w-full bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight hover:from-cinexnema-highlight hover:to-cinexnema-accent text-black font-bold py-4 rounded-full text-lg transition-all hover:-translate-y-1 shadow-[0_0_26px_rgba(255,90,0,0.45)] hover:shadow-[0_0_40px_rgba(255,156,26,0.6)]">
                  Assinar Anual 🔥
                </Button>
              </div>
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 text-left">
                <div className="text-neutral-400 text-sm mb-1">Plano Família</div>
                <div className="text-4xl font-extrabold text-white mb-2">R$ 49,90 <span className="text-base text-neutral-400 font-medium">/mês</span></div>
                <div className="text-xs text-neutral-300 mb-3">Até 5 contas • 5 dispositivos</div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Até 5 contas vinculadas",
                    "5 dispositivos simultâneos",
                    "Perfis para família",
                    "Controle parental básico",
                    "Sem anúncios • Qualidade 4K/HDR",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleSubscribe("family")} className="w-full bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight hover:from-cinexnema-highlight hover:to-cinexnema-accent text-black font-bold py-4 rounded-full text-lg transition-all hover:-translate-y-1 shadow-[0_0_26px_rgba(255,90,0,0.45)] hover:shadow-[0_0_40px_rgba(255,156,26,0.6)]">
                  Assinar Família
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mb-6">
              {["Catálogo completo sem limites", "Qualidade 4K e HDR", "Sem anúncios", "Até 4 telas simultâneas", "Download offline", "Suporte prioritário"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-neutral-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>

            <div className="text-sm text-neutral-400">Pagamento seguro via Mercado Pago • Cancele quando quiser • Suporte 24/7</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
