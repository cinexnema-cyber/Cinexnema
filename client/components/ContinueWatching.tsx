import React, { useEffect, useState } from "react";

interface HistoryItem {
  id?: string | number;
  content_id?: string;
  position?: number;
  updated_at?: string;
  progress?: number; // 0..1 when API returns videos
  video_id?: string | number;
  title?: string;
  url?: string | null;
  thumbnail_url?: string | null;
  duration?: string | number | null;
  episode?: string | null;
  content?: any;
}

const toPercent = (v: any) => {
  const n = typeof v === "number" ? v : parseFloat(v || "0");
  if (!isFinite(n)) return 0;
  if (n <= 1) return Math.max(0, Math.min(100, Math.round(n * 100)));
  return Math.max(0, Math.min(100, Math.round(n)));
};

export default function ContinueWatching() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const token = localStorage.getItem("xnema_token") || localStorage.getItem("token") || "";

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      if (!token) return;
      try {
        const r = await fetch("/api/user/continue-watching", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        // Support both shapes: {success, history} and raw array
        const arr: any[] = Array.isArray(j) ? j : Array.isArray(j?.history) ? j.history : Array.isArray(j?.videos) ? j.videos : [];
        const mapped = arr.map((it: any) => {
          const c = it.content || it;
          const title = c?.title || it.title || "";
          const url = c?.videoUrl || c?.url || it.url || null;
          const thumb = c?.thumbnailUrl || c?.thumbnail_url || it.thumbnail_url || null;
          const duration = c?.duration || it.duration || null;
          const episode = c?.episode || c?.episode_label || null;
          const progress = it.progress ?? it.position ?? 0;
          const updated = it.updated_at || it.updatedAt || null;
          const id = c?.id || it.content_id || it.video_id || it.id;
          return { id, title, url, thumbnail_url: thumb, duration, episode, progress, updated_at: updated } as HistoryItem;
        });
        if (!aborted) setItems(mapped);
      } catch (e) {
        if (!aborted) setItems([]);
      }
    };
    load();
    return () => { aborted = true; };
  }, [token]);

  if (!token) return null;
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={String(item.id)} className="group cursor-pointer">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted mb-3">
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title || "Conteúdo"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div className="h-full bg-xnema-orange" style={{ width: `${toPercent(item.progress)}%` }} />
              </div>
              {item.duration ? (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {String(item.duration)}
                </div>
              ) : null}
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1 truncate">{item.title}</h3>
              {item.episode && (
                <p className="text-sm text-muted-foreground mb-1 truncate">{item.episode}</p>
              )}
              {item.updated_at && (
                <div className="text-xs text-muted-foreground">{new Date(item.updated_at).toLocaleString("pt-BR")}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
