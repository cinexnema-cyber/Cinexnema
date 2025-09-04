import type { Request, Response } from "express";

export async function chat(req: Request, res: Response) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "OPENAI_API_KEY ausente" });
    }
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Mensagem inválida" });
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: message,
      }),
    });

    const txt = await r.text();
    const data = txt ? JSON.parse(txt) : {};
    if (!r.ok) {
      return res.status(r.status).json({ success: false, message: data?.error?.message || "Erro na IA" });
    }

    const output = (data as any)?.output_text || (Array.isArray((data as any)?.output) ? (data as any).output.map((o: any) => o.content?.[0]?.text?.value).filter(Boolean).join("\n") : "");
    return res.json({ success: true, reply: output });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: String(e?.message || e) });
  }
}
