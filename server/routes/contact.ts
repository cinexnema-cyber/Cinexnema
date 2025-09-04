import express from 'express';
// Note: Using client-side supabase for now - in production, use server-side client
// For server-side operations, we would create a separate supabase server config

const router = express.Router();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

// Rota para enviar mensagem de contato
router.post('/send-message', async (req, res) => {
  try {
    const { name, email, subject, message, phone, company }: ContactFormData = req.body;

    // Validação dos campos obrigatórios
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Log da mensagem recebida
    console.log('📧 Nova mensagem de contato recebida:', {
      name,
      email,
      subject,
      timestamp: new Date().toISOString()
    });

    // Em uma implementação real, aqui salvaria no banco de dados
    const savedMessage = {
      id: Date.now().toString(),
      name,
      email,
      subject,
      message,
      phone,
      company,
      created_at: new Date().toISOString()
    };

    // Preparar conteúdo do email
    const emailContent = {
      to: 'cinexnema@gmail.com',
      subject: `[XNEMA Contact] ${subject}`,
      html: generateEmailHTML({
        name,
        email,
        subject,
        message,
        phone,
        company,
        messageId: savedMessage?.id || 'N/A'
      })
    };

    // Simular envio de email (em produção, integrar com serviço de email)
    try {
      await sendEmailFallback(emailContent);
      console.log('📤 Email de contato processado com sucesso');
    } catch (fallbackError) {
      console.error('Erro no envio de email:', fallbackError);
      // Continuar mesmo se não conseguir enviar email
      console.log('📝 Mensagem salva nos logs para processamento manual');
    }

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Nossa equipe retornará o mais breve possível.',
      messageId: savedMessage?.id
    });

  } catch (error) {
    console.error('Erro inesperado ao processar contato:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para listar mensagens (placeholder - implementar com banco de dados)
router.get('/messages', async (req, res) => {
  try {
    // Verificar se é admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('cinexnema@gmail.com')) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Placeholder - em produção, buscar do banco de dados
    const messages = [
      {
        id: '1',
        name: 'Usuário Exemplo',
        email: 'exemplo@email.com',
        subject: 'Teste de Contato',
        message: 'Esta é uma mensagem de exemplo',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Função para gerar HTML do email
function generateEmailHTML(data: ContactFormData & { messageId: string }) {
  const currentDate = new Date().toLocaleString('pt-BR');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Mensagem de Contato - XNEMA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b35, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
        .value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #ff6b35; }
        .message-box { background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #8b5cf6; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .priority { background: #ffe6e6; border-color: #ff4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 XNEMA - Nova Mensagem de Contato</h1>
          <p>Mensagem recebida em ${currentDate}</p>
        </div>
        
        <div class="content">
          <div class="field">
            <span class="label">📝 ID da Mensagem:</span>
            <div class="value">${data.messageId}</div>
          </div>
          
          <div class="field">
            <span class="label">👤 Nome:</span>
            <div class="value">${data.name}</div>
          </div>
          
          <div class="field">
            <span class="label">📧 Email:</span>
            <div class="value">${data.email}</div>
          </div>
          
          ${data.phone ? `
          <div class="field">
            <span class="label">📱 Telefone:</span>
            <div class="value">${data.phone}</div>
          </div>
          ` : ''}
          
          ${data.company ? `
          <div class="field">
            <span class="label">🏢 Empresa:</span>
            <div class="value">${data.company}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="label">📋 Assunto:</span>
            <div class="value priority">${data.subject}</div>
          </div>
          
          <div class="message-box">
            <span class="label">💬 Mensagem:</span>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e6f7ff; border-radius: 4px;">
            <strong>📊 Ações Recomendadas:</strong>
            <ul>
              <li>Responder em até 24 horas</li>
              <li>Verificar se é lead qualificado</li>
              <li>Agendar follow-up se necessário</li>
              <li>Atualizar CRM com o contato</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Este email foi gerado automaticamente pelo sistema XNEMA</p>
          <p>© 2024 XNEMA - Plataforma de Streaming Premium</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Função de fallback para envio de email
async function sendEmailFallback(emailContent: any) {
  // Log detalhado da mensagem para processamento manual
  console.log('📧 ======= NOVA MENSAGEM DE CONTATO =======');
  console.log('📬 Para:', emailContent.to);
  console.log('📋 Assunto:', emailContent.subject);
  console.log('📄 Conteúdo HTML salvo nos logs');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔍 HTML Content Preview:', emailContent.html.substring(0, 200) + '...');
  console.log('📧 ====================================');

  // Em produção, aqui seria integrado com:
  // - Resend, SendGrid, Mailgun, etc.
  // - Webhook para Zapier/Make
  // - Sistema de notificação interno

  return true;
}

export default router;
