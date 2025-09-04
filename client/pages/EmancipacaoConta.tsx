import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function EmancipacaoConta() {
  const [children, setChildren] = useState<{ id: string | number; email: string; status?: string }[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchChildren = async () => {
    try {
      const r = await fetch("/api/child_accounts", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
      const j = await r.json();
      setChildren(Array.isArray(j?.children) ? j.children : []);
    } catch {
      setChildren([]);
    }
  };

  useEffect(() => { fetchChildren(); }, []);

  const emanciparId = async (id: string | number) => {
    await fetch(`/api/child_accounts/${id}/emancipate`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    fetchChildren();
    alert("Conta emancipada com sucesso");
  };

  const emanciparEmail = async () => {
    if (!email) return;
    const r = await fetch(`/api/child_accounts/emancipate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
      body: JSON.stringify({ email }),
    });
    if (r.ok) {
      setEmail("");
      fetchChildren();
      alert("Email emancipado com sucesso");
    } else {
      const t = await r.text();
      try { const j = t ? JSON.parse(t) : {}; alert(j?.error || "Falha ao emancipar"); } catch { alert("Falha ao emancipar"); }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Emancipação de Conta Filho</CardTitle>
          <CardDescription>Transforme uma conta filho em conta independente de assinatura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <Input placeholder="Email da conta filho" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={emanciparEmail}>Emancipar por Email</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Minhas contas filho</div>
            {children.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma conta filho cadastrada.</div>
            ) : (
              <div className="space-y-2">
                {children.map((c) => (
                  <div key={String(c.id)} className="flex items-center justify-between p-3 rounded border">
                    <div>
                      <div className="font-medium">{c.email}</div>
                      <div className="text-xs text-muted-foreground">Status: {c.status || "active"}</div>
                    </div>
                    <Button onClick={() => emanciparId(c.id)} disabled={c.status === "emancipated"}>
                      {c.status === "emancipated" ? "Emancipada" : "Emancipar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
