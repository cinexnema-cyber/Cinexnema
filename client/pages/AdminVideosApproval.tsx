import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";

interface VideoItem { id: string; title: string; url?: string | null; thumbnail_url?: string | null; }

export default function AdminVideosApproval() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const { token } = useAuth();

  const fetchPending = async () => {
    try {
      const r = await fetch("/api/admin/videos/pending", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
      const j = await r.json();
      let arr: any[] = Array.isArray(j?.videos) ? j.videos : (Array.isArray(j) ? j : []);
      if (!arr || arr.length === 0) {
        const r2 = await fetch("/api/admin/videos/pending-supa", { headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
        const j2 = await r2.json();
        arr = Array.isArray(j2?.videos) ? j2.videos : [];
      }
      setVideos(arr.map((v: any) => ({ id: String(v.id || v._id), title: v.title, url: v.url || v.videoUrl || null, thumbnail_url: v.thumbnail_url || v.thumbnailUrl || null })));
    } catch (e) {
      setVideos([]);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/videos/${id}/approve`, { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    setVideos((vs) => vs.filter((v) => v.id !== id));
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/videos/${id}/reject`, { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` } });
    setVideos((vs) => vs.filter((v) => v.id !== id));
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📌 Aprovação de Vídeos</h1>
        {videos.length === 0 ? (
          <p>Nenhum vídeo pendente.</p>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded p-4 shadow bg-background">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                {video.url ? (
                  <video src={video.url} controls className="w-full mt-2 rounded" />
                ) : (
                  <div className="w-full aspect-video mt-2 rounded bg-muted" />
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-[length:200%_200%] animate-gradient"
                    onClick={() => handleApprove(video.id)}
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-[length:200%_200%] animate-gradient"
                    onClick={() => handleReject(video.id)}
                  >
                    ❌ Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
