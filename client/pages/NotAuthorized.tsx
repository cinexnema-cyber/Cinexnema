import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function NotAuthorized() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="border rounded-2xl p-8 text-center max-w-md w-full bg-background">
          <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">Você não tem permissão para acessar esta área.</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            ⬅️ Voltar para a Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
