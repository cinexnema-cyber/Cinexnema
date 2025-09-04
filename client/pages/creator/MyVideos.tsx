import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function MyVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("xnema_token") || localStorage.getItem("token");
        const r = await fetch("/api/creator/my-videos", { headers: { Authorization: `Bearer ${token}` } });
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        if (!r.ok) throw new Error(j?.message || `Erro ${r.status}`);
        setVideos(Array.isArray(j?.videos) ? j.videos : (Array.isArray(j) ? j : []));
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = videos
    .filter((v) => v?.analytics && (v.analytics.data || v.analytics.views))
    .map((v) => ({
      name: String(v.title || "").slice(0, 12) + (String(v.title || "").length > 12 ? "…" : ""),
      views: v.analytics?.data ? v.analytics.data.reduce((acc: number, d: any) => acc + (d.views || 0), 0) : Number(v.analytics?.views || 0),
    }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Meus Vídeos e Analytics</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p>Carregando…</p>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum vídeo encontrado.</p>
        ) : (
          <>
            {chartData.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Visões por Vídeo (aprovados)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" hide={chartData.length > 8} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="shadow border rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt={video.title} className="rounded mb-2" />
                    )}

                    {String(video.status) === "approved" && (
                      <p className="text-green-600 font-semibold">✅ Aprovado</p>
                    )}
                    {String(video.status).includes("pending") && (
                      <p className="text-yellow-600 font-semibold">⏳ Aguardando aprovação</p>
                    )}
                    {String(video.status).includes("reject") && (
                      <p className="text-red-600 font-semibold">
                        ❌ Recusado — Motivo: {video.rejection_reason || "não informado"}
                      </p>
                    )}

                    {String(video.status) === "approved" && (
                      video.analytics && (video.analytics.data || video.analytics.views) ? (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground">
                            Visualizações totais: {video.analytics?.data ? video.analytics.data.reduce((acc: number, d: any) => acc + (d.views || 0), 0) : Number(video.analytics?.views || 0)}
                          </p>
                        </div>
                      ) : (
                        <p>📊 Sem dados de analytics disponíveis.</p>
                      )
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
