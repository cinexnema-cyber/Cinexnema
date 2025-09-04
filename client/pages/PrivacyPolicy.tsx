import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
              <div className="w-12 h-12 bg-gradient-to-br from-xnema-purple to-xnema-orange rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Política de Privacidade
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A XNEMA ("nós", "nosso" ou "empresa") respeita sua privacidade e está comprometida 
                em proteger suas informações pessoais. Esta Política de Privacidade explica como 
                coletamos, usamos, armazenamos e protegemos suas informações.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Esta política se aplica a todos os usuários da nossa plataforma de streaming, 
                incluindo assinantes e criadores de conteúdo.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Informações que Coletamos</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">2.1 Informações Pessoais</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Nome completo</li>
                <li>• Endereço de email</li>
                <li>• Data de nascimento</li>
                <li>• Informações de pagamento (processadas pelo Mercado Pago)</li>
                <li>• Endereço IP</li>
                <li>• Informações do dispositivo</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">2.2 Dados de Uso</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Histórico de visualização</li>
                <li>• Preferências de conteúdo</li>
                <li>• Tempo de visualização</li>
                <li>• Interações com a plataforma</li>
                <li>• Dados de navegação</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">2.3 Informações Técnicas</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Tipo de dispositivo e sistema operacional</li>
                <li>• Versão do navegador</li>
                <li>• Resolução de tela</li>
                <li>• Informações de rede</li>
                <li>• Cookies e tecnologias similares</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Como Usamos suas Informações</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">3.1 Prestação de Serviços</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Fornecer acesso ao conteúdo da plataforma</li>
                <li>• Processar pagamentos e gerenciar assinaturas</li>
                <li>• Personalizar recomendações de conteúdo</li>
                <li>• Melhorar a qualidade do streaming</li>
                <li>• Fornecer suporte ao cliente</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">3.2 Comunicação</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Enviar confirmações de conta e alterações</li>
                <li>• Notificar sobre novos conteúdos</li>
                <li>• Responder a solicitações de suporte</li>
                <li>• Enviar informações promocionais (com consentimento)</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">3.3 Análise e Melhoria</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Analisar padrões de uso da plataforma</li>
                <li>• Melhorar nossos serviços e funcionalidades</li>
                <li>• Desenvolver novos recursos</li>
                <li>• Realizar pesquisas de mercado</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar informações nas seguintes situações:
              </p>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">4.1 Prestadores de Serviços</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Mercado Pago (processamento de pagamentos)</li>
                <li>• Provedores de CDN (entrega de conteúdo)</li>
                <li>• Serviços de análise e métricas</li>
                <li>• Provedores de infraestrutura em nuvem</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">4.2 Requisitos Legais</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Cumprimento de leis aplicáveis</li>
                <li>• Ordens judiciais</li>
                <li>• Proteção de direitos e segurança</li>
                <li>• Prevenção de fraudes</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Manter você logado na plataforma</li>
                <li>• Lembrar suas preferências</li>
                <li>• Personalizar sua experiência</li>
                <li>• Analisar o uso da plataforma</li>
                <li>• Melhorar nossos serviços</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Você pode gerenciar as configurações de cookies através do seu navegador.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Segurança de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Criptografia de dados em trânsito e em repouso</li>
                <li>• Controles de acesso rigorosos</li>
                <li>• Monitoramento contínuo de segurança</li>
                <li>• Backups regulares</li>
                <li>• Atualizações de segurança frequentes</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Apesar de nossos esforços, nenhum método de transmissão pela internet é 100% seguro.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• <strong>Acesso:</strong> Solicitar informações sobre o tratamento dos seus dados</li>
                <li>• <strong>Correção:</strong> Solicitar a correção de dados incompletos ou incorretos</li>
                <li>• <strong>Eliminação:</strong> Solicitar a exclusão de dados desnecessários</li>
                <li>• <strong>Portabilidade:</strong> Solicitar a transferência dos seus dados</li>
                <li>• <strong>Oposição:</strong> Opor-se ao tratamento de dados</li>
                <li>• <strong>Revogação:</strong> Revogar o consentimento a qualquer momento</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mantemos suas informações apenas pelo tempo necessário para:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Fornecer nossos serviços</li>
                <li>• Cumprir obrigações legais</li>
                <li>• Resolver disputas</li>
                <li>• Fazer cumprir nossos acordos</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Dados de assinatura são mantidos por 5 anos após o cancelamento para fins fiscais.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Transferências Internacionais</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
                Quando transferimos dados internacionalmente, garantimos proteções adequadas através de:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Cláusulas contratuais padrão</li>
                <li>• Certificações de adequação</li>
                <li>• Decisões de adequação</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nossos serviços são direcionados para pessoas maiores de 18 anos. 
                Não coletamos intencionalmente dados de menores de 13 anos.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Se descobrirmos que coletamos dados de uma criança menor de 13 anos, 
                excluiremos essas informações imediatamente.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. 
                Notificaremos sobre alterações significativas através de:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Email para usuários registrados</li>
                <li>• Avisos na plataforma</li>
                <li>• Atualização da data nesta página</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">12. Contato e DPO</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• <strong>Email:</strong> cinexnema@gmail.com</li>
                <li>• <strong>WhatsApp:</strong> (15) 99763-6161</li>
                <li>• <strong>Assunto:</strong> "Privacidade - LGPD"</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Responderemos às solicitações em até 15 dias úteis, conforme estabelecido pela LGPD.
              </p>
            </div>
          </div>

          {/* Links relacionados */}
          <div className="mt-12 p-6 bg-xnema-surface rounded-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Documentos Relacionados</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black" asChild>
                <Link to="/terms-of-service">
                  Termos de Uso
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
