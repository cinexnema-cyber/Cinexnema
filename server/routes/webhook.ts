import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "../models/User";
import Video from "../models/Video";
import Subscription from "../models/Subscription";
import Commission from "../models/Commission";

const router = express.Router();

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Webhook secret (deve ser configurado no dashboard do Stripe)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_webhook";

// Mock database para compatibilidade
const db = {
  subscriptions: [] as any[],
  commissions: [] as any[],
};

// POST /webhook - Webhook Stripe
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      // Verificar assinatura do webhook
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log(`✅ Webhook recebido: ${event.type}`);
    } catch (err: any) {
      console.error(`❌ Erro na verificação do webhook: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Processar evento baseado no tipo
      switch (event.type) {
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        default:
          console.log(`🔔 Evento não tratado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error(`❌ Erro ao processar webhook ${event.type}:`, error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  },
);

// Handler: Pagamento de fatura bem-sucedido
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Pagamento bem-sucedido: ${invoice.id}`);

  const valorPago = invoice.amount_paid;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // Buscar dados da assinatura
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const creatorId = subscription.metadata?.creatorId;
  const videoId = subscription.metadata?.videoId;
  const userId = subscription.metadata?.userId;

  // Calcular comissão (70% para criador)
  const comissaoCriador = Math.floor(valorPago * 0.7);
  const valorPlataforma = valorPago - comissaoCriador;

  // Registrar no banco mock
  const subscriptionRecord = {
    id: subscriptionId,
    id_usuario: customerId,
    id_video: videoId,
    valor_pago: valorPago,
    data_pagamento: new Date(),
    status: "ativo",
    stripe_invoice_id: invoice.id,
  };

  db.subscriptions.push(subscriptionRecord);

  // Registrar comissão
  if (creatorId && valorPago > 0) {
    const commissionRecord = {
      id: `comm_${Date.now()}`,
      id_criador: creatorId,
      id_assinatura: subscriptionId,
      valor_comissao: comissaoCriador,
      percentual_aplicado: 70,
      valor_original: valorPago,
      status: "disponivel",
      data: new Date(),
      stripe_invoice_id: invoice.id,
    };

    db.commissions.push(commissionRecord);

    console.log(
      `💸 Comissão criada: R$ ${(comissaoCriador / 100).toFixed(2)} para criador ${creatorId}`,
    );
  }

  // Salvar no MongoDB se disponível
  try {
    if (mongoose.connection.readyState === 1) {
      // Salvar assinatura
      const newSubscription = new Subscription({
        id_usuario: userId || customerId,
        id_video: videoId,
        tipo_assinatura: videoId ? "conteudo_individual" : "plataforma",
        valor_pago: valorPago,
        moeda: invoice.currency.toUpperCase(),
        metodo_pagamento: "stripe",
        status_pagamento: "aprovado",
        data_pagamento: new Date(invoice.created * 1000),
        plano:
          subscription.items.data[0]?.price?.recurring?.interval === "year"
            ? "yearly"
            : "monthly",
        transaction_id: invoice.id,
        detalhes_pagamento: {
          gateway: "stripe",
          referencia_externa: subscriptionId,
          dados_adicionais: { invoice_id: invoice.id },
        },
        data_inicio_periodo: new Date(subscription.current_period_start * 1000),
        data_fim_periodo: new Date(subscription.current_period_end * 1000),
        ativo: true,
      });

      const savedSubscription = await newSubscription.save();

      // Salvar comissão
      if (creatorId) {
        const newCommission = new Commission({
          id_criador: creatorId,
          id_assinatura: savedSubscription._id,
          id_video: videoId,
          valor_comissao: comissaoCriador,
          percentual_aplicado: 70,
          valor_original: valorPago,
          moeda: invoice.currency.toUpperCase(),
          status: "disponivel",
          data_geracao: new Date(),
          data_disponibilizacao: new Date(),
        });

        await newCommission.save();

        // Atualizar saldo do criador
        await User.findByIdAndUpdate(creatorId, {
          $inc: {
            saldoDisponivel: comissaoCriador,
            totalGanho: comissaoCriador,
          },
        });
      }

      // Atualizar usuário para assinante
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          assinante: true,
          subscriptionStatus: "ativo",
          subscriptionStart: new Date(subscription.current_period_start * 1000),
          subscriptionEnd: new Date(subscription.current_period_end * 1000),
        });
      }
    }
  } catch (dbError) {
    console.warn("⚠️ Erro ao salvar no MongoDB:", dbError);
  }

  console.log(`✅ Processamento completo para invoice ${invoice.id}`);
}

// Handler: Falha no pagamento da fatura
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ Falha no pagamento: ${invoice.id}`);

  const subscriptionId = invoice.subscription as string;

  // Marcar assinatura como inativa no mock
  const mockSub = db.subscriptions.find((s) => s.id === subscriptionId);
  if (mockSub) {
    mockSub.status = "payment_failed";
  }

  // Atualizar no MongoDB se disponível
  try {
    if (mongoose.connection.readyState === 1) {
      await Subscription.findOneAndUpdate(
        { transaction_id: invoice.id },
        {
          status_pagamento: "rejeitado",
          ativo: false,
        },
      );

      // Cancelar comissões relacionadas
      await Commission.updateMany(
        { id_assinatura: subscriptionId },
        { status: "cancelado" },
      );
    }
  } catch (dbError) {
    console.warn("⚠️ Erro ao atualizar no MongoDB:", dbError);
  }
}

