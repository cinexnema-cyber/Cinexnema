import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import Subscription from "../models/Subscription";
import { AuthenticatedRequest } from "../middleware/auth";
import { WebhookRetryService } from "../utils/webhookRetry";

// Definição dos planos do Mercado Pago
const MERCADO_PAGO_PLANS = {
  monthly: {
    id: "monthly_plan",
    name: "Plano Mensal XNEMA",
    price: 19.9,
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=monthly_plan_id",
  },
  yearly: {
    id: "yearly_plan",
    name: "Plano Anual XNEMA",
    price: 199.0,
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=yearly_plan_id",
  },
};

const createPaymentSchema = Joi.object({
  userId: Joi.string().required(),
  planId: Joi.string().valid("monthly", "yearly").required(),
});

const webhookSchema = Joi.object({
  action: Joi.string().required(),
  data: Joi.object({
    id: Joi.string().required(),
  }).required(),
  user_id: Joi.string().optional(),
});

/**
 * Endpoint para criar preferência de pagamento
 * POST /api/payments/create
 */
export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    const { userId, planId } = value;

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se o usuário já é premium
    if (user.isPremium && user.subscriptionStatus === "active") {
      return res.status(400).json({
        message: "Usuário já possui assinatura ativa",
      });
    }

    // Buscar dados do plano
    const planData =
      MERCADO_PAGO_PLANS[planId as keyof typeof MERCADO_PAGO_PLANS];
    if (!planData) {
      return res.status(400).json({ message: "Plano não encontrado" });
    }

    // Calcular datas do período
    const now = new Date();
    const startDate = now;
    const endDate = new Date(now);

    if (planId === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planId === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Criar ID único para a transação
    const transactionId = `mp_${userId}_${planId}_${Date.now()}`;

    // Criar registro de assinatura pendente
    const newSubscription = new Subscription({
      id_usuario: userId,
      tipo_assinatura: "plataforma",
      valor_pago: Math.round(planData.price * 100), // converter para centavos
      moeda: "BRL",
      metodo_pagamento: "mercadopago",
      status_pagamento: "pendente",
      plano: planId,
      transaction_id: transactionId,
      detalhes_pagamento: {
        gateway: "mercado_pago",
        referencia_externa: transactionId,
        dados_adicionais: {
          plan_name: planData.name,
          user_email: user.email,
        },
      },
      data_inicio_periodo: startDate,
      data_fim_periodo: endDate,
      ativo: false,
    });

    await newSubscription.save();

    // Atualizar usuário para estado pendente
    user.subscriptionStatus = "pending";
    user.subscriptionPlan = planId === "monthly" ? "basic" : "premium";
    user.role = "subscriber"; // Manter como subscriber até pagamento aprovado
    user.isPremium = false; // NÃO é premium até pagamento confirmado
    user.assinante = false; // Backward compatibility
    await user.save();

    // Construir URL de checkout com parâmetros personalizados
    const checkoutUrl = `${planData.checkoutUrl}&external_reference=${transactionId}&notification_url=${process.env.WEBHOOK_URL || "http://localhost:3001"}/api/payments/webhook&back_urls[success]=${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success&back_urls[failure]=${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-error&back_urls[pending]=${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-pending`;

    res.json({
      success: true,
      message: "Pagamento criado com sucesso",
      checkoutUrl,
      transactionId,
      plan: {
        id: planId,
        name: planData.name,
        price: planData.price,
      },
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Webhook para receber notificações do Mercado Pago
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    console.log("🔔 Webhook recebido:", req.body);

    const { error, value } = webhookSchema.validate(req.body);
    if (error) {
      console.error(
        "❌ Webhook com dados inválidos:",
        error.details[0].message,
      );
      return res.status(400).json({ message: "Dados do webhook inválidos" });
    }

    // Adicionar external_reference ao payload se estiver nos parâmetros
    const webhookData = {
      ...value,
      external_reference:
        req.body.external_reference || req.query.external_reference,
    };

    // Processar apenas eventos de pagamento
    if (
      webhookData.action === "payment.created" ||
      webhookData.action === "payment.updated"
    ) {
      // Usar serviço de retry para processar o webhook
      const result =
        await WebhookRetryService.processPaymentWebhook(webhookData);

      if (result.success) {
        console.log("✅ Webhook processado com sucesso");
      } else {
        console.error("❌ Erro no processamento do webhook:", result.error);
        // Ainda assim retornamos 200 para o Mercado Pago (retry será feito internamente)
      }
    } else {
      console.log(
        "ℹ️ Webhook ignorado (não é evento de pagamento):",
        webhookData.action,
      );
    }

    // SEMPRE responder OK para o Mercado Pago (retry é gerenciado internamente)
    res.status(200).json({
      success: true,
      message: "Webhook recebido e processado",
    });
  } catch (error) {
    console.error("😨 Erro crítico no webhook:", error);

    // Mesmo com erro, retornar 200 para evitar reenvio descontrolado
    res.status(200).json({
      success: false,
      message: "Erro processado",
    });
  }
};

/**
 * Endpoint para consultar status de pagamento
 * GET /api/payments/status/:transactionId
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const subscription = await Subscription.findOne({
      transaction_id: transactionId,
    }).populate("id_usuario");

    if (!subscription) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    res.json({
      transactionId,
      status: subscription.status_pagamento,
      plan: subscription.plano,
      amount: subscription.valor_pago / 100, // converter de centavos
      active: subscription.ativo,
      startDate: subscription.data_inicio_periodo,
      endDate: subscription.data_fim_periodo,
    });
  } catch (error) {
    console.error("Erro ao consultar status:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Endpoint para listar pagamentos do usuário
 * GET /api/payments/user/:userId
 */
export const getUserPayments = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário pode acessar estes dados
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const subscriptions = await Subscription.find({
      id_usuario: userId,
    }).sort({ data_pagamento: -1 });

    const payments = subscriptions.map((sub) => ({
      id: sub.id,
      transactionId: sub.transaction_id,
      plan: sub.plano,
      amount: sub.valor_pago / 100,
      status: sub.status_pagamento,
      date: sub.data_pagamento,
      active: sub.ativo,
      startDate: sub.data_inicio_periodo,
      endDate: sub.data_fim_periodo,
    }));

    res.json({ payments });
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};
