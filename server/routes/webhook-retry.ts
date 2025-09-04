import { Request, Response } from "express";
import { WebhookRetryService } from "../utils/webhookRetry";
import WebhookLog from "../models/WebhookLog";

/**
 * Endpoint para processar manualmente retries de webhooks falhados
 * POST /api/webhooks/process-retries
 */
export const processRetries = async (req: Request, res: Response) => {
  try {
    console.log("🔄 Iniciando processamento de retries...");

    await WebhookRetryService.processRetries();

    res.json({
      success: true,
      message: "Retries processados com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao processar retries:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para consultar logs de webhooks
 * GET /api/webhooks/logs
 */
export const getWebhookLogs = async (req: Request, res: Response) => {
  try {
    const { limit = 50, status, webhook_type } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (webhook_type) filter.webhook_type = webhook_type;

    const logs = await WebhookLog.find(filter)
      .sort({ created_at: -1 })
      .limit(Number(limit));

    const summary = await WebhookLog.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      logs,
      summary,
      total: logs.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar logs:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para reprocessar um webhook específico
 * POST /api/webhooks/retry/:webhookId
 */
export const retrySpecificWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;

    const webhookLog = await WebhookLog.findOne({ webhook_id: webhookId });
    if (!webhookLog) {
      return res.status(404).json({
        success: false,
        message: "Webhook não encontrado",
      });
    }

    console.log(`🔄 Reprocessando webhook específico: ${webhookId}`);

    const result = await WebhookRetryService.processPaymentWebhook(
      webhookLog.payload,
    );

    res.json({
      success: result.success,
      message: result.success
        ? "Webhook reprocessado com sucesso"
        : "Falha no reprocessamento",
      error: result.error,
    });
  } catch (error) {
    console.error("❌ Erro ao reprocessar webhook:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
