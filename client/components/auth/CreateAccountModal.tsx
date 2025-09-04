import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Crown,
} from "lucide-react";

export type CreateAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPlan?: "monthly" | "yearly" | "lifetime";
  onRegistered?: (payload: { user?: any; token?: string }) => void;
};

export function CreateAccountModal({
  open,
  onOpenChange,
  defaultPlan = "monthly",
  onRegistered,
}: CreateAccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    plan: defaultPlan as "monthly" | "yearly" | "lifetime",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !!formData.name.trim() &&
      !!formData.email.trim() &&
      !!formData.password &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword
    );
  }, [formData]);

  const handleInput = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!canSubmit) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setError("Nome, email e senha são obrigatórios");
      } else if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
      } else if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem");
      }
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const safeParse = async (resp: Response) => {
        try {
          const t = await resp.text();
          return t ? JSON.parse(t) : {};
        } catch {
          return {} as any;
        }
      };

      const resp = await fetch("/api/auth/register-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          plan: formData.plan,
        }),
      });

      const data = await safeParse(resp);
      if (!resp.ok || !(data && (data.success === true || data.user))) {
        setError(data?.message || data?.error || "Erro no cadastro. Tente novamente.");
        return;
      }

      if (data.token) localStorage.setItem("xnema_token", data.token);
      if (data.user) localStorage.setItem("xnema_user", JSON.stringify(data.user));

      setSuccess("Conta criada com sucesso!");
      onRegistered?.({ user: data.user, token: data.token });

      setTimeout(() => {
        onOpenChange(false);
      }, 900);
    } catch (err) {
      console.error("CreateAccountModal error:", err);
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-blue-200 dark:border-blue-800">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-blue-900 dark:text-blue-50">Criar Conta</DialogTitle>
                <DialogDescription className="text-blue-700 dark:text-blue-200">
                  Acesse conteúdos premium com sua conta XNEMA
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ca-name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ca-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInput("name", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ca-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInput("email", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-phone">Telefone (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ca-phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInput("phone", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ca-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInput("password", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-confirm">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ca-confirm"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInput("confirmPassword", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-plan">Plano Preferido</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => handleInput("plan", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal - R$ 19,90/mês</SelectItem>
                  <SelectItem value="yearly">Anual - R$ 199,90/ano</SelectItem>
                  <SelectItem value="lifetime">Vitalício - R$ 499,90</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Criar Conta Premium
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Ao criar uma conta, você concorda com nossos
            {" "}
            <a href="/terms" className="underline hover:text-foreground">Termos de Uso</a>
            {" "}e{" "}
            <a href="/privacy" className="underline hover:text-foreground">Política de Privacidade</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAccountModal;
