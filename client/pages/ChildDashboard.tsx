import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, Film, LogOut, ShieldCheck, User } from "lucide-react";

interface ChildContentItem {
  id: string;
  title: string;
  poster_url?: string | null;
  duration_minutes?: number | null;
}

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<ChildContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const childToken = typeof window !== "undefined" ? localStorage.getItem("xnema_child_token") : null;
  const childInfo = typeof window !== "undefined" ? localStorage.getItem("xnema_child") : null;
  const childEmail = (() => { try { return childInfo ? JSON.parse(childInfo)?.email : ""; } catch { return ""; } })();

  useEffect(() => {
    if (!childToken) {
      navigate("/child-login", { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/child_accounts/videos", {
          headers: { Authorization: `Bearer ${childToken}` },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (!res.ok) throw new Error(data?.error || "Falha ao carregar vídeos");
        setVideos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Erro inesperado");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("xnema_child_token");
    localStorage.removeItem("xnema_child");
    navigate("/child-login", { replace: true });
  };

  const handleEmancipate = async () => {
    if (!childToken) {
      navigate("/child-login", { replace: true });
      return;
    }
    try {
      const res = await fetch("/api/child_accounts/emancipate", {
        method: "POST",
        headers: { Authorization: `Bearer ${childToken}` },
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data?.error || "Falha ao emancipar");
      localStorage.removeItem("xnema_child_token");
      localStorage.removeItem("xnema_child");
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  if (!childToken) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Área da Conta Filho</h1>
                <p className="text-sm text-muted-foreground">Conteúdo aprovado pelo responsável</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {childEmail && (
                <Badge variant="outline" className="capitalize"><User className="w-3 h-3 mr-1" /> {childEmail}</Badge>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" /> Meus Vídeos</CardTitle>
            <CardDescription>Lista de vídeos liberados pelo assinante</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">
                <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full inline-block animate-spin" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-600">{error}</div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Nenhum vídeo liberado ainda</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {videos.map((v) => (
                  <div key={v.id} className="group">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      {v.poster_url ? (
                        <img src={v.poster_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Film className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium line-clamp-2">{v.title}</div>
                      {v.duration_minutes ? (
                        <div className="text-xs text-muted-foreground">{v.duration_minutes} min</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Grid className="w-5 h-5" /> Opções</CardTitle>
            <CardDescription>Ações disponíveis para sua conta</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleEmancipate} className="bg-emerald-600 hover:bg-emerald-700">Emancipar Conta</Button>
            <Button variant="outline" onClick={() => navigate("/public-catalog")}>Ver Catálogo Público</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
