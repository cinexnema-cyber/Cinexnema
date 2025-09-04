import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  Video,
  Users,
  Play,
  Upload,
  DollarSign,
  Star,
  ArrowRight,
  Settings,
  BarChart3,
  FileVideo,
  Palette,
} from "lucide-react";

interface AreaOption {
  id: "subscriber" | "creator";
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
  comingSoon?: boolean;
}

export default function AreaSelection() {
  const { user, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState<
    "subscriber" | "creator" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const areas: AreaOption[] = [
    {
      id: "subscriber",
      title: "Área do Assinante",
      description: "Assista ao melhor conteúdo premium da XNEMA",
      icon: Crown,
      gradient: "from-xnema-orange to-xnema-purple",
      features: [
        "Catálogo completo de séries e filmes",
        "Qualidade 4K e HDR disponível",
        "Sem anúncios ou interrupções",
        "Download para assistir offline",
        "Múltiplas telas simultâneas",
        "Suporte prioritário",
      ],
    },
    {
      id: "creator",
      title: "Área do Criador",
      description: "Publique seu conteúdo e monetize sua criatividade",
      icon: Video,
      gradient: "from-blue-500 to-teal-500",
      features: [
        "Upload de vídeos e séries",
        "Dashboard de analytics detalhado",
        "Sistema de monetização",
        "Ferramentas de edição básicas",
        "Gestão de audiência",
        "Suporte especializado",
      ],
      comingSoon: false,
    },
  ];

  const handleAreaSelect = async (areaId: "subscriber" | "creator") => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSelectedArea(areaId);
    setIsLoading(true);

    try {
      // Atualiza o role do usuário
      await updateUserRole(areaId === "subscriber" ? "subscriber" : "creator");

      // Redireciona para a área apropriada
      if (areaId === "subscriber") {
        if (user.subscriptionStatus === "ativo") {
          navigate("/subscriber-dashboard");
        } else {
          navigate("/pricing"); // Usuário precisa assinar primeiro
        }
      } else {
        navigate("/creator-portal");
      }
    } catch (error) {
      console.error("Erro ao selecionar área:", error);
      // Em caso de erro, redireciona para o dashboard geral
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
      setSelectedArea(null);
    }
  };

  const handleSkip = () => {
    // Redireciona para dashboard geral
    navigate("/dashboard");
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <Card className="bg-xnema-surface border-xnema-border p-8">
            <CardContent className="text-center">
              <p className="text-white">
                Você precisa estar logado para acessar esta página.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-4 bg-xnema-orange hover:bg-xnema-orange/90 text-black"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Bem-vindo de volta,
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                {" "}
                {user.displayName || user.username}
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Escolha como você gostaria de usar a XNEMA hoje. Você pode
              alternar entre as áreas a qualquer momento.
            </p>
          </div>

          {/* Area Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {areas.map((area) => (
              <Card
                key={area.id}
                className={`bg-xnema-surface border-xnema-border hover:border-xnema-orange/50 transition-all duration-300 cursor-pointer group ${
                  selectedArea === area.id
                    ? "ring-2 ring-xnema-orange scale-105"
                    : ""
                } ${area.comingSoon ? "opacity-60" : ""}`}
                onClick={() =>
                  !area.comingSoon && !isLoading && handleAreaSelect(area.id)
                }
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${area.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <area.icon className="w-10 h-10 text-white" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <CardTitle className="text-2xl">{area.title}</CardTitle>
                    {area.comingSoon && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-600 text-white"
                      >
                        Em Breve
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="text-gray-400 text-lg">
                    {area.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    {area.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${area.gradient}`}
                        />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() =>
                      !area.comingSoon &&
                      !isLoading &&
                      handleAreaSelect(area.id)
                    }
                    disabled={area.comingSoon || isLoading}
                    className={`w-full ${
                      area.id === "subscriber"
                        ? "bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } ${selectedArea === area.id ? "opacity-50" : ""}`}
                    size="lg"
                  >
                    {selectedArea === area.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Carregando...
                      </>
                    ) : area.comingSoon ? (
                      "Em Breve"
                    ) : (
                      <>
                        Acessar {area.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-xnema-surface/50 border-xnema-border">
              <CardContent className="p-4 text-center">
                <Play className="w-6 h-6 text-xnema-orange mx-auto mb-2" />
                <div className="text-lg font-bold">500+</div>
                <div className="text-xs text-gray-400">Horas de Conteúdo</div>
              </CardContent>
            </Card>

            <Card className="bg-xnema-surface/50 border-xnema-border">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold">10K+</div>
                <div className="text-xs text-gray-400">Usuários Ativos</div>
              </CardContent>
            </Card>

            <Card className="bg-xnema-surface/50 border-xnema-border">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-lg font-bold">4.8</div>
                <div className="text-xs text-gray-400">Avaliação Média</div>
              </CardContent>
            </Card>

            <Card className="bg-xnema-surface/50 border-xnema-border">
              <CardContent className="p-4 text-center">
                <FileVideo className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold">15+</div>
                <div className="text-xs text-gray-400">Séries Originais</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
              className="border-xnema-border text-white hover:bg-xnema-surface"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ir para Dashboard Geral
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/about")}
              className="text-gray-400 hover:text-white"
            >
              Saiba mais sobre a XNEMA
            </Button>
          </div>

          {/* Info Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10 rounded-lg border border-xnema-orange/20">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-xnema-orange">
                💡 Dica: Você pode alternar entre as áreas
              </h3>
              <p className="text-gray-300 text-sm">
                Não se preocupe! Você pode acessar tanto a área do assinante
                quanto a do criador a qualquer momento através do seu perfil.
                Escolha a que mais se adequa ao que você quer fazer agora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
