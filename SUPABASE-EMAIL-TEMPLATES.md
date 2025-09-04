# 📧 Configuração de Templates de Email - Supabase

## 🎯 Objetivo
Personalizar os templates de email do Supabase para que os usuários recebam emails funcionais e visualmente atraentes.

## 📍 Onde Configurar
**Painel Supabase → Authentication → Email Templates**

## 1️⃣ Template de Confirmação de Email

### Configurações:
- **Subject**: `Confirme seu email - XNEMA`
- **Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu Email - XNEMA</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f4f4f4; 
      margin: 0; 
      padding: 20px; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .content { 
      padding: 30px 20px; 
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .footer { 
      background: #f8f9fa; 
      padding: 20px; 
      text-align: center; 
      color: #666; 
      font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 XNEMA</h1>
      <p>Streaming Premium Brasileiro</p>
    </div>
    
    <div class="content">
      <h2>Confirme seu Email</h2>
      <p>Olá!</p>
      <p>Obrigado por se cadastrar na XNEMA! Para ativar sua conta e ter acesso ao nosso conteúdo premium, confirme seu email clicando no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">
          ✅ Confirmar Email
        </a>
      </div>
      
      <p><strong>O que você vai encontrar na XNEMA:</strong></p>
      <ul>
        <li>🎭 Série exclusiva "Between Heaven and Hell"</li>
        <li>🎬 Conteúdo original brasileiro</li>
        <li>📱 Streaming em 4K em qualquer dispositivo</li>
        <li>🚫 Sem anúncios ou interrupções</li>
      </ul>
      
      <p>Se você não criou uma conta na XNEMA, pode ignorar este email.</p>
      
      <p style="color: #666; font-size: 12px;">
        Este link expira em 24 horas por segurança.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 XNEMA - Plataforma de Streaming Premium</p>
      <p>Este email foi enviado para {{ .Email }}</p>
    </div>
  </div>
</body>
</html>
```

## 2️⃣ Template de Redefinição de Senha

### Configurações:
- **Subject**: `Redefinir Senha - XNEMA`
- **Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - XNEMA</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f4f4f4; 
      margin: 0; 
      padding: 20px; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .content { 
      padding: 30px 20px; 
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .security-notice { 
      background: #fff3cd; 
      border: 1px solid #ffeaa7; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 20px 0; 
    }
    .footer { 
      background: #f8f9fa; 
      padding: 20px; 
      text-align: center; 
      color: #666; 
      font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 XNEMA</h1>
      <p>Redefinição de Senha</p>
    </div>
    
    <div class="content">
      <h2>Redefinir sua Senha</h2>
      <p>Olá!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta XNEMA. Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">
          🔑 Redefinir Senha
        </a>
      </div>
      
      <div class="security-notice">
        <h4>🛡️ Informações de Segurança:</h4>
        <ul>
          <li>Este link expira em <strong>1 hora</strong></li>
          <li>Use uma senha única que você não usa em outros sites</li>
          <li>Sua nova senha deve ter pelo menos 8 caracteres</li>
          <li>Inclua letras maiúsculas, minúsculas, números e símbolos</li>
        </ul>
      </div>
      
      <p><strong>Se você não solicitou esta redefinição:</strong></p>
      <ul>
        <li>Pode ignorar este email com segurança</li>
        <li>Sua senha atual permanece inalterada</li>
        <li>Considere verificar a segurança da sua conta</li>
      </ul>
      
      <p>Em caso de dúvidas, entre em contato conosco através do email cinexnema@gmail.com</p>
    </div>
    
    <div class="footer">
      <p>© 2024 XNEMA - Plataforma de Streaming Premium</p>
      <p>Este email foi enviado para {{ .Email }}</p>
      <p>Por sua segurança, este link expira em 1 hora</p>
    </div>
  </div>
</body>
</html>
```

## 3️⃣ Template de Convite (se aplicável)

### Configurações:
- **Subject**: `Você foi convidado para XNEMA`
- **Body (HTML)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite XNEMA</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f4f4f4; 
      margin: 0; 
      padding: 20px; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .content { 
      padding: 30px 20px; 
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #ff6b35, #8b5cf6); 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .footer { 
      background: #f8f9fa; 
      padding: 20px; 
      text-align: center; 
      color: #666; 
      font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 XNEMA</h1>
      <p>Você foi convidado!</p>
    </div>
    
    <div class="content">
      <h2>Bem-vindo à XNEMA</h2>
      <p>Olá!</p>
      <p>Você foi convidado para se juntar à XNEMA, a plataforma de streaming premium brasileira. Aceite o convite para ter acesso ao nosso catálogo exclusivo!</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">
          🚀 Aceitar Convite
        </a>
      </div>
      
      <p><strong>O que te espera na XNEMA:</strong></p>
      <ul>
        <li>🎭 Conteúdo original e exclusivo</li>
        <li>📱 Streaming em qualquer dispositivo</li>
        <li>🎬 Qualidade 4K Ultra HD</li>
        <li>👥 Comunidade de criadores brasileiros</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>© 2024 XNEMA - Plataforma de Streaming Premium</p>
      <p>Este convite foi enviado para {{ .Email }}</p>
    </div>
  </div>
</body>
</html>
```

## 🔧 Configurações Importantes

### URLs de Redirecionamento no Código:

1. **Registro de Usuário**:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: senha,
  options: {
    emailRedirectTo: 'https://cinexnema.com/confirmed'
  }
});
```

2. **Reset de Senha**:
```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://cinexnema.com/reset-password'
});
```

### No Painel Supabase:

1. **Authentication → Settings → Site URL**: `https://cinexnema.com`
2. **Authentication → Settings → Redirect URLs**: 
   - `https://cinexnema.com/confirmed`
   - `https://cinexnema.com/reset-password`

## ✅ Resultado Final

Com essas configurações:
- ✅ Emails chegam com conteúdo visual
- ✅ Links funcionam corretamente
- ✅ Redirecionamentos para URLs corretas
- ✅ Templates profissionais e branded
- ✅ Informações de segurança incluídas
- ✅ Experiência do usuário aprimorada

## 🎨 Personalização Adicional

Você pode personalizar ainda mais:
- Cores e gradientes
- Logo da XNEMA
- Textos específicos
- Links adicionais
- Informações de contato

Os templates usam as variáveis padrão do Supabase:
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do destinatário
- `{{ .SiteURL }}` - URL do site configurado