// Handler: Assinatura criada
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`🆕 Nova assinatura criada: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const creatorId = subscription.metadata?.creatorId;
  const userId = subscription.metadata?.userId;

  console.log(
    `👤 Cliente: ${customerId}, Criador: ${creatorId}, Usuário: ${userId}`,
  );
}

// Handler: Assinatura atualizada
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(
    `🔄 Assinatura atualizada: ${subscription.id} - Status: ${subscription.status}`,
  );

  // Atualizar status no mock
  const mockSub = db.subscriptions.find((s) => s.id === subscription.id);
  if (mockSub) {
    mockSub.status = subscription.status;
  }

  // Atualizar no MongoDB se disponível
  try {
    if (mongoose.connection.readyState === 1) {
      const isActive = subscription.status === "active";

      await Subscription.findOneAndUpdate(
        { transaction_id: subscription.id },
        {
          ativo: isActive,
          data_fim_periodo: new Date(subscription.current_period_end * 1000),
        },
      );

      // Atualizar usuário
      if (subscription.metadata?.userId) {
        await User.findByIdAndUpdate(subscription.metadata.userId, {
          subscriptionStatus: isActive ? "ativo" : "inativo",
          assinante: isActive,
          subscriptionEnd: new Date(subscription.current_period_end * 1000),
        });
      }
    }
  } catch (dbError) {
    console.warn("⚠️ Erro ao atualizar no MongoDB:", dbError);
  }
}

// Handler: Assinatura cancelada
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🗑️ Assinatura cancelada: ${subscription.id}`);

  // Cancelar no mock
  const mockSub = db.subscriptions.find((s) => s.id === subscription.id);
  if (mockSub) {
    mockSub.status = "canceled";
  }

  // Cancelar no MongoDB se disponível
  try {
    if (mongoose.connection.readyState === 1) {
      await Subscription.findOneAndUpdate(
        { transaction_id: subscription.id },
        {
          ativo: false,
          status_pagamento: "cancelado",
        },
      );

      // Atualizar usuário
      if (subscription.metadata?.userId) {
        await User.findByIdAndUpdate(subscription.metadata.userId, {
          subscriptionStatus: "inativo",
          assinante: false,
        });
      }

      // Cancelar comissões futuras (manter as já pagas)
      await Commission.updateMany(
        {
          id_assinatura: subscription.id,
          status: { $in: ["pendente", "disponivel"] },
        },
        { status: "cancelado" },
      );
    }
  } catch (dbError) {
    console.warn("⚠️ Erro ao atualizar no MongoDB:", dbError);
  }
}

// Handler: Sessão de checkout completada
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  console.log(`🛒 Checkout completado: ${session.id}`);

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (subscriptionId) {
    console.log(`🔗 Assinatura associada: ${subscriptionId}`);
  }
}

// Handler: Payment Intent bem-sucedido
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  console.log(`💳 Payment Intent bem-sucedido: ${paymentIntent.id}`);
  console.log(`💰 Valor: ${paymentIntent.amount} ${paymentIntent.currency}`);
}

// Handler: Payment Intent falhou
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`💳❌ Payment Intent falhou: ${paymentIntent.id}`);
  console.log(`❌ Motivo: ${paymentIntent.last_payment_error?.message}`);
}

// GET /webhook/stats - Estatísticas dos webhooks
router.get("/stats", (req: Request, res: Response) => {
  res.json({
    sucesso: true,
    estatisticas: {
      mock_subscriptions: db.subscriptions.length,
      mock_commissions: db.commissions.length,
      total_revenue: db.subscriptions.reduce(
        (sum, s) => sum + (s.valor_pago || 0),
        0,
      ),
      total_commissions: db.commissions.reduce(
        (sum, c) => sum + (c.valor_comissao || 0),
        0,
      ),
    },
    recent_subscriptions: db.subscriptions.slice(-5),
    recent_commissions: db.commissions.slice(-5),
  });
});

export default router;
