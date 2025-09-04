import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextReal";

export default function CreatorReferralLinks() {
  const { user } = useAuth();
  const [videoId, setVideoId] = useState("");
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<{ totalViews: number; totalSignups: number; totalEarnings: number } | null>(null);

  const shareUrl = useMemo(() => {
    const base = (window.location.origin || "https://xnema.com").replace(/\/$/, "");
    const ref = user?.id || "";
    return videoId ? `${base}/watch/${encodeURIComponent(videoId)}?ref=${encodeURIComponent(ref)}` : "";
  }, [videoId, user?.id]);

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const resp = await fetch(`/api/creator/${user.id}/referrals/summary`);
      if (resp.ok) {
        const data = await resp.json();
        setSummary(data.summary);
      }
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Links de Compartilhamento</CardTitle>
        <CardDescription>Gere links únicos por vídeo com seu código de referência automático</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input placeholder="ID do vídeo (ex: 456)" value={videoId} onChange={(e) => setVideoId(e.target.value)} />
          <Button variant="outline" onClick={copy} disabled={!shareUrl} className="whitespace-nowrap">
            <Copy className="w-4 h-4 mr-1" /> {copied ? "Copiado!" : "Copiar link"}
          </Button>
        </div>
        {shareUrl && (
          <div className="text-xs text-muted-foreground break-all">{shareUrl}</div>
        )}
        <div className="pt-2">
          <Button variant="outline" onClick={loadStats} className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Atualizar estatísticas</Button>
          {summary && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">Views: {summary.totalViews}</Badge>
              <Badge variant="secondary">Assinaturas: {summary.totalSignups}</Badge>
              <Badge className="bg-green-600 text-white">R$ {summary.totalEarnings.toFixed(2)}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
