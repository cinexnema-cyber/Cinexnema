import React from "react";
import { Layout } from "@/components/layout/Layout";
import { VideoApproval } from "@/components/VideoApproval";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Video,
} from "lucide-react";

export default function VideoApprovalPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin-dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Admin
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Aprovação de{" "}
                    <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                      Vídeos
                    </span>
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie e aprove vídeos enviados pelos criadores da
                    plataforma
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Access
                </Badge>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Processo</p>
                    <p className="font-semibold">Aprovação Rápida</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Qualidade</p>
                    <p className="font-semibold">Controle Total</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Criadores</p>
                    <p className="font-semibold">Suporte Ativo</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Conteúdo</p>
                    <p className="font-semibold">Premium</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                📋 Diretrizes de Aprovação
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <h4 className="font-medium mb-2">✅ Aprovar quando:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Qualidade de áudio e vídeo adequada</li>
                    <li>• Conteúdo original ou com direitos</li>
                    <li>• Título e descrição apropriados</li>
                    <li>• Respeita diretrizes da comunidade</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">❌ Rejeitar quando:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Violação de direitos autorais</li>
                    <li>• Conteúdo inadequado ou ofensivo</li>
                    <li>• Qualidade técnica insuficiente</li>
                    <li>• Informações falsas ou enganosas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Video Approval Component */}
          <VideoApproval />

          {/* Footer Info */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Como administrador, você é responsável por manter a qualidade e
              segurança do conteúdo na plataforma XNEMA.
            </p>
            <p className="mt-1">
              Para dúvidas sobre diretrizes de aprovação, consulte o manual do
              administrador.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
