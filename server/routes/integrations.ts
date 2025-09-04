/* eslint-disable */
import { RequestHandler } from "express";
import fetch from "node-fetch";

export const notifySupabasePaymentApproved: RequestHandler = async (req, res) => {
  try {
    const { status, payment_id, external_reference, metadata } = req.body || {};
    if (status !== "approved")
      return res.status(200).json({ success: true, skipped: true, message: "Status não aprovado, ignorado" });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE)
      return res.status(200).json({ success: true, message: "Supabase não configurado, retorno local concluído" });

    const table = process.env.SUPABASE_PAYMENTS_TABLE || "payment_events";
    const payload = [
      {
        event: "pagamento_aprovado",
        status,
        payment_id: payment_id || null,
        external_reference: external_reference || null,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      },
    ];

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}` as any, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE as string,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    } as any);
    if (!resp.ok) {
      let info: any = null;
      try {
        info = await resp.json();
      } catch {}
      return res.status(resp.status).json({ success: false, message: "Falha ao notificar Supabase", error: info });
    }

    const data = await resp.json();
    res.json({ success: true, message: "Supabase notificado", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro interno", error: error instanceof Error ? error.message : "Erro desconhecido" });
  }
};
