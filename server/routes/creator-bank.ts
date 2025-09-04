import { RequestHandler } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../utils/supabaseClient";

const bankSchema = z.object({
  fullName: z.string().min(2),
  cpfCnpj: z.string().min(5),
  bankName: z.string().optional().nullable(),
  accountType: z.string().optional().nullable(),
  agency: z.string().optional().nullable(),
  account: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  pixType: z.string().optional().nullable(),
});

export const saveCreatorBank: RequestHandler = async (req, res) => {
  try {
    const { creatorId } = req.params as { creatorId: string };
    const userId = (req as any).userId as string | undefined;
    const userRole = (req as any).userRole as string | undefined;

    if (!userId) return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    if (userId !== creatorId && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Acesso negado" });
    }

    const parsed = bankSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues?.[0]?.message || "Dados inválidos" });
    }

    const sb = getSupabaseAdmin();
    const payload: any = {
      creator_id: creatorId,
      holder_name: parsed.data.fullName,
      cpf: parsed.data.cpfCnpj,
      bank_name: parsed.data.bankName || null,
      account_type: parsed.data.accountType || null,
      agency: parsed.data.agency || null,
      account: parsed.data.account || null,
      pix_key: parsed.data.pixKey || null,
      pix_type: parsed.data.pixType || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from("creator_bank_accounts").upsert(payload, { onConflict: "creator_id" });
    if (error) throw error;

    return res.json({ success: true });
  } catch (e: any) {
    console.error("saveCreatorBank error:", e);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

export default saveCreatorBank;
