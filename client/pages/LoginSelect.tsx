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
import { Badge } from "@/components/ui/badge";
import {
  User,
  Video,
  Crown,
  Palette,
  ArrowRight,
  TrendingUp,
  Play,
  DollarSign,
  Star,
  Upload,
  Eye,
  Users,
} from "lucide-react";

export default function LoginSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">XNEMA</h1>
          </div>

          <h2 className="text-3xl font-bold text-center">
            Bem-vindo à Plataforma XNEMA
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha como você deseja acessar nossa plataforma de streaming e
            criação de conteúdo
          </p>
        </div>

        {/* Login Options */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Área do Assinante */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-500/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>

              <div>
                <Badge className="bg-blue-500 text-white mb-3">
                  <Crown className="w-3 h-3 mr-1" />
                  Área Premium
                </Badge>
                <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  Sou Assinante
                </CardTitle>
                <CardDescription className="text-blue-800 dark:text-blue-200 text-base">
                  Acesse todo o catálogo de filmes e séries premium
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Seus Benefícios
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    Streaming em qualidade 4K Ultra HD
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    Acesso ilimitado ao catálogo completo
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3" />
                    Download para assistir offline
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Múltiplos dispositivos simultâneos
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base font-medium py-6"
                  onClick={() => navigate("/login/subscriber")}
                >
                  <User className="w-5 h-5 mr-2" />
                  Entrar como Assinante
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-center text-blue-700 dark:text-blue-300">
                  Já tem sua assinatura? Faça login e comece a assistir!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Área do Criador */}
          <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-xnema-orange/50 bg-gradient-to-br from-orange-50/80 to-purple-50/80 dark:from-orange-950/30 dark:to-purple-950/30">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Video className="w-10 h-10 text-white" />
              </div>

              <div>
                <Badge className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-white mb-3">
                  <Palette className="w-3 h-3 mr-1" />
                  Portal Criativo
                </Badge>
                <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  Sou Criador
                </CardTitle>
                <CardDescription className="text-orange-800 dark:text-orange-200 text-base">
                  Monetize seu conteúdo e alcance milhares de pessoas
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Oportunidades
                </h4>
                <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    70% da receita é sua (30% plataforma)
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    Primeiros 3 meses: 100% da receita
                  </li>
                  <li className="flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    Upload ilimitado em qualidade 4K
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    Analytics detalhados de audiência
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-orange/90 hover:to-xnema-purple/90 text-black font-medium text-base py-6"
                  onClick={() => navigate("/creator-login")}
                >
                  <Video className="w-5 h-5 mr-2" />
                  Entrar como Criador
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-center text-orange-700 dark:text-orange-300">
                  Comece a monetizar seu conteúdo hoje mesmo!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Options */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">
                Outras opções
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/register-subscriber")}
              className="flex items-center gap-2 px-6"
            >
              <User className="w-4 h-4" />
              Criar Conta Assinante
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-6"
            >
              <ArrowRight className="w-4 h-4" />
              Login Geral
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/visitor")}
              className="flex items-center gap-2 px-6"
            >
              <Eye className="w-4 h-4" />
              Visitar como Convidado
            </Button>


          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto pb-8">
          <p className="mb-2">
            Ao acessar nossa plataforma, você concorda com nossos{" "}
            <button
              onClick={() => navigate("/terms")}
              className="underline hover:text-foreground"
            >
              Termos de Uso
            </button>{" "}
            e{" "}
            <button
              onClick={() => navigate("/privacy")}
              className="underline hover:text-foreground"
            >
              Política de Privacidade
            </button>
          </p>
          <p className="text-xs">
            XNEMA - A plataforma onde criadores e espectadores se encontram
          </p>
        </div>
      </div>
    </div>
  );
}
