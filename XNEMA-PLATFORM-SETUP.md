# XNEMA - Plataforma de Streaming Premium

## 🎬 Sobre a Plataforma

XNEMA é uma plataforma de streaming brasileira completa com:

- **Streaming Premium**: Assinatura R$ 19,90/mês (1º mês grátis)
- **Série Exclusiva**: "Between Heaven and Hell" (7 temporadas, 84 episódios)  
- **Portal do Criador**: Sistema completo de upload e monetização
- **Mini Bank**: Gestão financeira integrada para criadores
- **Pagamento Automático**: Integração com Mercado Pago

## 🚀 Setup Rápido (VS Code)

### Pré-requisitos
- Node.js 18+ 
- VS Code
- Git

### Instalação em 3 Passos

```bash
# 1. Clone o repositório
git clone <repository-url>
cd xnema-platform

# 2. Instale dependências
npm install

# 3. Execute o projeto
npm run dev
```

A plataforma estará rodando em `http://localhost:8080`

## 🌐 Deploy Production

### Vercel (Recomendado)

1. **Configure o projeto no Vercel:**
```bash
npm install -g vercel
vercel
```

2. **Variáveis de ambiente:**
```env
NODE_ENV=production
VITE_API_URL=https://oemalta.shop
VITE_SITE_URL=https://oemalta.shop
```

3. **Deploy automático:**
```bash
vercel --prod
```

### Netlify (Alternativa)

1. **Build estático:**
```bash
npm run build
```

2. **Configure no Netlify:**
- Build command: `npm run build`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`

## 📱 Funcionalidades Implementadas

### 🏠 Frontend (Cliente)
- ✅ Homepage com hero cinematográfico
- ✅ Catálogo com filtros e categorias
- ✅ Página da série "Between Heaven and Hell"
- ✅ Sistema de assinatura com Mercado Pago
- ✅ Dashboard do assinante
- ✅ Portal do criador completo
- ✅ Sistema de pagamentos para criadores
- ✅ Design responsivo (mobile/tablet/desktop)

### 🎨 Design & UX
- ✅ Tema escuro com gradientes laranja/roxo
- ✅ Componentes UI customizados (Shadcn/ui)
- ✅ Animações e transições suaves
- ✅ Tipografia moderna e hierarquia visual

### 💰 Monetização
- ✅ Assinatura Premium: R$ 19,90/mês
- ✅ Primeiro mês grátis para novos usuários
- ✅ Link de pagamento Mercado Pago: https://mpago.la/1p9Jkyy
- ✅ Sistema de receita para criadores (70/30)
- ✅ Promoção: 3 meses grátis para criadores

### 👥 Criadores
- ✅ Portal exclusivo com login separado
- ✅ Upload de vídeos para série
- ✅ Dashboard de analytics e receitas
- ✅ Mini bank para gestão financeira
- ✅ Configuração de dados bancários
- ✅ Histórico de pagamentos

## 🗂️ Estrutura do Projeto

```
xnema-platform/
├── client/                     # Frontend React
│   ├── components/
│   │   ├── ui/                 # Componentes base (Shadcn)
│   │   └── layout/             # Header, Footer, Layout
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Index.tsx           # Homepage
│   │   ├── Catalog.tsx         # Catálogo principal
│   │   ├��─ BetweenHeavenHell.tsx # Página da série
│   │   ├── Pricing.tsx         # Planos e assinatura
│   │   ├── Creators.tsx        # Landing para criadores
│   │   ├── CreatorLogin.tsx    # Login de criadores
│   │   ├── CreatorPortal.tsx   # Portal interno
│   │   ├── CreatorPayments.tsx # Sistema de pagamentos
│   │   ├── Dashboard.tsx       # Dashboard assinante
│   │   ├── Series.tsx          # Outras séries
│   │   ├── Categories.tsx      # Categorias
│   │   └── Category.tsx        # Categoria individual
│   ├── App.tsx                 # Configuração de rotas
│   └── global.css              # Estilos globais
├── server/                     # Backend Express
│   ├── routes/                 # API endpoints
│   └── index.ts                # Servidor principal
├── shared/                     # Types compartilhados
├── netlify/functions/          # Serverless functions
└── package.json                # Dependências
```

## 🎯 Rotas Principais

### Públicas
- `/` - Homepage com hero e destaques
- `/catalog` - Catálogo completo (renomeado de "Início")
- `/between-heaven-hell` - Página da série exclusiva
- `/series` - Outras séries disponíveis
- `/categories` - Todas as categorias
- `/category/:id` - Categoria específica
- `/pricing` - Planos e assinatura
- `/creators` - Landing para criadores

### Assinantes
- `/login` - Login de assinantes
- `/subscribe` - Processo de assinatura
- `/dashboard` - Área do assinante

### Criadores
- `/creator-login` - Login específico para criadores
- `/creator-portal` - Portal de upload e gestão
- `/creator-payments` - Sistema financeiro

## 🔗 Integrações

### Mercado Pago
- **Link de pagamento**: https://mpago.la/1p9Jkyy
- **Email cobrança**: cinexnema@gmail.com
- **Valor**: R$ 19,90/mês (1º mês grátis)

### Between Heaven and Hell
- **Trailer YouTube**: https://youtu.be/-KmVyIbsV0Y
- **Instagram**: https://www.instagram.com/betweenheavenandhell2025/
- **7 temporadas, 12 episódios cada**

### Contato Criadores
- **WhatsApp**: (15) 99763-6161
- **Email**: cinexnema@gmail.com

## 🛠️ Tecnologias

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **React Router 6** (SPA routing)
- **TailwindCSS 3** (styling)
- **Shadcn/ui** (componentes)
- **Lucide React** (ícones)
- **Framer Motion** (animações)

### Backend
- **Express.js** + TypeScript
- **Vite** (hot reload)
- **Zod** (validação)

### Deploy
- **Vercel** (recomendado)
- **Netlify** (alternativa)
- **GitHub** (versionamento)

## 🎨 Brand & Design

### Cores Principais
- **Laranja XNEMA**: `#FF6B35` (HSL: 14 100% 57%)
- **Roxo XNEMA**: `#9D4EDD` (HSL: 280 100% 70%)
- **Fundo Escuro**: `#1A1B23` (HSL: 221 22% 8%)

