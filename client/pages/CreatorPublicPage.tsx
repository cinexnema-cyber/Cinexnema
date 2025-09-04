import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

interface Creator { id: string; name: string; bio?: string; profile_image?: string | null; }
interface VideoItem { id: string; title: string; url?: string | null; thumbnail_url?: string | null; }

export default function CreatorPublicPage() {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`/api/creators/${id}/public`);
        const j = await r.json();
        setCreator(j?.creator || null);
        const arr: any[] = Array.isArray(j?.videos) ? j.videos : [];
        setVideos(arr.map((v) => ({ id: String(v.id || v._id), title: v.title, url: v.url || v.videoUrl || null, thumbnail_url: v.thumbnail_url || v.thumbnailUrl || null })));
      } catch {
        setCreator(null);
        setVideos([]);
      }
    })();
  }, [id]);

  if (!creator) return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">Carregando...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {creator.profile_image ? (
            <img src={creator.profile_image} alt={creator.name} className="w-20 h-20 rounded-full border object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full border bg-muted" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{creator.name}</h1>
            {creator.bio && <p className="text-muted-foreground">{creator.bio}</p>}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">🎬 Vídeos de {creator.name}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="border rounded shadow p-2">
              <h3 className="font-semibold">{video.title}</h3>
              {video.url ? (
                <video src={video.url} controls className="w-full mt-2 rounded" />
              ) : (
                <div className="w-full aspect-video mt-2 rounded bg-muted" />
              )}
            </div>
          ))}
          {videos.length === 0 && <p className="text-sm text-muted-foreground">Sem vídeos aprovados.</p>}
        </div>
      </div>
    </Layout>
  );
}
