import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "../utils/supabaseClient";

export const checkDeviceAccess: RequestHandler = async (req, res) => {
  try {
    const { user_id, device_id, email, ip, user_agent } = req.body as { user_id?: string; device_id?: string; email?: string; ip?: string; user_agent?: string };
    if (!user_id || !device_id) {
      return res.status(400).json({ success: false, error: "user_id e device_id são obrigatórios" });
    }

    const supabase = getSupabaseAdmin();

    // Buscar assinatura ativa com limite de dispositivos do plano
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plans:plan_id(dispositivos)")
      .eq("user_id", user_id)
      .eq("ativo", true)
      .single();

    if (subError && subError.code !== "PGRST116") {
      return res.status(500).json({ success: false, error: subError.message });
    }

    if (!subscription) {
      return res.status(403).json({ success: false, error: "Usuário sem assinatura ativa" });
    }

    // Plano do usuário pode vir via tabela de planos (dispositivos) ou por nome; fallback: básico=2, família=5, premium=7
    let deviceLimit = subscription?.plans?.dispositivos ?? null;
    if (deviceLimit == null) {
      const planName = (subscription?.plan || subscription?.nome || subscription?.tier || "basico").toString().toLowerCase();
      if (planName.includes("premium")) deviceLimit = 7;
      else if (planName.includes("famil")) deviceLimit = 5;
      else deviceLimit = 2;
    }

    // Buscar dispositivos já registrados
    const { data: devices, error: devError } = await supabase
      .from("devices")
      .select("device_id")
      .eq("user_id", user_id);

    if (devError) {
      return res.status(500).json({ success: false, error: devError.message });
    }

    const list = devices || [];
    const exists = list.find((d: any) => d.device_id === device_id);

    // Se já atingiu o limite e esse dispositivo ainda não existe, bloquear
    if (!exists && list.length >= deviceLimit) {
      return res.status(403).json({ success: false, error: "Limite de dispositivos atingido" });
    }

    // Registrar novo dispositivo se não existir
    if (!exists) {
      const payload: any = { user_id, device_id };
      if (email) payload.email = email;
      if (ip) payload.ip = ip;
      if (user_agent) payload.user_agent = user_agent;
      const { error: insError } = await supabase.from("devices").insert([payload]);
      if (insError) {
        return res.status(500).json({ success: false, error: insError.message });
      }
    }

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "Erro interno" });
  }
};
