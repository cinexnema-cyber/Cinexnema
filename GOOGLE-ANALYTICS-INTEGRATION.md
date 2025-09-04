# Integração Google Analytics - Portal do Criador

## 📊 Visão Geral

O Portal do Criador XNEMA agora está integrado com o Google Analytics (GA4) para fornecer dados reais e precisos sobre performance de conteúdo, visualizações, receita e engajamento dos criadores.

## 🔧 Configuração Técnica

### Google Analytics ID
- **ID do GA4**: `G-FMZQ1MHE5G`
- **Localização**: Integrado no `index.html` da aplicação
- **Escopo**: Tracking em toda a plataforma XNEMA

### Script de Integração
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FMZQ1MHE5G"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FMZQ1MHE5G');
</script>
```

## 📈 Dados Rastreados

### Métricas de Criador
- **Visualizações Totais**: Contagem real de views dos vídeos do criador
- **Assinantes**: Número de usuários que seguem o criador
- **Receita**: Cálculo baseado em visualizações e monetização
- **Vídeos Ativos**: Quantidade de conteúdo publicado
- **Taxa de Conversão**: Porcentagem de visualizadores que se tornam assinantes
- **Crescimento Mensal**: Comparação com período anterior

### Eventos Customizados
1. **Video View**: Quando um usuário assiste a um vídeo
2. **Creator Interaction**: Interações com conteúdo do criador
3. **Page View**: Visitas ao portal do criador

## 🛠️ Implementação

### Hook `useGoogleAnalytics`
Localização: `client/hooks/useGoogleAnalytics.tsx`

Funcionalidades:
- Busca dados em tempo real do Google Analytics
- Tracking automático de eventos
- Estados de carregamento e erro
- Refresh manual dos dados

### API Backend
Localização: `server/routes/analytics-creator.ts`

Endpoints:
- `POST /api/analytics/creator-data`: Dados gerais do criador
- `POST /api/analytics/video-data`: Analytics específicos de vídeo

### Componente Portal
Localização: `client/pages/CreatorPortal.tsx`

Características:
- Dados reais substituindo mock data
- Botão de atualização manual
- Estados de carregamento visuais
- Notificação sobre integração ativa

## 📊 Dashboards e Visualizações

### Gráficos Atualizados
1. **Evolução da Receita**: LineChart com dados mensais reais
2. **Visualizações por Categoria**: PieChart com distribuição real
3. **Métricas de Performance**: Cards com dados dinâmicos

### Indicadores em Tempo Real
- Receita total atualizada
- Contadores de visualizações precisos
- Status de vídeos baseado em dados reais
- Crescimento percentual calculado

## 🔄 Atualização de Dados

### Automática
- Dados carregados na inicialização do componente
- Refresh automático baseado em atividade do usuário

### Manual
- Botão "Atualizar Dados" no header do portal
- Indicador visual de carregamento durante refresh
- Feedback visual com ícone animado

## 🎯 Benefícios para Criadores

### Transparência Total
- Visualizações reais, não estimadas
- Receita calculada com base em dados precisos
- Histórico completo de performance

### Tomada de Decisão
- Dados confiáveis para estratégias de conteúdo
- Insights sobre audiência e engajamento
- Métricas de conversão para otimização

### Monetização Eficiente
- Tracking preciso de receita por v��deo
- Análise de ROI de conteúdo
- Identificação de conteúdo mais rentável

## 🔐 Privacidade e Conformidade

### Dados Coletados
- Apenas métricas de performance pública
- Não coleta informações pessoais sensíveis
- Agregação de dados para proteção de privacidade

### LGPD Compliance
- Coleta transparente de dados
- Finalidade específica (analytics de criador)
- Possibilidade de opt-out via configurações

## 🐛 Troubleshooting

### Dados Não Carregando
1. Verificar conexão com internet
2. Confirmar token de autenticação válido
3. Tentar refresh manual dos dados

### Métricas Inconsistentes
1. Aguardar processamento do GA4 (até 24h)
2. Verificar filtros de data no dashboard
3. Confirmar configuração do tracking

### Performance Lenta
1. Otimização de queries para GA4
2. Cache de dados frequentemente acessados
3. Paginação de resultados grandes

## 📞 Suporte

Para questões relacionadas ao Google Analytics:
- **Email**: analytics@xnema.com
- **WhatsApp**: (15) 99763-6161
- **Documentação GA4**: https://developers.google.com/analytics/devguides/reporting/data/v1

---

**Última atualização**: Dezembro 2024  
**Versão da Integração**: 1.0  
**Status**: Ativo e Funcionando ✅
