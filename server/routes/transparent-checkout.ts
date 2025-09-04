import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import Subscription from "../models/Subscription";
import { AuthenticatedRequest } from "../middleware/auth";

// Plan pricing configuration
const PLAN_PRICES = {
  basic: 19.9,
  premium: 59.9,
  vip: 199.0,
};

// Validation schemas
const transparentCheckoutSchema = Joi.object({
  userId: Joi.string().required(),
  planId: Joi.string().valid("basic", "premium", "vip").required(),
  months: Joi.number().min(1).max(24).required(),
  totalAmount: Joi.number().min(0).required(),
  cardData: Joi.object({
    number: Joi.string()
      .pattern(/^\d{16}$/)
      .required(),
    name: Joi.string().min(2).max(50).required(),
    expiry: Joi.string()
      .pattern(/^\d{2}\/\d{2}$/)
      .required(),
    cvv: Joi.string()
      .pattern(/^\d{3,4}$/)
      .required(),
    cpf: Joi.string()
      .pattern(/^\d{11}$/)
      .required(),
  }).when("totalAmount", {
    is: Joi.number().greater(0),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

/**
 * Process transparent checkout
 * POST /api/checkout/transparent
 */
export const processTransparentCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = transparentCheckoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: error.details[0].message,
      });
    }

    const { userId, planId, months, totalAmount, cardData } = value;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verify access permissions
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Check if user already has active subscription
    if (user.subscriptionStatus === "ativo") {
      return res.status(400).json({
        message: "Usuário já possui assinatura ativa",
      });
    }

    const planPrice = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
    if (!planPrice) {
      return res.status(400).json({ message: "Plano inválido" });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    // Generate unique transaction ID
    const transactionId = `tc_${userId}_${planId}_${Date.now()}`;

    // If amount is 0 (free period), activate directly
    if (totalAmount === 0) {
      // Update user subscription
      user.subscriptionStatus = "ativo";
      user.subscriptionPlan = planId as "basic" | "premium" | "vip";
      user.subscriptionStart = startDate;
      user.subscriptionEnd = endDate;
      user.assinante = true;
      user.freeMonthsRemaining = Math.max(0, user.freeMonthsRemaining - months);
      user.subscriptionType = "prepaid";
      user.prepaidMonths = months;

      await user.save();

      // Create subscription record
      const newSubscription = new Subscription({
        id_usuario: userId,
        tipo_assinatura: "plataforma",
        valor_pago: 0,
        moeda: "BRL",
        metodo_pagamento: "free_period",
        status_pagamento: "aprovado",
        plano: planId,
        transaction_id: transactionId,
        detalhes_pagamento: {
          gateway: "internal",
          dados_adicionais: {
            plan_name: `Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
            free_months_used: months,
            user_email: user.email,
          },
        },
        data_inicio_periodo: startDate,
        data_fim_periodo: endDate,
        ativo: true,
      });

      await newSubscription.save();

      return res.json({
        success: true,
        message: "Período gratuito ativado com sucesso",
        paymentId: transactionId,
        subscription: {
          plan: planId,
          startDate,
          endDate,
          status: "ativo",
        },
      });
    }

    // For paid subscriptions, process with Mercado Pago
    // This is where you would integrate with Mercado Pago's transparent checkout API
    // For now, we'll simulate the payment process

    try {
      // Simulate Mercado Pago API call
      const mercadoPagoPayment = await simulateMercadoPagoPayment({
        transactionId,
        amount: totalAmount,
        cardData,
        userInfo: {
          email: user.email,
          name: user.nome,
          cpf: cardData.cpf,
        },
        planInfo: {
          id: planId,
          name: `Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
          months,
        },
      });

      if (mercadoPagoPayment.status === "approved") {
        // Create pending subscription (will be activated by webhook)
        const newSubscription = new Subscription({
          id_usuario: userId,
          tipo_assinatura: "plataforma",
          valor_pago: Math.round(totalAmount * 100), // Convert to cents
          moeda: "BRL",
          metodo_pagamento: "cartao",
          status_pagamento: "aprovado",
          plano: planId,
          transaction_id: transactionId,
          detalhes_pagamento: {
            gateway: "mercado_pago",
            referencia_externa: mercadoPagoPayment.id,
            dados_adicionais: {
              plan_name: `Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
              user_email: user.email,
              months_paid: months,
              card_last_four: cardData.number.slice(-4),
            },
          },
          data_inicio_periodo: startDate,
          data_fim_periodo: endDate,
          ativo: true,
        });

        await newSubscription.save();

        // Update user subscription
        user.subscriptionStatus = "ativo";
        user.subscriptionPlan = planId as "basic" | "premium" | "vip";
        user.subscriptionStart = startDate;
        user.subscriptionEnd = endDate;
        user.assinante = true;
        user.subscriptionType = "prepaid";
        user.prepaidMonths = months;

        // Use free months if available
        if (user.freeMonthsRemaining > 0) {
          user.freeMonthsRemaining = Math.max(0, user.freeMonthsRemaining - 1);
        }

        await user.save();

        res.json({
          success: true,
          message: "Pagamento aprovado com sucesso",
          paymentId: mercadoPagoPayment.id,
          transactionId,
          subscription: {
            plan: planId,
            startDate,
            endDate,
            status: "ativo",
          },
        });
      } else {
        // Payment rejected
        res.status(400).json({
          success: false,
          message: "Pagamento rejeitado",
          details:
            mercadoPagoPayment.statusDetail || "Verifique os dados do cartão",
        });
      }
    } catch (paymentError) {
      console.error("Erro no pagamento:", paymentError);
      res.status(500).json({
        success: false,
        message: "Erro ao processar pagamento",
        details: "Tente novamente em alguns minutos",
      });
    }
  } catch (error) {
    console.error("Erro no checkout transparente:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Simulate Mercado Pago payment processing
 * In production, this would be replaced with actual Mercado Pago API calls
 */
async function simulateMercadoPagoPayment(paymentData: any) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate different payment outcomes based on card data
  const { cardData } = paymentData;

  // Test cards for simulation
  if (cardData.number === "4111111111111111") {
    return {
      id: `mp_${Date.now()}`,
      status: "approved",
      statusDetail: "approved",
    };
  } else if (cardData.number === "4000000000000002") {
    return {
      id: `mp_${Date.now()}`,
      status: "rejected",
      statusDetail: "cc_rejected_insufficient_amount",
    };
  } else {
    // Default to approved for other cards (in simulation)
    const shouldApprove = Math.random() > 0.1; // 90% approval rate

    return {
      id: `mp_${Date.now()}`,
      status: shouldApprove ? "approved" : "rejected",
      statusDetail: shouldApprove ? "approved" : "cc_rejected_other_reason",
    };
  }
}

/**
 * Get checkout session status
 * GET /api/checkout/status/:transactionId
 */
export const getCheckoutStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const subscription = await Subscription.findOne({
      transaction_id: transactionId,
    }).populate("id_usuario");

    if (!subscription) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    res.json({
      success: true,
      status: subscription.status_pagamento,
      subscription: {
        id: subscription.id,
        plan: subscription.plano,
        status: subscription.status_pagamento,
        amount: subscription.valor_pago / 100, // Convert from cents
        startDate: subscription.data_inicio_periodo,
        endDate: subscription.data_fim_periodo,
        active: subscription.ativo,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar status do checkout:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * Handle subscription renewal
 * POST /api/checkout/renew
 */
export const renewSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId, months = 1 } = req.body;

    // Verify access permissions
    if (req.userId !== userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!user.subscriptionPlan) {
      return res
        .status(400)
        .json({ message: "Usuário não possui plano ativo" });
    }

    // Extend subscription
    const currentEnd = user.subscriptionEnd || new Date();
    const newEndDate = new Date(currentEnd);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    user.subscriptionEnd = newEndDate;
    user.subscriptionStatus = "ativo";
    user.prepaidMonths = (user.prepaidMonths || 0) + months;

    await user.save();

    res.json({
      success: true,
      message: "Assinatura renovada com sucesso",
      newEndDate,
      monthsAdded: months,
    });
  } catch (error) {
    console.error("Erro ao renovar assinatura:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};
