import { supabase } from "./supabase";

export interface PaymentRecord {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  currency: string;
  payment_method: "card" | "pix" | "boleto" | "mercadopago" | "link";
  plan_type: "monthly" | "yearly";
  status: "pending" | "completed" | "failed" | "refunded";
  stripe_session_id?: string;
  payment_date: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  metadata?: {
    transaction_id?: string;
    receipt_url?: string;
    notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_paid: number;
  total_transactions: number;
  active_subscription: boolean;
  subscription_type?: "monthly" | "yearly";
  next_billing_date?: string;
  subscription_status?: "active" | "inactive" | "cancelled" | "trial";
}

export class PaymentHistoryService {
  /**
   * Adiciona um novo registro de pagamento
   */
  static async addPaymentRecord(
    paymentData: Omit<PaymentRecord, "id" | "created_at" | "updated_at">,
  ): Promise<{ success: boolean; error?: string; data?: PaymentRecord }> {
    try {
      const { data, error } = await supabase
        .from("payment_history")
        .insert([
          {
            ...paymentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar registro de pagamento:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Erro ao adicionar registro de pagamento:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca histórico de pagamentos de um usuário
   */
  static async getUserPaymentHistory(
    userId: string,
  ): Promise<{ success: boolean; error?: string; data?: PaymentRecord[] }> {
    try {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico de pagamentos:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Erro ao buscar histórico de pagamentos:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualiza status de um pagamento
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentRecord["status"],
    metadata?: PaymentRecord["metadata"],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from("payment_history")
        .update(updateData)
        .eq("id", paymentId);

      if (error) {
        console.error("Erro ao atualizar status do pagamento:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar status do pagamento:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gera resumo de pagamentos do usuário
   */
  static async getUserPaymentSummary(
    userId: string,
  ): Promise<{ success: boolean; error?: string; data?: PaymentSummary }> {
    try {
      const { data: payments, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "completed");

      if (error) {
        console.error("Erro ao buscar resumo de pagamentos:", error);
        return { success: false, error: error.message };
      }

      const completedPayments = payments || [];
      const totalPaid = completedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      // Busca assinatura ativa
      const activePayment = completedPayments.find((payment) => {
        if (!payment.subscription_end_date) return false;
        return new Date(payment.subscription_end_date) > new Date();
      });

      const summary: PaymentSummary = {
        total_paid: totalPaid,
        total_transactions: completedPayments.length,
        active_subscription: !!activePayment,
        subscription_type: activePayment?.plan_type,
        next_billing_date: activePayment?.subscription_end_date,
        subscription_status: activePayment ? "active" : "inactive",
      };

      return { success: true, data: summary };
    } catch (error: any) {
      console.error("Erro ao gerar resumo de pagamentos:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Simula pagamentos para demonstração (usado em ambiente de desenvolvimento)
   */
  static async createSamplePayments(
    userId: string,
    userEmail: string,
  ): Promise<{ success: boolean; error?: string }> {
    const samplePayments: Omit<
      PaymentRecord,
      "id" | "created_at" | "updated_at"
    >[] = [
      {
        user_id: userId,
        user_email: userEmail,
        amount: 1990, // R$ 19.90
        currency: "BRL",
        payment_method: "card",
        plan_type: "monthly",
        status: "completed",
        payment_date: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 dias atrás
        subscription_start_date: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        subscription_end_date: new Date().toISOString(),
        metadata: {
          transaction_id: "TXN_001",
          receipt_url: "https://example.com/receipt1",
          notes: "Primeira assinatura mensal",
        },
      },
      {
        user_id: userId,
        user_email: userEmail,
        amount: 1990,
        currency: "BRL",
        payment_method: "pix",
        plan_type: "monthly",
        status: "completed",
        payment_date: new Date().toISOString(),
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 dias no futuro
        metadata: {
          transaction_id: "TXN_002",
          receipt_url: "https://example.com/receipt2",
          notes: "Renovação mensal via PIX",
        },
      },
      {
        user_id: userId,
        user_email: userEmail,
        amount: 19900, // R$ 199.00
        currency: "BRL",
        payment_method: "boleto",
        plan_type: "yearly",
        status: "pending",
        payment_date: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 2 dias atrás
        metadata: {
          transaction_id: "TXN_003",
          notes: "Upgrade para plano anual - aguardando compensação",
        },
      },
    ];

    try {
      for (const payment of samplePayments) {
        await this.addPaymentRecord(payment);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao criar pagamentos de exemplo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formata valor monetário
   */
  static formatCurrency(amount: number, currency: string = "BRL"): string {
    const value = amount / 100; // Converte de centavos para reais

    if (currency === "BRL") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  }

  /**
   * Formata data para exibição
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Obtém cor do status
   */
  static getStatusColor(status: PaymentRecord["status"]): string {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      case "refunded":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  }

  /**
   * Obtém texto do status em português
   */
  static getStatusText(status: PaymentRecord["status"]): string {
    switch (status) {
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      case "refunded":
        return "Reembolsado";
      default:
        return "Desconhecido";
    }
  }

  /**
   * Obtém ícone do método de pagamento
   */
  static getPaymentMethodIcon(method: PaymentRecord["payment_method"]): string {
    switch (method) {
      case "card":
        return "💳";
      case "pix":
        return "📱";
      case "boleto":
        return "📄";
      case "mercadopago":
        return "💰";
      case "link":
        return "🔗";
      default:
        return "💳";
    }
  }

  /**
   * Obtém nome do método de pagamento
   */
  static getPaymentMethodName(method: PaymentRecord["payment_method"]): string {
    switch (method) {
      case "card":
        return "Cartão de Crédito";
      case "pix":
        return "PIX";
      case "boleto":
        return "Boleto Bancário";
      case "mercadopago":
        return "Mercado Pago";
      case "link":
        return "Link de Pagamento";
      default:
        return "Não informado";
    }
  }
}
