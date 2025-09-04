import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface TrustedEmailRow { id: string | number; email: string; parent_id?: string | number; created_at?: string; parent?: { email?: string; name?: string } }

export default function TrustedEmailsAdmin() {
  const [emails, setEmails] = useState<TrustedEmailRow[]>([]);
  const fetchEmails = async () => {
    const r = await fetch("/api/trusted_emails", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    const j = await r.json();
    setEmails(Array.isArray(j) ? j : []);
  };
  useEffect(() => { fetchEmails(); }, []);

  const removerEmail = async (id: string | number) => {
    await fetch(`/api/trusted_emails/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    setEmails((arr) => arr.filter((e) => String(e.id) !== String(id)));
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">📋 Emails Confiáveis</h2>
        {emails.length === 0 && <p>Nenhum email confiável cadastrado.</p>}
        <div className="grid gap-2">
          {emails.map((e) => (
            <div key={String(e.id)} className="flex justify-between items-center border p-3 rounded">
              <div>
                <p><b>Email:</b> {e.email}</p>
                <p><b>Assinante:</b> {e.parent?.name} ({e.parent?.email})</p>
                {e.created_at && <p className="text-muted-foreground text-sm">Adicionado em: {new Date(e.created_at).toLocaleString("pt-BR")}</p>}
              </div>
              <Button variant="destructive" onClick={() => removerEmail(e.id)}>Remover</Button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
