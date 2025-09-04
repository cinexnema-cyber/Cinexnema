import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlocksPolicy() {
  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 text-foreground">
        <h1 className="text-3xl font-bold mb-6">Política do Sistema de Blocos</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Como funcionam os blocos</CardTitle>
              <CardDescription>Armazenamento e custo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• 1 bloco = 7,3 GB de armazenamento.</p>
              <p>• Valor por bloco: R$ 1.000,00.</p>
              <p>• A calculadora é fracionada: cobramos proporcionalmente aos blocos necessários, arredondando para o bloco inteiro seguinte quando ultrapassar a fração.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefícios iniciais</CardTitle>
              <CardDescription>Facilitando os primeiros uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Primeiros 3 meses: 2 blocos gratuitos (por criador) para uso imediato.</p>
              <p>• Após o período, todos os blocos passam a ser cobrados normalmente.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promoções anuais</CardTitle>
              <CardDescription>Créditos sazonais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Janeiro: crédito promocional de 1 bloco por criador.</p>
              <p>• Maio: crédito promocional de 1 bloco por criador.</p>
              <p>• Créditos promocionais não são cumulativos com meses anteriores e expiram em 30 dias.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aprovação e publicação</CardTitle>
              <CardDescription>Fluxo de revisão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Após o upload, o conteúdo entra em fila para aprovação do time de revisão.</p>
              <p>• Apenas trailers ficam públicos; filmes e séries exigem assinatura ativa para visualização.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
