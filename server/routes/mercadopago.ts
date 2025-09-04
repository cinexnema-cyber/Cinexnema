/* eslint-disable */
import { RequestHandler } from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import fetch from "node-fetch";

function getEnvironment() {
  return process.env.MP_ENVIRONMENT === "production" ? "production" : "sandbox";
}
function getAccessToken() {
  const env = getEnvironment();
  const t = env === "production" ? process.env.MP_ACCESS_TOKEN_PROD : process.env.MP_ACCESS_TOKEN_SANDBOX;
  if (!t) throw new Error(`Mercado Pago access token não configurado para ${env}. Defina MP_ACCESS_TOKEN_${env === "production" ? "PROD" : "SANDBOX"}`);
  return t;
}
function getPublicKey() {
  const env = getEnvironment();
  const k = env === "production" ? process.env.MP_PUBLIC_KEY_PROD : process.env.MP_PUBLIC_KEY_SANDBOX;
  if (!k) throw new Error(`Mercado Pago public key não configurada para ${env}. Defina MP_PUBLIC_KEY_${env === "production" ? "PROD" : "SANDBOX"}`);
  return k;
}
function prefClient() {
  return new Preference(new MercadoPagoConfig({ accessToken: getAccessToken(), options: { timeout: 5000 } }));
}
function payClient() {
  return new Payment(new MercadoPagoConfig({ accessToken: getAccessToken(), options: { timeout: 5000 } }));
}

export const createPreference: RequestHandler = async (req, res) => {
  try {
    const d = req.body as any;
    if (!d.items?.length) return res.status(400).json({ success: false, message: "Items são obrigatórios" });
    const body = {
      items: d.items.map((i: any) => ({ title: i.title, unit_price: Number(i.unit_price), quantity: Number(i.quantity), currency_id: "BRL" })),
      external_reference: d.external_reference,
      back_urls: d.back_urls,
      auto_return: d.auto_return || "approved",
      statement_descriptor: d.statement_descriptor || "CINEXNEMA",
      payment_methods: { excluded_payment_types: [], excluded_payment_methods: [], installments: d.payment_methods?.installments || 12 },
      shipments: { mode: "not_specified" as const },
    };
    const response = await prefClient().create({ body });
    res.json({ success: true, preference_id: (response as any).id, init_point: (response as any).init_point, sandbox_init_point: (response as any).sandbox_init_point, public_key: getPublicKey(), environment: getEnvironment() });
  } catch (error) {
    let detail = "Erro desconhecido";
    if (error instanceof Error) detail = error.message; else { try { detail = JSON.stringify(error as any); } catch { detail = String(error); } }
    const status = /unauthorized|invalid_token|access token/i.test(detail) ? 401 : 500;
    res.status(status).json({ success: false, message: status === 401 ? "Credenciais inválidas do Mercado Pago" : "Erro interno do servidor", error: detail });
  }
};

