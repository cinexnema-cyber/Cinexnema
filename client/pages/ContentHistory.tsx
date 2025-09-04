import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Edit3, XCircle, ArrowLeft } from "lucide-react";

interface HistoryItem {
  id: string | number;
  content_id: string;
  creator_id?: string;
  event: string;
  details?: any;
  created_at: string;
}

export default function ContentHistory() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Load video details (for title/header)
        try {
          const r = await fetch(`/api/videos-details/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
          });
          const j = await r.json();
          const t = j?.video?.title || "";
          setVideoTitle(String(t));
        } catch {}
        // Load history
        const rh = await fetch(`/api/videos/${encodeURIComponent(id)}/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
        });
        const jh = await rh.json();
        const arr: HistoryItem[] = Array.isArray(jh?.history) ? jh.history : [];
        setHistory(arr);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const iconFor = (e: string) => {
    if (e === "approved") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (e === "rejected") return <XCircle className="w-5 h-5 text-red-600" />;
    if (e === "uploaded" || e === "created" || e === "updated") return <Clock className="w-5 h-5 text-muted-foreground" />;
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const labelFor = (h: HistoryItem) => {
    const when = h.created_at ? new Date(h.created_at).toLocaleString("pt-BR") : "";
    const det = h.details && typeof h.details === "object" ? h.details : {};
    if (h.event === "approved") return `Aprovado em ${when}`;
    if (h.event === "rejected") return `Rejeitado em ${when}${det?.reason ? ` • Motivo: ${det.reason}` : ""}`;
    if (h.event === "uploaded" || h.event === "created") return `Enviado em ${when}`;
    if (h.event === "updated") return `Atualizado em ${when}`;
    return `${h.event} em ${when}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Histórico do Vídeo</h1>
            <p className="text-muted-foreground">{videoTitle ? `"${videoTitle}"` : "Detalhes do histórico"}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/creator-portal">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Link>
            </Button>
            {id && (
              <Button asChild className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                <Link to={`/content/${id}/edit`}>
                  <Edit3 className="w-4 h-4 mr-2" /> Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eventos registrados</CardTitle>
            <CardDescription>Uploads, aprovações, rejeições e atualizações</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento encontrado.</p>
            ) : (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={String(h.id)} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {iconFor(h.event)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{h.event}</Badge>
                        {h.details?.title ? (
                          <span className="text-sm text-muted-foreground truncate">{h.details.title}</span>
                        ) : null}
                      </div>
                      <div className="text-sm mt-1">{labelFor(h)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {id && (
          <div className="flex justify-end">
            <Button asChild>
              <Link to={`/content/${id}/edit`}>
                <Edit3 className="w-4 h-4 mr-2" /> Editar Conteúdo
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
