import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Agradecimento() {
  return (
    <Layout>
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Obrigado por confiar na nossa plataforma!</CardTitle>
              <CardDescription>Seu conteúdo foi enviado para análise. Você será notificado assim que for aprovado.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Nossa equipe revisará as informações e a qualidade do conteúdo. Enquanto isso, você pode voltar para a área do criador e acompanhar seus envios.
              </p>
              <Button asChild>
                <Link to="/creator-portal">Voltar à Área do Criador</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
