import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginBasic() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data?.error || "Erro no login");
      const { token, role, name } = data;
      if (!token || !role) throw new Error("Resposta inválida do servidor");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ token, role, name }));
      // Compatibilidade com AuthContextReal
      localStorage.setItem("xnema_token", token);
      localStorage.setItem(
        "xnema_user",
        JSON.stringify({ id: "", email, name: name || email.split("@")[0], role, isPremium: role === "subscriber", subscriptionStatus: "", assinante: role === "subscriber" })
      );
      if (role === "subscriber") navigate("/subscriber");
      else if (role === "child") navigate("/child");
      else if (role === "creator") navigate("/creator");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (e: any) {
      setError(e?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" /> Entrando...</span>
              ) : (
                <span className="inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Entrar</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
