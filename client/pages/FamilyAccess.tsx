import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextReal";

export default function FamilyAccess() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>(["", "", "", "", ""]);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("acessocinexnemafamila");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`/api/subscription/family-members?owner_user_id=${encodeURIComponent(user?.id || "")}`);
        const data = await resp.json();
        if (data?.success && Array.isArray(data.members)) {
          const list = data.members.map((m: any) => m.email);
          setEmails([list[0] || "", list[1] || "", list[2] || "", list[3] || "", list[4] || ""]);
          if (data.password) setPassword(data.password);
        }
      } catch {}
    };
    if (user?.id) load();
  }, [user?.id]);

  const save = async () => {
    try {
      setSaving(true);
      setMessage("");
      const resp = await fetch("/api/subscription/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_user_id: user?.id, emails: emails.filter(Boolean) }),
      });
      const data = await resp.json();
      if (data?.success) {
        setPassword(data.password || password);
        setMessage("Logins atualizados com sucesso");
      } else {
        setMessage(data?.message || "Falha ao salvar");
      }
    } catch (e: any) {
      setMessage(e?.message || "Erro inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-16 bg-gradient-to-br from-[#0b0b0f] via-[#12121b] to-[#1a1a25]">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="bg-neutral-900/90 border border-neutral-800 ring-1 ring-neutral-700">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight bg-clip-text text-transparent">Gerenciar Acessos da Família</CardTitle>
              <CardDescription>Defina até 5 emails que poderão usar seu plano com a senha única.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-neutral-300">Senha única para familiares: <span className="font-semibold text-white">{password}</span></div>
              <div className="grid gap-3">
                {emails.map((val, idx) => (
                  <input
                    key={idx}
                    value={val}
                    onChange={(e) => {
                      const next = [...emails];
                      next[idx] = e.target.value;
                      setEmails(next);
                    }}
                    placeholder={`email ${idx + 1}`}
                    className="w-full rounded-lg bg-neutral-900/70 border border-neutral-800 px-3 py-2 text-sm text-white"
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-cinexnema-accent to-cinexnema-highlight text-black font-bold rounded-full px-6">
                  {saving ? "Salvando..." : "Salvar Acessos"}
                </Button>
              </div>
              {message && <div className="text-sm text-neutral-300">{message}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