### Tipografia
- **Heading**: Font-bold, gradientes coloridos
- **Body**: Text-muted-foreground
- **CTA**: Font-semibold em botões

### Componentes
- **Botões**: Gradientes, hover effects
- **Cards**: Background transparente, bordas sutis
- **Inputs**: Dark theme, focus rings laranja

## 📊 Analytics & Métricas

### Criadores
- Views por vídeo
- Receita por período
- Performance por episódio
- Dados demográficos

### Plataforma
- Assinantes ativos
- Taxa de conversão
- Retenção mensal
- Revenue per user

## 🔐 Segurança

### Autenticação
- Login separado para criadores e assinantes
- Sessões seguras
- Proteção CSRF

### Pagamentos
- Integração segura Mercado Pago
- Dados bancários criptografados
- Compliance PCI DSS

### Conteúdo
- DRM para vídeos premium
- Tokens de acesso temporários
- Anti-piracy measures

## 🚀 Próximos Passos

### Fase 1 - MVP (Atual)
- ✅ Interface completa
- ✅ Sistema de assinatura
- ✅ Portal do criador
- ✅ Between Heaven and Hell

### Fase 2 - Crescimento
- [ ] Player de vídeo integrado
- [ ] Sistema de comentários
- [ ] Recomendações IA
- [ ] App mobile (React Native)

### Fase 3 - Escala
- [ ] CDN para vídeos
- [ ] Múltiplas séries exclusivas
- [ ] Programa de afiliados
- [ ] Internacional

## 📞 Suporte

Para dúvidas técnicas:
- **Email**: cinexnema@gmail.com
- **WhatsApp**: (15) 99763-6161

---

**XNEMA** - A nova era do streaming brasileiro 🎬✨
