import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  { value: "serie", label: "Série" },
  { value: "filme", label: "Filme" },
  { value: "trailer", label: "Trailer" },
  { value: "ficcao", label: "Ficção" },
  { value: "documentario", label: "Documentário" },
  { value: "drama", label: "Drama" },
  { value: "comedia", label: "Comédia" },
  { value: "acao", label: "Ação" },
  { value: "terror", label: "Terror" },
  { value: "romance", label: "Romance" },
  { value: "animacao", label: "Animação" },
  { value: "geral", label: "Geral" },
];

export default function ContentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "geral",
    tags: "",
    originalTitle: "",
    contentType: "filme",
    synopsis: "",
    genres: "",
    releaseYear: "",
    country: "",
    language: "",
    subtitles: "",
    dubbing: "",
    ageRating: "",
    directors: "",
    producers: "",
    cast: "",
    durationMinutes: "",
    episodes: "",
    seasons: "",
    posterUrl: "",
    thumbnailUrl: "",
    isTrailer: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("xnema_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let r = await fetch(`/api/videos/${id}`, { headers });
        let txt = await r.text();
        let j = txt ? JSON.parse(txt) : {};
        if (!r.ok || !j?.success || !j?.video) {
          const r2 = await fetch(`/api/videos-details/${id}`, { headers });
          const t2 = await r2.text();
          const j2 = t2 ? JSON.parse(t2) : {};
          if (!r2.ok || !j2?.success) throw new Error(j?.message || j2?.message || "Erro ao carregar");
          j = j2;
        }
        const v = j.video || {};
        const m = v.metadata || {};
        setForm((prev) => ({
          ...prev,
          title: v.title || "",
          description: v.description || "",
          category: v.category || "geral",
          tags: Array.isArray(v.tags) ? v.tags.join(", ") : (v.tags || []).toString(),
          originalTitle: m.originalTitle || "",
          contentType: m.contentType || "filme",
          synopsis: m.synopsis || "",
          genres: Array.isArray(m.genres) ? m.genres.join(", ") : (m.genres || ""),
          releaseYear: m.releaseYear ? String(m.releaseYear) : "",
          country: m.country || "",
          language: m.language || "",
          subtitles: Array.isArray(m.subtitles) ? m.subtitles.join(", ") : (m.subtitles || ""),
          dubbing: Array.isArray(m.dubbing) ? m.dubbing.join(", ") : (m.dubbing || ""),
          ageRating: m.ageRating || "",
          directors: Array.isArray(m.directors) ? m.directors.join(", ") : (m.directors || ""),
          producers: Array.isArray(m.producers) ? m.producers.join(", ") : (m.producers || ""),
          cast: Array.isArray(m.cast) ? m.cast.join(", ") : (m.cast || ""),
          durationMinutes: m.durationMinutes ? String(m.durationMinutes) : "",
          episodes: m.episodes ? String(m.episodes) : "",
          seasons: m.seasons ? String(m.seasons) : "",
          posterUrl: m.posterUrl || "",
          thumbnailUrl: m.thumbnailUrl || v.thumbnailUrl || "",
          isTrailer: Boolean((m as any).isTrailer) || false,
        }));
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        metadata: {
          originalTitle: form.originalTitle.trim(),
          contentType: form.contentType,
          synopsis: form.synopsis.trim(),
          genres: form.genres.split(",").map((t) => t.trim()).filter(Boolean),
          releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
          country: form.country.trim(),
          language: form.language.trim(),
          subtitles: form.subtitles.split(",").map((t) => t.trim()).filter(Boolean),
          dubbing: form.dubbing.split(",").map((t) => t.trim()).filter(Boolean),
          ageRating: form.ageRating.trim(),
          directors: form.directors.split(",").map((t) => t.trim()).filter(Boolean),
          producers: form.producers.split(",").map((t) => t.trim()).filter(Boolean),
          cast: form.cast.split(",").map((t) => t.trim()).filter(Boolean),
          durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
          episodes: form.episodes ? Number(form.episodes) : undefined,
          seasons: form.seasons ? Number(form.seasons) : undefined,
          posterUrl: form.posterUrl.trim(),
          thumbnailUrl: form.thumbnailUrl.trim(),
          isTrailer: Boolean(form.isTrailer),
        },
        submitForReview: true,
      };

      const r = await fetch(`/api/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
        body: JSON.stringify(payload),
      });
      const txt = await r.text();
      const j = txt ? JSON.parse(txt) : {};
      if (!r.ok || !j?.success) throw new Error(j?.message || "Erro ao salvar");
      navigate('/agradecimento');
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Completar informações do vídeo</CardTitle>
              <CardDescription>Edite os metadados e envie para análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-700 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              {loading ? (
                <p>Carregando...</p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" rows={6} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} maxLength={2000} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
                  </div>

                  <Card className="border-xnema-border">
                    <CardHeader>
                      <CardTitle>Informações Gerais</CardTitle>
                      <CardDescription>Campos principais do conteúdo</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalTitle">Título Original</Label>
                        <Input id="originalTitle" value={form.originalTitle} onChange={(e)=>setForm((p)=>({...p, originalTitle: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contentType">Tipo de Conteúdo</Label>
                        <Select value={form.contentType} onValueChange={(v)=>setForm((p)=>({...p, contentType: v}))}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="filme">Filme</SelectItem>
                            <SelectItem value="serie">Série</SelectItem>
                            <SelectItem value="documentario">Documentário</SelectItem>
                            <SelectItem value="curta">Curta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="synopsis">Sinopse</Label>
                        <Textarea id="synopsis" rows={4} value={form.synopsis} onChange={(e)=>setForm((p)=>({...p, synopsis: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genres">Gêneros</Label>
                        <Input id="genres" placeholder="drama, ação" value={form.genres} onChange={(e)=>setForm((p)=>({...p, genres: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="releaseYear">Ano de lançamento</Label>
                        <Input id="releaseYear" type="number" value={form.releaseYear} onChange={(e)=>setForm((p)=>({...p, releaseYear: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País de origem</Label>
                        <Input id="country" value={form.country} onChange={(e)=>setForm((p)=>({...p, country: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Input id="language" value={form.language} onChange={(e)=>setForm((p)=>({...p, language: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtitles">Legendas</Label>
                        <Input id="subtitles" placeholder="pt-BR, en" value={form.subtitles} onChange={(e)=>setForm((p)=>({...p, subtitles: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dubbing">Dublagem</Label>
                        <Input id="dubbing" placeholder="pt-BR" value={form.dubbing} onChange={(e)=>setForm((p)=>({...p, dubbing: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ageRating">Classificação</Label>
                        <Input id="ageRating" placeholder="livre, 12+, 16+, 18+" value={form.ageRating} onChange={(e)=>setForm((p)=>({...p, ageRating: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="directors">Diretor(es)</Label>
                        <Input id="directors" value={form.directors} onChange={(e)=>setForm((p)=>({...p, directors: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="producers">Produtor(es)</Label>
                        <Input id="producers" value={form.producers} onChange={(e)=>setForm((p)=>({...p, producers: e.target.value}))} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="cast">Elenco principal</Label>
                        <Input id="cast" placeholder="nome1, nome2" value={form.cast} onChange={(e)=>setForm((p)=>({...p, cast: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="durationMinutes">Duração (min)</Label>
                        <Input id="durationMinutes" type="number" value={form.durationMinutes} onChange={(e)=>setForm((p)=>({...p, durationMinutes: e.target.value}))} />
                      </div>
                      {form.contentType === "serie" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="episodes">Episódios</Label>
                            <Input id="episodes" type="number" value={form.episodes} onChange={(e)=>setForm((p)=>({...p, episodes: e.target.value}))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="seasons">Temporadas</Label>
                            <Input id="seasons" type="number" value={form.seasons} onChange={(e)=>setForm((p)=>({...p, seasons: e.target.value}))} />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-xnema-border">
                    <CardHeader>
                      <CardTitle>Mídia</CardTitle>
                      <CardDescription>Imagens do conteúdo</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="posterUrl">Imagem de capa/poster</Label>
                        <Input id="posterUrl" value={form.posterUrl} onChange={(e)=>setForm((p)=>({...p, posterUrl: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Miniatura (upload)</Label>
                        <div className="flex items-center gap-3">
                          {form.thumbnailUrl ? (
                            <img src={form.thumbnailUrl} alt="thumbnail" className="w-14 h-14 rounded object-cover border" />
                          ) : (
                            <div className="w-14 h-14 rounded border bg-muted" />
                          )}
                          <input
                            id="thumbnailFile"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              try {
                                const fd = new FormData();
                                fd.append("image", f);
                                const resp = await fetch("/api/upload/thumbnail", {
                                  method: "POST",
                                  headers: { Authorization: `Bearer ${localStorage.getItem("xnema_token")}` },
                                  body: fd,
                                });
                                const t = await resp.text();
                                const jj = t ? JSON.parse(t) : {};
                                if (!resp.ok || !jj?.success) throw new Error(jj?.message || "Falha no upload da miniatura");
                                setForm((p)=>({ ...p, thumbnailUrl: jj.url }));
                              } catch (err: any) {
                                setError(err?.message || "Erro ao enviar miniatura");
                              }
                            }}
                          />
                          <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={()=>document.getElementById("thumbnailFile")?.click()}>
                            Escolher arquivo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-xnema-border">
                    <CardHeader>
                      <CardTitle>Trailer</CardTitle>
                      <CardDescription>Defina se este conteúdo é um trailer público</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <label className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={form.isTrailer} onChange={(e)=>setForm((p)=>({...p, isTrailer: e.target.checked}))} />
                        <span>Marcar como trailer público (visível para visitantes)</span>
                      </label>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={saving} className="bg-green-500 hover:bg-green-600 text-black font-medium">
                      {saving ? "Salvando..." : "Salvar e enviar"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
