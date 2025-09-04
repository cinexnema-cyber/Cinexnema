import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, LogIn } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-6">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="tracking-tight text-2xl font-bold text-xnema-orange">Acesso Assinante</CardTitle>
            <CardDescription>Acesse sua conta de assinante</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Entre para assistir conteúdos premium, gerenciar sua assinatura e continuar de onde parou.
            </p>
            <Button asChild className="w-full">
              <Link to="/login/subscriber">
                <LogIn className="mr-2 h-4 w-4" /> Entrar como Assinante
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="tracking-tight text-2xl font-bold text-xnema-orange">Acesso Criador</CardTitle>
            <CardDescription>Portal para criadores de conteúdo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Faça login para enviar vídeos, acompanhar analytics e gerenciar seus ganhos.
            </p>
            <Button asChild variant="outline" className="w-full border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black">
              <Link to="/creator-login">
                <Crown className="mr-2 h-4 w-4" /> Entrar como Criador
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
