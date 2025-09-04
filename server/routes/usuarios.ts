import express from "express";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../utils/supabaseClient";

const router = express.Router();

router.post("/cadastrar", async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, email, senha } = req.body || {};

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, cpf, data_nascimento },
    });

    if (error) {
      console.error("Supabase admin createUser error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Opcional: sincroniza/garante registro na tabela "users" com hash de senha
    try {
      const password_hash = await bcrypt.hash(senha, 10);
      await supabase
        .from("users")
        .upsert(
          {
            email: email.toLowerCase(),
            name: nome || (email.split("@")[0] || "Usuário"),
            password_hash,
            role: "subscriber",
            is_premium: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
    } catch (syncErr: any) {
      console.warn("Aviso: falha ao sincronizar na tabela users:", syncErr?.message || syncErr);
    }

    return res.json({ message: "Usuário criado com sucesso no Supabase!", user: data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
