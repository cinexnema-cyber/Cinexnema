# 🧪 Teste do Fluxo de Emails - XNEMA

## 📋 Checklist de Configuração

### 1️⃣ Configurações no Supabase (OBRIGATÓRIO)
- [ ] **Site URL**: `https://cinexnema.com`
- [ ] **Redirect URLs**: 
  - [ ] `https://cinexnema.com/confirmed`
  - [ ] `https://cinexnema.com/reset-password`
- [ ] **Templates de email** personalizados aplicados
- [ ] **SMTP** configurado (ou usando padrão do Supabase)

### 2️⃣ Rotas Implementadas
- [ ] `/confirmed` - Confirmação de email
- [ ] `/reset-password` - Redefinição de senha
- [ ] `/forgot-password` - Solicitar reset

## 🔄 Fluxo de Teste - Confirmação de Email

### Passo 1: Registro
1. Ir para: `https://cinexnema.com/register`
2. Preencher formulário com email real
3. Clicar em "Criar Conta"
4. **Verificar**: Console deve mostrar tentativa de criação

### Passo 2: Email de Confirmação
1. **Verificar**: Email chegou na caixa de entrada
2. **Verificar**: Email tem conteúdo visual (não está vazio)
3. **Verificar**: Botão "Confirmar Email" está presente
4. **Verificar**: Link aponta para `cinexnema.com/confirmed?access_token=...`

### Passo 3: Confirmação
1. Clicar no link do email
2. **Verificar**: Redirecionamento para `/confirmed`
3. **Verificar**: Página mostra "Email Confirmado!"
4. **Verificar**: Redirecionamento automático para `/login`

### Resultado Esperado:
✅ Usuário consegue fazer login com email/senha

## 🔄 Fluxo de Teste - Reset de Senha

### Passo 1: Solicitar Reset
1. Ir para: `https://cinexnema.com/forgot-password`
2. Inserir email existente
3. Clicar em "Enviar Link"
4. **Verificar**: Mensagem de sucesso

### Passo 2: Email de Reset
1. **Verificar**: Email chegou na caixa de entrada
2. **Verificar**: Email tem conteúdo visual
3. **Verificar**: Botão "Redefinir Senha" está presente
4. **Verificar**: Link aponta para `cinexnema.com/reset-password?access_token=...`

### Passo 3: Redefinir Senha
1. Clicar no link do email
2. **Verificar**: Página `/reset-password` carrega
3. **Verificar**: Email do usuário é mostrado
4. **Verificar**: Formulário de nova senha aparece
5. Preencher nova senha (atender critérios)
6. Clicar em "Redefinir Senha"
7. **Verificar**: Mensagem de sucesso
8. **Verificar**: Login automático OU redirecionamento para login

### Resultado Esperado:
✅ Usuário consegue fazer login com nova senha

## 🐛 Problemas Comuns e Soluções

### Email Vazio/Não Chega
**Causa**: Templates não configurados ou URL inválida
**Solução**: 
1. Verificar templates no painel Supabase
2. Verificar URLs de redirecionamento
3. Verificar configuração SMTP

### Link Não Funciona
**Causa**: URL de redirecionamento incorreta
**Solução**:
1. Verificar `redirectTo` no código
2. Verificar Redirect URLs no painel
3. Verificar se rotas existem no frontend

### Token Inválido
**Causa**: Link expirado ou já usado
**Solução**:
1. Gerar novo link
2. Verificar expiração (24h confirmação, 1h reset)
3. Verificar logs do Supabase

### Página de Reset Não Carrega
**Causa**: Parâmetros da URL incorretos
**Solução**:
1. Verificar se `access_token` e `refresh_token` estão na URL
2. Verificar logs do console
3. Verificar rota no App.tsx

## 📊 Logs de Debug

### Console do Navegador:
```javascript
// Confirmação de email
🔍 Parâmetros recebidos: { accessToken: true, refreshToken: true, type: "signup" }
📧 Processando confirmação de email...
✅ Email confirmado com sucesso!

// Reset de senha
🔍 Parâmetros da URL: { accessToken: true, refreshToken: true, type: "recovery" }
✅ Sessão definida com sucesso!
👤 Usuário identificado: user@email.com
```

### Console do Servidor (se aplicável):
```javascript
🔑 Requesting password reset for: user@email.com
✅ Password reset email sent successfully
```

## ✅ Critérios de Sucesso

### Confirmação de Email:
- [ ] Email recebido com template personalizado
- [ ] Link funciona e redireciona corretamente
- [ ] Página `/confirmed` mostra sucesso
- [ ] Login funciona após confirmação

### Reset de Senha:
- [ ] Email recebido com template personalizado
- [ ] Link funciona e redireciona corretamente
- [ ] Página `/reset-password` reconhece usuário
- [ ] Nova senha é aceita
- [ ] Login funciona com nova senha

## 🚨 Teste de Emergência

Se algo não funcionar:

1. **Verificar URLs no Supabase**:
   - Site URL: `https://cinexnema.com`
   - Redirect URLs incluem as páginas corretas

2. **Verificar Templates**:
   - Templates têm `{{ .ConfirmationURL }}`
   - Templates têm conteúdo HTML

3. **Verificar Código**:
   - `emailRedirectTo` e `redirectTo` estão corretos
   - Rotas existem no frontend
   - Componentes estão importados

4. **Logs**:
   - Console do navegador
   - Network tab para requisições
   - Painel do Supabase para logs

## 🎯 Próximos Passos

Após testes bem-sucedidos:
1. [ ] Testar com diferentes emails
2. [ ] Testar expiração de links
3. [ ] Testar em diferentes navegadores
4. [ ] Configurar monitoramento de emails
5. [ ] Implementar analytics de confirmação

Com essas configurações, o sistema de emails estará 100% funcional! 🚀
