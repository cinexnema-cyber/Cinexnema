import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  uploadedAt?: string;
  duration?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  analytics?: { views?: number; clicks?: number; watch_time?: number };
}

const statusColor = (s: string) =>
  s === "approved"
    ? "border-green-500 bg-green-500/10"
    : s === "pending"
    ? "border-yellow-500 bg-yellow-500/10"
    : s === "rejected"
    ? "border-red-500 bg-red-500/10"
    : "border-muted bg-muted/20";

export default function CreatorVisualDashboard() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const r = await fetch("/api/creator/active-videos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token") || localStorage.getItem("token")}` },
        });
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        const arr: VideoItem[] = Array.isArray(j)
          ? j
          : Array.isArray(j?.videos)
          ? j.videos
          : [];
        setVideos(arr);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar vídeos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎨 Painel Visual de Vídeos</h1>

      {loading && <div className="text-sm text-muted-foreground">Carregando vídeos...</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => {
          const analytics = v.analytics || {};
          const data = [
            { name: "Views", val: Number(analytics.views || 0) },
            { name: "Cliques", val: Number(analytics.clicks || 0) },
            { name: "Assistido (s)", val: Number(analytics.watch_time || 0) },
          ];
          return (
            <Card key={v.id} className={`border ${statusColor(v.status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{v.title}</CardTitle>
                  <Badge variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"}>
                    {v.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {v.videoUrl ? (
                  <video src={v.videoUrl} controls className="w-full rounded" />
                ) : (
                  <div className="aspect-video w-full rounded bg-muted" />
                )}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: "transparent" }} formatter={(value: any) => [value, ""]} />
                      <Bar dataKey="val" fill="#FF8C42" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && videos.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum vídeo ativo encontrado.</p>
      )}
    </div>
  );
}
