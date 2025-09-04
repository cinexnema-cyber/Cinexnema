# 🌐 Configuração do Domínio oemalta.shop - Guia Completo

## 📋 Status Atual
- **Domínio**: oemalta.shop
- **Dev Server**: https://8823c34e67354cae9c514d254340cb6d-78f9b6feeb114a6cab838aaa0.fly.dev/
- **Status**: Configuração de DNS necessária

## 🔧 Passos para Configurar o Domínio

### 1. 📊 Verificar Propriedade do Domínio
Primeiro, confirme que você possui o domínio `oemalta.shop`:
```bash
# Verificar informações do domínio
whois oemalta.shop
```

### 2. 🌐 Configurar DNS (Registrador do Domínio)

No painel de controle do seu registrador de domínio (onde você comprou oemalta.shop), configure os seguintes registros DNS:

#### Para Vercel:
```dns
# Tipo A - Apontar para IP do Vercel
A    @    76.76.19.61

# Tipo CNAME - Subdomínio www
CNAME www oemalta.shop

# Ou usar CNAME para domínio principal (se suportado)
CNAME @ cname.vercel-dns.com
```

#### Para Netlify:
```dns
# Tipo CNAME - Domínio principal
CNAME @ eager-euler-4f66b0.netlify.app

# Tipo CNAME - Subdomínio www  
CNAME www eager-euler-4f66b0.netlify.app
```

### 3. 🚀 Configurar no Vercel

#### Via Dashboard:
1. Acesse [vercel.com](https://vercel.com)
2. Vá para o projeto XNEMA
3. Settings → Domains
4. Adicione: `oemalta.shop`
5. Configure: `www.oemalta.shop` (opcional)

#### Via CLI:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Adicionar domínio
vercel domains add oemalta.shop

# Configurar projeto
vercel --prod
vercel alias set [deployment-url] oemalta.shop
```

### 4. 🌐 Configurar no Netlify

#### Via Dashboard:
1. Acesse [netlify.com](https://netlify.com)
2. Vá para o site do projeto
3. Site Settings → Domain Management
4. Add Custom Domain: `oemalta.shop`
5. Configure DNS conforme instruções

#### Via CLI:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Adicionar domínio
netlify sites:update --name oemalta-shop
netlify domains:create oemalta.shop
```

### 5. 📋 Verificar Configuração SSL

#### Verificar SSL:
```bash
# Testar SSL
curl -I https://oemalta.shop

# Verificar certificado
openssl s_client -connect oemalta.shop:443 -servername oemalta.shop
```

#### Forçar HTTPS:
- **Vercel**: Habilitado automaticamente
- **Netlify**: Settings → HTTPS → Force HTTPS redirect

## 🔍 Diagnóstico de Problemas

### 1. Verificar Propagação DNS
```bash
# Verificar DNS globalmente
dig oemalta.shop
nslookup oemalta.shop

# Verificar propagação mundial
# Use: https://www.whatsmydns.net/#A/oemalta.shop
```

### 2. Testar Conectividade
```bash
# Ping do domínio
ping oemalta.shop

# Trace route
traceroute oemalta.shop

# Verificar porta 80 e 443
telnet oemalta.shop 80
telnet oemalta.shop 443
```

### 3. Verificar Headers HTTP
```bash
# Verificar redirecionamentos
curl -IL http://oemalta.shop
curl -IL https://oemalta.shop
```

## ⏱️ Tempo de Propagação

- **DNS**: 4-24 horas (pode levar até 48h)
- **SSL**: 5-10 minutos após DNS resolver
- **Vercel**: Configuração instantânea após DNS
- **Netlify**: 5-10 minutos após configuração

## 🚨 Problemas Comuns e Soluções

### Problema 1: "This site can't be reached"
**Solução**:
```bash
# Verificar DNS
dig oemalta.shop

# Se não resolver, aguardar propagação ou verificar configuração
```

### Problema 2: "Not Secure" ou erro SSL
**Solução**:
- Aguardar emissão do certificado (5-10 min)
- Verificar se HTTPS está habilitado no provedor
- Limpar cache do navegador

### Problema 3: Página 404 ou erro de servidor
**Solução**:
- Verificar se o deploy foi feito corretamente
- Verificar configuração de domínio no provedor
- Verificar logs do servidor

### Problema 4: Redirecionamento incorreto
**Solução**:
```bash
# Verificar arquivo .htaccess ou configuração de redirecionamento
# Limpar cache do navegador
# Verificar configuração no provedor de hospedagem
```

## 📞 Contatos de Suporte

### Vercel:
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs/concepts/projects/domains
- Support: support@vercel.com

### Netlify:
- Dashboard: https://app.netlify.com/
- Docs: https://docs.netlify.com/domains-https/
- Support: https://www.netlify.com/support/

## 🎯 Configuração Rápida (Recomendada)

### Para Vercel (Mais Fácil):
```bash
# 1. Deploy no Vercel
npm run build
vercel --prod

# 2. Adicionar domínio
vercel domains add oemalta.shop

# 3. Configurar DNS no registrador:
# A @ 76.76.19.61
# CNAME www oemalta.shop
```

### Para Netlify:
```bash
# 1. Deploy no Netlify
npm run build
netlify deploy --prod --dir=dist/spa

# 2. Configurar domínio
netlify domains:create oemalta.shop

# 3. Seguir instruções DNS fornecidas
```

## ✅ Checklist Final

- [ ] Domínio registrado e ativo
- [ ] DNS configurado corretamente
- [ ] Deploy realizado no provedor
- [ ] Domínio adicionado no dashboard
- [ ] SSL configurado e ativo
- [ ] Redirects HTTPS funcionando
- [ ] Teste de acesso pelo domínio
- [ ] Cache do navegador limpo

## 🕐 Status de Propaga��ão

Para verificar se o DNS já propagou:
1. Acesse: https://www.whatsmydns.net/#A/oemalta.shop
2. Verifique se todos os servidores mostram o IP correto
3. Se ainda não propagou, aguarde mais algumas horas

---

## 🆘 Se Ainda Não Funcionar

### Opção 1: Usar Subdomínio Temporário
Enquanto o DNS propaga, você pode usar:
- Vercel: `[projeto].vercel.app`
- Netlify: `[projeto].netlify.app`

### Opção 2: Verificar Configuração
```bash
# Executar diagnóstico completo
npm run deploy:diagnose
```

### Opção 3: Contato de Emergência
Se nada funcionar:
1. Verificar se o domínio está realmente registrado
2. Contatar suporte do registrador de domínio
3. Verificar se há bloqueios ou restrições
4. Considerar usar outro domínio temporariamente

**📧 Para suporte técnico: cinexnema@gmail.com**
**📱 WhatsApp: (15) 99763-6161**
