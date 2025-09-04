import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Send } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

export default function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const t = await r.text();
      const j = t ? JSON.parse(t) : {};
      const reply = j?.reply || (j?.message && !r.ok ? `Erro: ${j.message}` : "");
      setMessages((m) => [...m, { role: "assistant", content: String(reply || "Sem resposta") }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Erro de conexão: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full bg-xnema-orange text-black hover:bg-xnema-orange/90 shadow-lg">
            <Bot className="w-4 h-4 mr-2" /> Falar com a IA
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assistente IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">Faça perguntas sobre upload, blocos e monetização.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-xnema-orange text-black" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua mensagem..." disabled={loading} />
            <Button onClick={send} disabled={loading} className="bg-xnema-orange text-black hover:bg-xnema-orange/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
