import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Play, Lock, Crown, CreditCard } from "lucide-react";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description?: string;
}

interface SubscriberOnlyVideosProps {
  videos: Video[];
  title?: string;
  description?: string;
}

export const SubscriberOnlyVideos: React.FC<SubscriberOnlyVideosProps> = ({
  videos,
  title = "Vídeos Premium",
  description = "Conteúdo exclusivo para assinantes",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is subscriber using user && user.assinante === true
  const isSubscriber = user && (user as any).assinante === true;

  const handleSubscribe = () => {
    navigate("/subscribe");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  if (!user) {
    // User not logged in
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl">Login Necessário</CardTitle>
          <CardDescription className="text-lg">
            Faça login para acessar o conteúdo premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black font-semibold"
          >
            <Crown className="w-4 h-4 mr-2" />
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscriber) {
    // User logged in but not subscriber
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl">
            Assine para acessar os filmes!
          </CardTitle>
          <CardDescription className="text-lg">
            Este conteúdo está disponível apenas para assinantes premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Olá,{" "}
            <span className="font-semibold text-xnema-orange">{user.name}</span>
            ! Para acessar nosso catálogo premium, você precisa ser assinante.
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-6">
            <div className="text-center p-4 bg-xnema-surface rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Básico</h4>
              <p className="text-2xl font-bold text-xnema-orange">R$ 19,90</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">
                Intermediário
              </h4>
              <p className="text-2xl font-bold text-xnema-orange">R$ 59,90</p>
              <p className="text-sm text-muted-foreground">por mês</p>
              <div className="mt-2">
                <span className="text-xs bg-xnema-orange text-black px-2 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
            </div>
            <div className="text-center p-4 bg-xnema-surface rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Premium</h4>
              <p className="text-2xl font-bold text-xnema-orange">R$ 199,90</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black font-semibold"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Escolher Plano
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User is subscriber - show videos
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="group hover:scale-105 transition-all cursor-pointer"
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Assistir
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-sm line-clamp-2">
                {video.title}
              </CardTitle>
              {video.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {video.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