export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const { type, data } = req.body as any;
    if (type === "payment" && data?.id) {
      try {
        const p: any = await payClient().get({ id: data.id });
        if (p?.status === "approved") {
          const externalRef = String(p.external_reference || "");
          // Expected: cinexnema:plan:userEmail:userId:timestamp[:creatorId]
          const parts = externalRef.split(":");
          const plan = parts[1] || "monthly";
          const userEmail = parts[2] || null;
          const userId = parts[3] && parts[3] !== "na" ? parts[3] : null;
          const creatorId = (p?.metadata?.creator_id || p?.metadata?.creatorId || parts[4]) || null;

          // Best-effort: update Mongo User if exists
          try {
            const User = require("../models/User").default;
            const query: any = userId ? { _id: userId } : userEmail ? { email: userEmail } : null;
            if (query) {
              const nextBilling = new Date();
              if (plan === "yearly") nextBilling.setFullYear(nextBilling.getFullYear() + 1);
              else nextBilling.setMonth(nextBilling.getMonth() + 1);
              await User.updateOne(query, {
                $set: {
                  role: "subscriber",
                  isPremium: true,
                  subscriptionStatus: "active",
                  subscription: {
                    plan: plan,
                    status: "active",
                    startDate: new Date(),
                    nextBilling,
                    paymentMethod: "mercado_pago",
                    mercadoPagoId: p.id,
                  },
                },
              }, { upsert: false });
            }
          } catch (e) {
            console.warn("Mongo update skipped/failure:", (e as any)?.message);
          }

          // Best-effort: compute and record commission when we can associate a creator
          try {
            if (creatorId) {
              const { computeCommissionPercent, recordCommissionBestEffort } = require("../utils/commission");
              let creatorSince = new Date();
              let creatorBirthMonth: number | null = null;
              try {
                const User = require("../models/User").default;
                const u = userId ? await User.findByIdAndUpdate(userId, {}, { new: true }) : null;
                // fallback: use createdAt if present in subscription
                creatorSince = new Date((u?.creatorProfile as any)?.since || u?.createdAt || new Date());
                creatorBirthMonth = (u as any)?.creatorProfile?.birthMonth || null;
              } catch {}
              const percent = computeCommissionPercent({ creatorSince, creatorBirthMonth });
              await recordCommissionBestEffort({ creatorId: String(creatorId), grossAmount: Number(p.transaction_amount || 0), currency: String(p.currency_id || 'BRL'), source: 'mercado_pago', eventId: String(p.id), occurredAt: new Date(p.date_approved || Date.now()), percent });
            }
          } catch (e) {
            console.warn("Commission compute skipped:", (e as any)?.message);
          }

          // Notify Supabase payment approved (table payment_events)
          try {
            await fetch(`${process.env.PUBLIC_URL || ""}/api/integrations/supabase/payment-approved`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: p.status, payment_id: p.id, external_reference: externalRef, metadata: { plan, userEmail, userId } }),
            } as any);
          } catch {}
        }
      } catch (e) {
        console.error("Erro ao buscar dados do pagamento:", e);
      }
    }
    res.status(200).send("OK");
  } catch (e) {
    res.status(500).send("Erro interno");
  }
};

export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const p = await payClient().get({ id: req.params.paymentId });
    res.json({ success: true, payment: { id: (p as any).id, status: (p as any).status, status_detail: (p as any).status_detail, amount: (p as any).transaction_amount, currency: (p as any).currency_id, date_created: (p as any).date_created, external_reference: (p as any).external_reference } });
  } catch {
    res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

export const testConfiguration: RequestHandler = async (_req, res) => {
  try {
    const env = getEnvironment();
    let token: string, pubKey: string;
    try { token = getAccessToken(); pubKey = getPublicKey(); } catch (e) {
      return res.status(400).json({ success: false, message: e instanceof Error ? e.message : "Credenciais ausentes", environment: env });
    }
    const resp = await fetch("https://api.mercadopago.com/users/me", { headers: { Authorization: `Bearer ${token}` } } as any);
    if (!resp.ok) {
      let info: any = null;
      try { info = await resp.json(); } catch {}
      const detail = info?.message || `HTTP ${resp.status}`;
      const status = resp.status === 401 ? 401 : 400;
      return res.status(status).json({ success: false, message: "Token inválido ou sem permissão", error: detail, environment: env });
    }
    const t = await prefClient().create({ body: { items: [{ title: "Teste", unit_price: 1, quantity: 1, currency_id: "BRL" }], external_reference: `test_${Date.now()}` } });
    res.json({ success: true, message: "Configuração do Mercado Pago está funcionando", preference_id: (t as any).id, access_token_valid: true, public_key_present: Boolean(pubKey), environment: env });
  } catch (error) {
    let detail = "Erro desconhecido";
    if (error instanceof Error) detail = error.message; else { try { detail = JSON.stringify(error as any); } catch { detail = String(error); } }
    const status = /unauthorized|invalid_token|access token/i.test(detail) ? 401 : 500;
    res.status(status).json({ success: false, message: status === 401 ? "Credenciais inválidas do Mercado Pago" : "Erro na configuração do Mercado Pago", error: detail });
  }
};

export const activateUser: RequestHandler = async (req, res) => {
  try {
    const { external_reference, payment_id } = req.body as any;
    res.json({ success: true, message: "Usuário ativado com sucesso", external_reference, payment_id, activated_at: new Date().toISOString() });
  } catch {
    res.status(500).json({ success: false, message: "Erro ao ativar usuário" });
  }
};
