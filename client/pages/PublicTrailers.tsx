import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";

interface TrailerItem { id: string; title: string; url: string | null; thumbnail: string | null; creatorId?: string | null }

export default function PublicTrailers() {
  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/videos/public");
        const t = await r.text();
        const j = t ? JSON.parse(t) : {};
        if (!r.ok || !j?.success) throw new Error(j?.message || "Falha ao carregar trailers");
        setTrailers(Array.isArray(j.trailers) ? j.trailers : []);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Trailers Disponíveis</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {trailers.map((tr) => (
              <div key={tr.id} className="border rounded-lg p-3 bg-background">
                <h2 className="font-semibold mb-2">{tr.title}</h2>
                {tr.url ? (
                  <video src={tr.url} controls className="w-full rounded" />
                ) : (
                  <div className="aspect-video bg-muted rounded" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
