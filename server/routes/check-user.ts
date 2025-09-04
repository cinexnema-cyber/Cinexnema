import { Request, Response } from "express";

export const checkUserExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório",
      });
    }

    // Check if user exists in Supabase
    const { createClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (user) {
      return res.json({
        success: true,
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.json({
      success: true,
      exists: false,
    });
  } catch (error) {
    console.error("❌ Erro ao verificar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
