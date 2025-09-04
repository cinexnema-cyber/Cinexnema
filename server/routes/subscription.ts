import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

// Mercado Pago subscription plans
const MERCADO_PAGO_PLANS = {
  basic: {
    id: "68bba11ef1bc4daa9275b1ccfd668120",
    name: "Plano Básico",
    price: 19.9,
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=68bba11ef1bc4daa9275b1ccfd668120",
  },
  premium: {
    id: "68bba11ef1bc4daa9275b1ccfd668120",
    name: "Plano Premium",
    price: 19.9,
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=68bba11ef1bc4daa9275b1ccfd668120",
  },
  premium_plus: {
    id: "premium_plus_plan_id",
    name: "Plano Premium Plus",
    price: 29.9,
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=premium_plus_plan_id",
  },
};

const subscribeSchema = Joi.object({
  plan: Joi.string().valid("basic", "premium", "premium_plus").required(),
  email: Joi.string().email().optional(),
});

const cancelSchema = Joi.object({
  reason: Joi.string().optional(),
});

export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = Object.entries(MERCADO_PAGO_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      checkoutUrl: plan.checkoutUrl,
      features: getFeaturesByPlan(key),
    }));

    res.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const createSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = subscribeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { plan } = value;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Update user subscription to pending
    user.subscription = {
      plan: plan as "basic" | "intermediate" | "premium",
      status: "pending",
      startDate: new Date(),
      paymentMethod: "mercado_pago",
    };

    // Set assinante to false initially (will be true when payment is confirmed)
    user.assinante = false;

    await user.save();

    const planData =
      MERCADO_PAGO_PLANS[plan as keyof typeof MERCADO_PAGO_PLANS];

    res.json({
      success: true,
      message: "Assinatura iniciada com sucesso",
      checkoutUrl: planData.checkoutUrl,
      plan: planData,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const cancelSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = cancelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { reason } = value;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "subscriber") {
      return res.status(404).json({ message: "Assinatura não encontrada" });
    }

    // Update subscription status to cancelled
    if (user.subscription) {
      user.subscription.status = "cancelled";
      // Keep subscription active until next billing date
      user.subscription.nextBilling = new Date();

      // Set assinante to false when cancelled
      user.assinante = false;
    }

    await user.save();

    // Log cancellation reason for analytics
    console.log(
      `Subscription cancelled for user ${user.email}. Reason: ${reason || "Not provided"}`,
    );

    res.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
      details: "Você manterá acesso até o final do período atual.",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getSubscriptionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const subscription = user.subscription;
    const isActive =
      subscription?.status === "active" &&
      (!subscription.nextBilling ||
        new Date(subscription.nextBilling) > new Date());

    res.json({
      subscription: subscription || null,
      isActive,
      hasAccess: isActive || subscription?.status === "active",
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Webhook handler for Mercado Pago payment notifications
export const handleMercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const { action, data } = req.body;

    if (action === "payment.created" || action === "payment.updated") {
      const paymentId = data.id;

      // In production, you would fetch payment details from Mercado Pago API
      // For now, we'll simulate successful payment processing
      console.log("Processing Mercado Pago webhook:", { action, paymentId });

      // Find user by payment reference (this would come from the payment data)
      // For demo purposes, we'll activate a sample subscription
      const mockUserEmail = "subscriber@xnema.com";
      const user = await User.findOne({ email: mockUserEmail });

      if (user && user.subscription?.status === "pending") {
        user.subscription.status = "active";
        user.subscription.startDate = new Date();
        user.subscription.nextBilling = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ); // 30 days
        user.subscription.mercadoPagoId = paymentId;

        // Set assinante to true when payment is confirmed
        user.assinante = true;

        await user.save();
        console.log("Subscription activated for user:", mockUserEmail);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: "Erro no webhook" });
  }
};

// Helper function to get features by plan
function getFeaturesByPlan(plan: string): string[] {
  switch (plan) {
    case "basic":
      return ["Catálogo básico", "Qualidade HD", "1 dispositivo simultâneo"];
    case "premium":
      return [
        "Catálogo completo",
        "Qualidade 4K",
        "3 dispositivos simultâneos",
        "Between Heaven and Hell",
        "Conteúdo exclusivo",
      ];
    case "premium_plus":
      return [
        "Catálogo completo",
        "Qualidade 4K",
        "5 dispositivos simultâneos",
        "Between Heaven and Hell",
        "Conteúdo exclusivo",
        "Acesso antecipado",
        "Downloads ilimitados",
      ];
    default:
      return [];
  }
}
