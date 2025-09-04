import nodemailer from "nodemailer";

export async function sendEmail(options: { to: string; subject: string; text?: string; html?: string }) {
  const { to, subject, text, html } = options;
  try {
    // Prefer SMTP if provided
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      await transporter.sendMail({ from: process.env.SMTP_FROM || user, to, subject, text, html });
      return { success: true };
    }

    // Fallback: SendGrid Web API
    const sg = process.env.SENDGRID_API_KEY;
    const from = process.env.MAIL_FROM || "no-reply@cinexnema.com";
    if (sg) {
      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sg}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: html ? "text/html" : "text/plain", value: html || text || "" }],
        }),
      });
      if (!resp.ok) throw new Error(`SendGrid error ${resp.status}`);
      return { success: true };
    }

    // Last resort: log
    console.log("[EMAIL:FALLBACK] =>", { to, subject, text, html });
    return { success: false, message: "No email provider configured; logged to console." };
  } catch (e: any) {
    console.warn("sendEmail error:", e?.message || e);
    return { success: false, message: e?.message || String(e) };
  }
}
