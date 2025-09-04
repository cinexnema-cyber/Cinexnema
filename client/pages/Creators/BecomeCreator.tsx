import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function BecomeCreator() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="border rounded-2xl p-10 text-center max-w-lg w-full bg-background">
          <h1 className="text-3xl font-bold text-purple-600 mb-4">🌟 Área exclusiva para Criadores</h1>
          <p className="text-muted-foreground mb-6">
            Você ainda não é um criador de conteúdo. Para ter acesso, cadastre-se como Criador e comece a compartilhar seus vídeos.
          </p>
          <div className="flex flex-col gap-4">
            <Link to="/creator-register" className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition">
              🚀 Quero ser Criador
            </Link>
            <Link to="/" className="px-6 py-3 bg-muted text-foreground rounded-lg shadow hover:bg-muted/80 transition">
              ⬅️ Voltar para a Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
