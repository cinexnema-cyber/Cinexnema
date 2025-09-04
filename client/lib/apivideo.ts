export async function createApiVideo(payload: {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}): Promise<{ videoId: string; contentId: string }>{
  const r = await fetch("/api/apivideo/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
    },
    body: JSON.stringify(payload),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.message || "Falha ao criar vídeo");
  return { videoId: j.videoId, contentId: j.contentId };
}

export async function uploadApiVideoFile(
  videoId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/apivideo/upload/${videoId}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("xnema_token")}`);
    const fd = new FormData();
    fd.append("file", file, file.name || "video.mp4");
    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.max(0, Math.min(99, Math.round((evt.loaded / Math.max(1, evt.total)) * 100)));
      onProgress?.(pct);
    };
    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try {
          const j = JSON.parse(xhr.responseText || "{}");
          reject(new Error(j?.message || xhr.statusText));
        } catch {
          reject(new Error(xhr.statusText));
        }
      }
    };
    xhr.send(fd);
  });
}
