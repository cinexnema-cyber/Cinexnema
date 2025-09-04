import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Award, DollarSign, TrendingUp, Upload, BarChart3, ArrowLeft, ArrowRight } from "lucide-react";

export default function CreatorInfo() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black" asChild>
          <Link to="/creator-login"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Portal do Criador</Link>
        </Button>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle>Como Funciona o Programa de Criadores</CardTitle>
            <CardDescription>Monetize seu conteúdo com transparência e controle</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200"><TrendingUp className="w-4 h-4 text-xnema-orange" /> 70% da receita é sua</div>
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200"><DollarSign className="w-4 h-4 text-xnema-purple" /> 3 meses 100% seus</div>
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200"><Upload className="w-4 h-4 text-xnema-orange" /> Upload ilimitado 4K</div>
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200"><BarChart3 className="w-4 h-4 text-xnema-purple" /> Analytics detalhados</div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Receba por visualizações e engajamento dos assinantes</p>
              <p>• Política de carência para garantir qualidade ao público</p>
              <p>• Dashboard completo para acompanhar ganhos e desempenho</p>
              <p>• Saques mensais automáticos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>Comece a publicar e ganhar hoje</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black" onClick={() => navigate("/creator-login")}>
              Entrar no Portal
            </Button>
            <Button variant="outline" onClick={() => navigate("/register/creator")}>
              Virar Criador <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
