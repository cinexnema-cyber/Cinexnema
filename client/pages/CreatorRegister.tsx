import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, Palette, Loader2, CheckCircle } from "lucide-react";

export default function CreatorRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    bio: "",
    avatarUrl: "",
  });

  const onChange = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Nome, email e senha são obrigatórios");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email inválido");
      return;
    }
    if (form.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch("/api/creators/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          whatsapp: form.cpf || "",
          portfolio: "",
          description: form.bio || "Criador cadastrado via portal",
          gracePeriod: "3",
        }),
      });

      let data: any = {};
      try {
        const text = await resp.clone().text();
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (!resp.ok || !data?.success) {
        const msg = data?.message || (resp.status === 409 ? "Email já está em uso" : `Erro (${resp.status}) no cadastro`);
        setError(msg);
        return;
      }

      setSuccess("Cadastro enviado! Aguardando aprovação.");
      setTimeout(() => navigate("/creator-portal"), 1200);
    } catch (e) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-xl border-xnema-orange/30 shadow-xl">
        <CardHeader className="space-y-3 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950 dark:to-purple-950 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">
            Cadastro de Criador
          </CardTitle>
          <CardDescription className="text-center text-orange-700 dark:text-orange-200">
            Torne-se um criador de conteúdo na XNEMA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={form.name} onChange={(e) => onChange("name", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input id="cpf" value={form.cpf} onChange={(e) => onChange("cpf", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia (opcional)</Label>
              <Input id="bio" value={form.bio} onChange={(e) => onChange("bio", e.target.value)} placeholder="Fale um pouco sobre você" />
            </div>


            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple text-black" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 mr-2" /> Criar conta de Criador
                </>
              )}
            </Button>

            <div className="text-center mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/creator-login")}
                className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black"
              >
                Já tem conta? Fazer login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
