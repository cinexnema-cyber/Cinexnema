import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "../models/User";
import Video from "../models/Video";
import Subscription from "../models/Subscription";
import Commission from "../models/Commission";

const router = express.Router();

// Inicializar Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Mock de banco de dados para compatibilidade
const db = {
  subscriptions: [] as any[],
  commissions: [] as any[],
};

// Middleware para webhook (raw body)
router.use("/webhook", bodyParser.raw({ type: "application/json" }));

// Outros endpoints usam JSON
router.use(bodyParser.json());

// POST /create-customer - Criar cliente Stripe
router.post("/create-customer", async (req: Request, res: Response) => {
  try {
    const { email, nome } = req.body;

    if (!email || !nome) {
      return res.status(400).json({
        sucesso: false,
        erro: "Email e nome são obrigatórios",
      });
    }

    // Verificar se já existe um cliente
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: nome,
        metadata: {
          source: "xnema_platform",
        },
      });
    }

    res.json({
      sucesso: true,
      customerId: customer.id,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao criar cliente Stripe",
      detalhes: error.message,
    });
  }
});

// POST /create-subscription - Criar assinatura
router.post("/create-subscription", async (req: Request, res: Response) => {
  try {
    const { customerId, priceId, creatorId, videoId, userId } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({
        sucesso: false,
        erro: "customerId e priceId são obrigatórios",
      });
    }

    // Criar assinatura no Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        creatorId: creatorId || "",
        videoId: videoId || "",
        userId: userId || "",
        source: "xnema_platform",
      },
    });

    const paymentIntent = subscription.latest_invoice
      ?.payment_intent as Stripe.PaymentIntent;
    const valorPago = paymentIntent?.amount || 0;
    const comissaoCriador = Math.floor(valorPago * 0.7); // 70% para criador

    // Registrar no banco de dados mock
    const subscriptionRecord = {
      id: subscription.id,
      id_usuario: customerId,
      id_video: videoId,
      valor_pago: valorPago,
      data_pagamento: new Date(),
      status: subscription.status,
      customer_id: customerId,
    };

    db.subscriptions.push(subscriptionRecord);

    // Registrar comissão se houver criador
    if (creatorId && valorPago > 0) {
      const commissionRecord = {
        id: `comm_${Date.now()}`,
        id_criador: creatorId,
        id_assinatura: subscription.id,
        valor_comissao: comissaoCriador,
        percentual_aplicado: 70,
        valor_original: valorPago,
        status: "pendente",
        data: new Date(),
      };

      db.commissions.push(commissionRecord);

      // Salvar no MongoDB se disponível
      try {
        if (mongoose.connection.readyState === 1) {
          const newCommission = new Commission({
            id_criador: creatorId,
            id_assinatura: subscription.id,
            valor_comissao: comissaoCriador,
            percentual_aplicado: 70,
            valor_original: valorPago,
            status: "pendente",
          });
          await newCommission.save();
        }
      } catch (dbError) {
        console.warn("Erro ao salvar no MongoDB:", dbError);
      }
    }

    res.json({
      sucesso: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        client_secret: paymentIntent?.client_secret,
        latest_invoice: subscription.latest_invoice,
      },
      comissao: creatorId
        ? {
            valor_comissao: comissaoCriador,
            percentual: 70,
            valor_original: valorPago,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Erro ao criar assinatura:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao criar assinatura",
      detalhes: error.message,
    });
  }
});

// POST /create-checkout-session - Criar sessão de checkout
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  try {
    const {
      priceId,
      customerId,
      creatorId,
      videoId,
      userId,
      successUrl,
      cancelUrl,
    } = req.body;

    if (!priceId) {
      return res.status(400).json({
        sucesso: false,
        erro: "priceId é obrigatório",
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url:
        successUrl ||
        `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/payment-cancelled`,
      metadata: {
        creatorId: creatorId || "",
        videoId: videoId || "",
        userId: userId || "",
        source: "xnema_platform",
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      sucesso: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao criar sessão de checkout",
      detalhes: error.message,
    });
  }
});

// GET /subscription/:id - Buscar assinatura
router.get("/subscription/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await stripe.subscriptions.retrieve(id);

    res.json({
      sucesso: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        customer: subscription.customer,
        items: subscription.items.data,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar assinatura",
      detalhes: error.message,
    });
  }
});

// POST /cancel-subscription - Cancelar assinatura
router.post("/cancel-subscription", async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        sucesso: false,
        erro: "subscriptionId é obrigatório",
      });
    }

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    res.json({
      sucesso: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        canceled_at: subscription.canceled_at,
      },
    });
  } catch (error: any) {
    console.error("Erro ao cancelar assinatura:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao cancelar assinatura",
      detalhes: error.message,
    });
  }
});

// GET /prices - Listar preços disponíveis
router.get("/prices", async (req: Request, res: Response) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    res.json({
      sucesso: true,
      prices: prices.data.map((price) => ({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        product: price.product,
      })),
    });
  } catch (error: any) {
    console.error("Erro ao listar preços:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao listar preços",
      detalhes: error.message,
    });
  }
});

// GET /commissions/creator/:creatorId - Comissões do criador
router.get(
  "/commissions/creator/:creatorId",
  async (req: Request, res: Response) => {
    try {
      const { creatorId } = req.params;

      // Buscar no banco mock primeiro
      const mockCommissions = db.commissions.filter(
        (c) => c.id_criador === creatorId,
      );

      // Tentar buscar no MongoDB se disponível
      let mongoCommissions = [];
      try {
        if (mongoose.connection.readyState === 1) {
          mongoCommissions = await Commission.find({ id_criador: creatorId })
            .populate("assinatura", "valor_pago status_pagamento")
            .sort({ data_geracao: -1 });
        }
      } catch (dbError) {
        console.warn("Erro ao buscar no MongoDB:", dbError);
      }

      const allCommissions = [...mockCommissions, ...mongoCommissions];

      const totalDisponivel = allCommissions
        .filter((c) => c.status === "disponivel" || c.status === "pendente")
        .reduce((sum, c) => sum + (c.valor_comissao || 0), 0);

      const totalPago = allCommissions
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + (c.valor_comissao || 0), 0);

      res.json({
        sucesso: true,
        criador_id: creatorId,
        resumo: {
          total_disponivel: totalDisponivel,
          total_pago: totalPago,
          total_comissoes: allCommissions.length,
        },
        comissoes: allCommissions.slice(0, 20), // Últimas 20
      });
    } catch (error: any) {
      console.error("Erro ao buscar comissões:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao buscar comissões do criador",
        detalhes: error.message,
      });
    }
  },
);

// GET /stats - Estatísticas gerais
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // Estatísticas do banco mock
    const mockStats = {
      total_subscriptions: db.subscriptions.length,
      total_revenue: db.subscriptions.reduce(
        (sum, s) => sum + (s.valor_pago || 0),
        0,
      ),
      total_commissions: db.commissions.reduce(
        (sum, c) => sum + (c.valor_comissao || 0),
        0,
      ),
      active_subscriptions: db.subscriptions.filter(
        (s) => s.status === "active",
      ).length,
    };

    // Buscar dados do Stripe
    const stripeStats = await stripe.subscriptions.list({
      limit: 100,
      status: "active",
    });

    res.json({
      sucesso: true,
      estatisticas: {
        mock_data: mockStats,
        stripe_data: {
          assinaturas_ativas_stripe: stripeStats.data.length,
          total_stripe_subscriptions: stripeStats.data.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar estatísticas",
      detalhes: error.message,
    });
  }
});

export default router;
