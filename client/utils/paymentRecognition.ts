// Sistema inteligente de reconhecimento de pagamento XNEMA

interface PaymentData {
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  email?: string;
  timestamp: number;
}

interface UserSubscription {
  email: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  nextBilling: string;
  paymentMethod: string;
}

class PaymentRecognitionSystem {
  private static instance: PaymentRecognitionSystem;
  private subscriptions: Map<string, UserSubscription> = new Map();
  private pendingPayments: Map<string, PaymentData> = new Map();

  static getInstance(): PaymentRecognitionSystem {
    if (!PaymentRecognitionSystem.instance) {
      PaymentRecognitionSystem.instance = new PaymentRecognitionSystem();
    }
    return PaymentRecognitionSystem.instance;
  }

  // Simula verificação automática de pagamento via webhook do Mercado Pago
  async checkPaymentStatus(transactionId: string): Promise<PaymentData | null> {
    // Em produção, isso seria uma chamada para a API do Mercado Pago
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula resposta do Mercado Pago
        const mockPayment: PaymentData = {
          transactionId,
          amount: 19.90,
          currency: 'BRL',
          status: Math.random() > 0.3 ? 'approved' : 'pending',
          email: 'user@example.com',
          timestamp: Date.now()
        };
        resolve(mockPayment);
      }, 2000);
    });
  }

  // Processa pagamento automático e ativa assinatura
  async processPayment(paymentData: PaymentData): Promise<boolean> {
    try {
      if (paymentData.status === 'approved' && paymentData.email) {
        const subscription: UserSubscription = {
          email: paymentData.email,
          plan: 'premium',
          status: 'active',
          startDate: new Date().toISOString(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          paymentMethod: 'mercado_pago'
        };

        this.subscriptions.set(paymentData.email, subscription);
        
        // Remove do pending
        this.pendingPayments.delete(paymentData.transactionId);
        
        // Notifica usuário
        this.notifyUser(paymentData.email, 'payment_approved');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return false;
    }
  }

  // Verifica se usuário tem assinatura ativa
  isSubscriptionActive(email: string): boolean {
    const subscription = this.subscriptions.get(email);
    if (!subscription) return false;
    
    const now = new Date();
    const nextBilling = new Date(subscription.nextBilling);
    
    return subscription.status === 'active' && nextBilling > now;
  }

  // Auto-login após pagamento confirmado
  async autoLoginAfterPayment(transactionId: string): Promise<{ success: boolean; redirectUrl?: string; userEmail?: string }> {
    const payment = await this.checkPaymentStatus(transactionId);
    
    if (payment && payment.status === 'approved') {
      const processed = await this.processPayment(payment);
      
      if (processed && payment.email) {
        // Gera token temporário para auto-login
        const loginToken = this.generateLoginToken(payment.email);
        
        return {
          success: true,
          redirectUrl: `https://oemalta.shop/smart-dashboard?token=${loginToken}`,
          userEmail: payment.email
        };
      }
    }
    
    return { success: false };
  }

  // Gera token temporário para auto-login
  private generateLoginToken(email: string): string {
    // Em produção, usar JWT com expiração
    const payload = {
      email,
      timestamp: Date.now(),
      type: 'auto_login'
    };
    
    return btoa(JSON.stringify(payload));
  }

  // Valida token de auto-login
  validateLoginToken(token: string): { valid: boolean; email?: string } {
    try {
      const payload = JSON.parse(atob(token));
      const now = Date.now();
      const tokenAge = now - payload.timestamp;
      
      // Token válido por 1 hora
      if (tokenAge < 60 * 60 * 1000 && payload.type === 'auto_login') {
        return { valid: true, email: payload.email };
      }
      
      return { valid: false };
    } catch {
      return { valid: false };
    }
  }

  // Notifica usuário sobre mudanças na assinatura
  private notifyUser(email: string, type: 'payment_approved' | 'payment_pending' | 'subscription_expired'): void {
    // Em produção, enviar email/push notification
    const notifications = {
      payment_approved: 'Pagamento aprovado! Sua assinatura XNEMA está ativa.',
      payment_pending: 'Pagamento em processamento. Você será notificado quando aprovado.',
      subscription_expired: 'Sua assinatura XNEMA expirou. Renove para continuar assistindo.'
    };
    
    console.log(`Notificação para ${email}: ${notifications[type]}`);
    
    // Simula envio de notificação push
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('XNEMA', {
        body: notifications[type],
        icon: '/favicon.ico'
      });
    }
  }

  // Webhook simulation para receber notificações do Mercado Pago
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      // Em produção, validar assinatura do webhook
      const payment: PaymentData = {
        transactionId: webhookData.id,
        amount: webhookData.transaction_amount,
        currency: webhookData.currency_id,
        status: webhookData.status === 'approved' ? 'approved' : 'pending',
        email: webhookData.payer?.email,
        timestamp: Date.now()
      };

      if (payment.status === 'approved') {
        await this.processPayment(payment);
      } else {
        this.pendingPayments.set(payment.transactionId, payment);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
    }
  }

  // Monitoramento automático de pagamentos pendentes
  startPaymentMonitoring(): void {
    setInterval(async () => {
      for (const [transactionId, payment] of this.pendingPayments.entries()) {
        const updated = await this.checkPaymentStatus(transactionId);
        
        if (updated && updated.status === 'approved') {
          await this.processPayment(updated);
        }
      }
    }, 30000); // Verifica a cada 30 segundos
  }

  // Obtém dados da assinatura
  getSubscription(email: string): UserSubscription | null {
    return this.subscriptions.get(email) || null;
  }

  // Simula dados iniciais para demonstração
  initializeMockData(): void {
    // Usuário de exemplo já assinante
    this.subscriptions.set('joao.silva@email.com', {
      email: 'joao.silva@email.com',
      plan: 'premium',
      status: 'active',
      startDate: '2024-12-15T00:00:00Z',
      nextBilling: '2025-01-15T00:00:00Z',
      paymentMethod: 'mercado_pago'
    });
  }
}

// Funções utilitárias exportadas
export const paymentRecognition = PaymentRecognitionSystem.getInstance();

export const initializePaymentSystem = () => {
  paymentRecognition.initializeMockData();
  paymentRecognition.startPaymentMonitoring();
};

export const handleMercadoPagoCallback = async (urlParams: URLSearchParams) => {
  const transactionId = urlParams.get('payment_id');
  const status = urlParams.get('status');
  
  if (transactionId && status === 'approved') {
    return await paymentRecognition.autoLoginAfterPayment(transactionId);
  }
  
  return { success: false };
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Tipos exportados
export type { PaymentData, UserSubscription };
