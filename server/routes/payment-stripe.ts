import { Request, Response } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Configuração do Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required in environment");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase admin not configured; payment records will be skipped.");
}
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : (null as any);

// Preços dos planos
const PLANS = {
  monthly: {
    name: "Plano Mensal",
    amount: 1990, // R$ 19,90 em centavos
    currency: "brl",
    interval: "month",
  },
  yearly: {
    name: "Plano Anual",
    amount: 19990, // R$ 199,90 em centavos
    currency: "brl",
    interval: "year",
  },
  lifetime: {
    name: "Plano Vitalício",
    amount: 49990, // R$ 499,90 em centavos
    currency: "brl",
    interval: null,
  },
};

/**
 * Criar sessão de checkout do Stripe
 * POST /api/payment/create-checkout-session
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { plan, userId, userEmail } = req.body;

    if (!plan || !userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Plano, ID do usuário e email são obrigatórios",
      });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: "Plano inválido",
      });
    }

    console.log("🛒 Criando sessão de checkout:", { plan, userId, userEmail });

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: planConfig.name,
              description: `XNEMA - ${planConfig.name}`,
            },
            unit_amount: planConfig.amount,
            ...(planConfig.interval && {
              recurring: {
                interval: planConfig.interval as "month" | "year",
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: planConfig.interval ? "subscription" : "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId,
        plan,
        userEmail,
      },
    });

    // Salvar sessão no Supabase para rastreamento
    if (supabase) await supabase.from("payment_sessions").insert([
      {
        session_id: session.id,
        user_id: userId,
        plan: plan,
        amount: planConfig.amount / 100, // Converter para reais
        currency: planConfig.currency,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);

    console.log("✅ Sessão criada:", session.id);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("❌ Erro ao criar sessão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar pagamento",
    });
  }
};

/**
 * Verificar status da sessão de pagamento
 * GET /api/payment/session-status/:sessionId
 */
export const getSessionStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "ID da sessão é obrigatório",
      });
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sessão não encontrada",
      });
    }

    // Buscar informações no Supabase
    let paymentSession: any = null;
    if (supabase) {
      const resp = await supabase
        .from("payment_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single();
      paymentSession = resp.data;
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        metadata: session.metadata,
        paymentSession,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao verificar sessão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar pagamento",
    });
  }
};

/**
 * Webhook do Stripe para confirmar pagamentos
 * POST /api/payment/stripe-webhook
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    if (!endpointSecret) {
      return res.status(500).json({ success: false, message: "Webhook secret not configured" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        endpointSecret,
      );
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("🎣 Webhook recebido:", event.type);

    // Processar evento de pagamento concluído
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Pagamento concluído:", session.id);

      // Extrair dados do metadata
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        // Calcular data de término da assinatura
        const subscriptionEnd = new Date();
        switch (plan) {
          case "monthly":
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
            break;
          case "yearly":
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
            break;
          case "lifetime":
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100);
            break;
        }

        // Ativar assinatura no Supabase
        let updateError: any = null;
        if (supabase) {
          const up = await supabase
            .from("users")
            .update({
              is_premium: true,
              subscription_status: "active",
              subscription_plan: plan,
              subscription_start: new Date().toISOString(),
              subscription_end: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
          updateError = up.error;
        }

        if (updateError) {
          console.error("❌ Erro ao ativar assinatura:", updateError);
        } else {
          console.log("✅ Assinatura ativada para usuário:", userId);
        }

        // Registrar pagamento
        if (supabase) await supabase.from("payments").insert([
          {
            user_id: userId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "brl",
            plan: plan,
            status: "completed",
            payment_method: "stripe",
            transaction_id: session.payment_intent as string,
            session_id: session.id,
            created_at: new Date().toISOString(),
          },
        ]);

        // Atualizar status da sessão
        if (supabase) await supabase
            .from("payment_sessions")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", session.id);
      }
    }

    // Processar falha no pagamento
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("❌ Sessão de pagamento expirada:", session.id);

      // Atualizar status da sessão
      if (supabase) await supabase
          .from("payment_sessions")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("session_id", session.id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({
      success: false,
      message: "Erro no processamento do webhook",
    });
  }
};

/**
 * Listar planos disponíveis
 * GET /api/payment/plans
 */
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = Object.entries(PLANS).map(([key, config]) => ({
      id: key,
      name: config.name,
      price: config.amount / 100, // Converter para reais
      currency: config.currency,
      interval: config.interval,
      description:
        key === "monthly"
          ? "Acesso premium mensal com renovação automática"
          : key === "yearly"
            ? "Acesso premium anual com desconto de 17%"
            : "Acesso premium para toda a vida",
    }));

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar planos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar planos",
    });
  }
};

/**
 * Cancelar assinatura
 * POST /api/payment/cancel-subscription
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID do usuário é obrigatório",
      });
    }

    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Atualizar status da assinatura
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: "Erro ao cancelar assinatura",
      });
    }

    console.log("✅ Assinatura cancelada para usuário:", userId);

    res.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao cancelar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar assinatura",
    });
  }
};
