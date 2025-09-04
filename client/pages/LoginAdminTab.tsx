import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Mail, Lock, Shield, Users, BarChart } from "lucide-react";

interface LoginAdminTabProps {
  adminForm: { email: string; password: string };
  setAdminForm: React.Dispatch<
    React.SetStateAction<{ email: string; password: string }>
  >;
  handleAdminLogin: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  errorMessage: string;
}

export const LoginAdminTab: React.FC<LoginAdminTabProps> = ({
  adminForm,
  setAdminForm,
  handleAdminLogin,
  isLoading,
  errorMessage,
}) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Admin Login Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-red-500" />
            <span>Login de Administrador</span>
          </CardTitle>
          <CardDescription>
            Acesso exclusivo para administradores da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Email do Administrador
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="email"
                    placeholder="admin@xnema.com"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="pl-10 flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="pl-10 flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : "Entrar como Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Capabilities */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span>Painel Administrativo</span>
          </CardTitle>
          <CardDescription>
            Ferramentas de gestão da plataforma XNEMA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-foreground">
                  Gestão de Usuários
                </h4>
                <p className="text-sm text-muted-foreground">
                  Administrar assinantes e criadores
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-foreground">
                  Aprovação de Conteúdo
                </h4>
                <p className="text-sm text-muted-foreground">
                  Revisar e aprovar vídeos de criadores
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <BarChart className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-foreground">
                  Analytics Completo
                </h4>
                <p className="text-sm text-muted-foreground">
                  Relatórios e métricas da plataforma
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-500 mb-2">
              ⚠️ Acesso Restrito
            </h4>
            <p className="text-sm text-muted-foreground">
              Apenas administradores autorizados podem acessar este painel.
              Todas as ações são registradas para auditoria.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
