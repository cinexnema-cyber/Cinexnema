import WebhookLog from "../models/WebhookLog";
import User from "../models/User";
import Subscription from "../models/Subscription";

/**
 * Serviço para retry de webhooks falhados
 */
export class WebhookRetryService {
  /**
   * Processar webhook de pagamento com retry
   */
  static async processPaymentWebhook(
    webhookData: any,
  ): Promise<{ success: boolean; error?: string }> {
    const webhookId = `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Criar log do webhook
      const webhookLog = new WebhookLog({
        webhook_id: webhookId,
        webhook_type: "mercado_pago",
        payload: webhookData,
        status: "received",
        transaction_id: webhookData.external_reference,
      });
      await webhookLog.save();

      // Processar o webhook
      const result = await this.executePaymentProcessing(
        webhookData,
        webhookLog,
      );

      if (result.success) {
        webhookLog.status = "processed";
        webhookLog.processed_at = new Date();
        await webhookLog.save();

        console.log(`✅ Webhook processado com sucesso: ${webhookId}`);
        return { success: true };
      } else {
        // Configurar retry se falhou
        await this.scheduleRetry(
          webhookLog,
          result.error || "Erro desconhecido",
        );
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error(`❌ Erro crítico no webhook ${webhookId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Executar o processamento do pagamento
   */
  private static async executePaymentProcessing(
    webhookData: any,
    webhookLog: any,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { action, data, external_reference } = webhookData;

      if (!external_reference) {
        return { success: false, error: "External reference não encontrado" };
      }

      // Buscar assinatura
      const subscription = await Subscription.findOne({
        transaction_id: external_reference,
      }).populate("id_usuario");

      if (!subscription) {
        return {
          success: false,
          error: `Assinatura não encontrada: ${external_reference}`,
        };
      }

      // Simular consulta ao Mercado Pago (em produção, fazer chamada real à API)
      const paymentStatus = this.simulatePaymentStatus(webhookData);

      // Atualizar webhook log com user_id
      webhookLog.user_id = subscription.id_usuario?._id?.toString();
      await webhookLog.save();

      if (paymentStatus === "approved") {
        return await this.approveSubscription(subscription);
      } else if (paymentStatus === "rejected") {
        return await this.rejectSubscription(subscription);
      } else if (paymentStatus === "pending") {
        return await this.pendingSubscription(subscription);
      }

      return { success: false, error: `Status desconhecido: ${paymentStatus}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Aprovar assinatura e ativar premium
   */
  private static async approveSubscription(
    subscription: any,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Atualizar assinatura
      subscription.status_pagamento = "aprovado";
      subscription.ativo = true;
      subscription.data_pagamento = new Date();
      await subscription.save();

      // CRÍTICO: Só ativar premium após confirmação do pagamento
      const user = subscription.id_usuario;
      if (user) {
        user.role = "premium";
        user.isPremium = true;
        user.subscriptionStatus = "active";
        user.subscriptionStart = subscription.data_inicio_periodo;
        user.subscriptionEnd = subscription.data_fim_periodo;
        user.assinante = true;
        await user.save();

        console.log(
          `🎉 PREMIUM ATIVADO: ${user.email} - Plano: ${subscription.plano}`,
        );
        console.log(
          `📊 Status Final: role=${user.role}, isPremium=${user.isPremium}`,
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Rejeitar pagamento
   */
  private static async rejectSubscription(
    subscription: any,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      subscription.status_pagamento = "rejeitado";
      subscription.ativo = false;
      await subscription.save();

      const user = subscription.id_usuario;
      if (user) {
        user.role = "subscriber";
        user.isPremium = false;
        user.subscriptionStatus = "failed";
        user.assinante = false;
        await user.save();

        console.log(`❌ PAGAMENTO REJEITADO: ${user.email}`);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Manter pagamento como pendente
   */
  private static async pendingSubscription(
    subscription: any,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = subscription.id_usuario;
      if (user) {
        user.role = "subscriber";
        user.isPremium = false;
        user.subscriptionStatus = "pending";
        user.assinante = false;
        await user.save();

        console.log(`⏳ PAGAMENTO PENDENTE: ${user.email}`);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Agendar retry para webhook falhado
   */
  private static async scheduleRetry(
    webhookLog: any,
    errorMessage: string,
  ): Promise<void> {
    webhookLog.status = "retry";
    webhookLog.error_message = errorMessage;
    webhookLog.retry_count += 1;

    // Calcular próximo retry (exponential backoff: 1min, 5min, 15min)
    const delays = [1, 5, 15]; // minutos
    const delayMinutes =
      delays[Math.min(webhookLog.retry_count - 1, delays.length - 1)];
    webhookLog.next_retry_at = new Date(Date.now() + delayMinutes * 60 * 1000);

    if (webhookLog.retry_count >= webhookLog.max_retries) {
      webhookLog.status = "failed";
      webhookLog.next_retry_at = null;
      console.error(
        `🚨 WEBHOOK FALHOU DEFINITIVAMENTE após ${webhookLog.retry_count} tentativas`,
      );
    }

    await webhookLog.save();
    console.log(
      `🔄 RETRY agendado para ${webhookLog.next_retry_at} (tentativa ${webhookLog.retry_count})`,
    );
  }

  /**
   * Processar retries pendentes (para ser chamado por um cron job)
   */
  static async processRetries(): Promise<void> {
    const now = new Date();
    const webhooksToRetry = await WebhookLog.find({
      status: "retry",
      next_retry_at: { $lte: now },
    });

    for (const webhook of webhooksToRetry) {
      console.log(`🔄 Processando retry para webhook ${webhook.webhook_id}`);
      await this.processPaymentWebhook(webhook.payload);
    }
  }

  /**
   * Simular status do pagamento (em produção, consultar API do Mercado Pago)
   */
  private static simulatePaymentStatus(webhookData: any): string {
    // Em produção, aqui seria feita uma chamada à API do Mercado Pago
    // Para demonstração, simulamos baseado nos dados do webhook
    if (webhookData.action === "payment.created") {
      return "pending";
    } else if (webhookData.action === "payment.updated") {
      // Simular aprovação automática para teste
      return "approved";
    }
    return "pending";
  }
}
