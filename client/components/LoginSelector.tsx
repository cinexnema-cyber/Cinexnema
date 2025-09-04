import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Video, Shield, Crown, Palette, ArrowRight } from "lucide-react";

interface LoginSelectorProps {
  title?: string;
  description?: string;
  showGeneralLogin?: boolean;
}

export function LoginSelector({
  title = "Escolha seu Tipo de Acesso",
  description = "Selecione como você deseja acessar a plataforma XNEMA",
  showGeneralLogin = true,
}: LoginSelectorProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Login Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscriber Login */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => navigate("/login/subscriber")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Área do Assinante
                  <Crown className="w-4 h-4 text-blue-500" />
                </CardTitle>
                <CardDescription>
                  Acesse todo o catálogo de filmes e séries
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Streaming em qualidade 4K</li>
              <li>• Acesso ilimitado ao catálogo</li>
              <li>• Download para assistir offline</li>
              <li>• Múltiplos dispositivos</li>
            </ul>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/login/subscriber");
              }}
            >
              Entrar como Assinante
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Creator Login */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => navigate("/creator-login")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center group-hover:opacity-90 transition-opacity">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Portal do Criador
                  <Palette className="w-4 h-4 text-xnema-orange" />
                </CardTitle>
                <CardDescription>
                  Monetize seu conteúdo e alcance milhares
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• 70% da receita para você</li>
              <li>• 3 meses de carência (100% seus)</li>
              <li>• Upload em qualidade 4K</li>
              <li>• Analytics detalhados</li>
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-orange/90 hover:to-xnema-purple/90 text-black font-medium"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/creator-login");
              }}
            >
              Entrar como Criador
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* General Login & Admin Access */}
      {showGeneralLogin && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Outros acessos
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Login Geral
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/register")}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Cadastrar-se
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Não tem uma conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="underline hover:text-foreground"
          >
            Cadastre-se gratuitamente
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginSelector;
