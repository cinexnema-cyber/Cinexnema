import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  uploadedAt?: string;
  analytics?: { views?: number; clicks?: number; watch_time?: number };
}

export default function ActiveVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("xnema_token") || localStorage.getItem("token");
        const r = await fetch("/api/creator/active-videos", { headers: { Authorization: `Bearer ${token}` } });
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        if (!r.ok || !j?.success) throw new Error(j?.message || `Erro ${r.status}`);
        setVideos(Array.isArray(j?.videos) ? j.videos : []);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar vídeos ativos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = videos.map((v) => ({ name: v.title.slice(0, 12) + (v.title.length > 12 ? "…" : ""), views: Number(v.analytics?.views || 0) }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Meus Vídeos Ativos</h1>
          <Button asChild variant="outline"><Link to="/video-upload">Enviar novo vídeo</Link></Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p>Carregando…</p>
        ) : videos.length === 0 ? (
          <Card><CardContent className="p-6">Nenhum vídeo aprovado ainda.</CardContent></Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Visões por Vídeo</CardTitle>
                <CardDescription>Resumo do período atual</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide={chartData.length > 8} angle={0} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((v) => (
                <Card key={v.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{v.title}</CardTitle>
                    {v.created_at && <CardDescription>Enviado em {new Date(v.created_at).toLocaleDateString("pt-BR")}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} className="w-full rounded" />
                    ) : v.videoUrl ? (
                      <video src={v.videoUrl} controls className="w-full rounded" />
                    ) : (
                      <div className="aspect-video bg-muted rounded" />
                    )}

                    {String(v.status) === "approved" && (
                      <p className="text-green-600 font-semibold">✅ Aprovado</p>
                    )}
                    {String(v.status).includes("pending") && (
                      <p className="text-yellow-600 font-semibold">⏳ Aguardando aprovação</p>
                    )}
                    {String(v.status).includes("reject") && (
                      <p className="text-red-600 font-semibold">❌ Recusado — Motivo: {v.rejection_reason || "não informado"}</p>
                    )}

                    {String(v.status) === "approved" && (
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <div className="font-semibold">Views</div>
                          <div>{Number(v.analytics?.views || 0).toLocaleString("pt-BR")}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Watch time</div>
                          <div>{Number(v.analytics?.watch_time || 0).toLocaleString("pt-BR")}s</div>
                        </div>
                        <div>
                          <div className="font-semibold">Cliques</div>
                          <div>{Number(v.analytics?.clicks || 0).toLocaleString("pt-BR")}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
