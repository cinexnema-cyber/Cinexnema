import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              className="mb-6 text-xnema-orange hover:text-xnema-orange/80"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Termos de Uso
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao acessar e usar a plataforma XNEMA ("Serviço"), você aceita estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar o Serviço.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A XNEMA é uma plataforma de streaming premium brasileira que oferece conteúdo exclusivo, 
                incluindo séries originais e filmes de criadores independentes.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A XNEMA oferece acesso a conteúdo de vídeo sob demanda mediante assinatura mensal de R$ 19,90. 
                O serviço inclui:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Acesso ilimitado ao catálogo de conteúdo premium</li>
                <li>• Streaming em qualidade até 4K</li>
                <li>• Acesso simultâneo em até 4 dispositivos</li>
                <li>• Conteúdo exclusivo e original</li>
                <li>• Downloads para visualizaç��o offline (quando disponível)</li>
                <li>• Primeiro mês gratuito para novos usuários</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Conta de Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para usar o Serviço, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Manter a confidencialidade da sua senha</li>
                <li>• Todas as atividades que ocorrem em sua conta</li>
                <li>• Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>• Fornecer informações precisas e atualizadas</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Assinatura e Pagamento</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Valor da Assinatura:</strong> R$ 19,90 por mês, com o primeiro mês gratuito para novos usuários.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Cobrança:</strong> A cobrança é feita mensalmente através do Mercado Pago. 
                O valor será debitado automaticamente no mesmo dia de cada mês.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento sem multas. 
                O acesso continua até o final do período pago.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Você concorda em não:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Compartilhar sua conta ou credenciais com terceiros</li>
                <li>• Distribuir, copiar ou reproduzir o conteúdo</li>
                <li>• Usar tecnologias para contornar medidas de proteção</li>
                <li>• Fazer engenharia reversa do serviço</li>
                <li>• Usar o serviço para fins comerciais não autorizados</li>
                <li>• Interferir no funcionamento normal da plataforma</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Todo o conteúdo disponível na XNEMA, incluindo vídeos, imagens, textos, marcas e design, 
                é protegido por direitos autorais e outras leis de propriedade intelectual.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A licença concedida é limitada ao uso pessoal e não comercial do conteúdo dentro da plataforma.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Disponibilidade do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Embora nos esforcemos para manter o serviço disponível 24/7, pode haver interrupções 
                devido a manutenção, atualizações ou circunstâncias fora do nosso controle.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O conteúdo pode ser alterado, removido ou adicionado a critério da XNEMA.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A XNEMA não será responsável por danos indiretos, incidentais, especiais ou consequenciais 
                decorrentes do uso ou incapacidade de usar o serviço.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Modificações dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Reservamos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
                nos tribunais competentes do Brasil.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Contato</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• <strong>Email:</strong> cinexnema@gmail.com</li>
                <li>• <strong>WhatsApp:</strong> (15) 99763-6161</li>
                <li>• <strong>Site:</strong> https://oemalta.shop</li>
              </ul>
            </div>
          </div>

          {/* Links relacionados */}
          <div className="mt-12 p-6 bg-xnema-surface rounded-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Documentos Relacionados</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black" asChild>
                <Link to="/privacy-policy">
                  Política de Privacidade
                </Link>
              </Button>
              <Button variant="outline" className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black" asChild>
                <Link to="/creator-terms">
                  Termos para Criadores
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
