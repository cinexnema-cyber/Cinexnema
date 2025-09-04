import { supabase } from "./supabase";

export interface SupabaseUser {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  role: "subscriber" | "creator" | "admin";
  subscription_status: "pending" | "active" | "cancelled" | "expired";
  subscription_plan?: "monthly" | "yearly" | "lifetime";
  subscription_start?: string;
  subscription_end?: string;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRecord {
  id?: string;
  user_id: string;
  amount: number;
  currency: string;
  plan: string;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: string;
  transaction_id?: string;
  created_at?: string;
}

export interface ContentItem {
  id?: string;
  title: string;
  description: string;
  type: "movie" | "series" | "documentary";
  genre: string[];
  release_year: number;
  duration_minutes?: number;
  poster_url?: string;
  video_url?: string;
  quality: "720p" | "1080p" | "4K";
  is_premium: boolean;
  creator_id?: string;
  views_count: number;
  rating: number;
  created_at?: string;
}

class SupabaseAuthService {
  /**
   * Criar novo usuário no Supabase
   */
  async createUser(
    userData: Omit<SupabaseUser, "id" | "created_at" | "updated_at">,
  ): Promise<{ user: SupabaseUser | null; error: string | null }> {
    try {
      console.log("🔧 Criando usuário no Supabase:", userData.email);

      // Primeiro, criar usuário na tabela customizada
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao criar usuário:", error);
        return { user: null, error: error.message };
      }

      console.log("✅ Usuário criado no Supabase:", data);
      return { user: data, error: null };
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      return { user: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Buscar usuário por email
   */
  async getUserByEmail(
    email: string,
  ): Promise<{ user: SupabaseUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { user: null, error: "Usuário não encontrado" };
        }
        return { user: null, error: error.message };
      }

      return { user: data, error: null };
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      return { user: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(
    userId: string,
    updates: Partial<SupabaseUser>,
  ): Promise<{ user: SupabaseUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data, error: null };
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);
      return { user: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Ativar assinatura
   */
  async activateSubscription(
    userId: string,
    plan: string,
    paymentId?: string,
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const subscriptionEnd = new Date();

      // Calcular data de término baseada no plano
      switch (plan) {
        case "monthly":
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
          break;
        case "yearly":
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
          break;
        case "lifetime":
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100);
          break;
        default:
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      const { error } = await supabase
        .from("users")
        .update({
          subscription_status: "active",
          subscription_plan: plan as any,
          subscription_start: new Date().toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          is_premium: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      console.log("✅ Assinatura ativada:", { userId, plan });
      return { success: true, error: null };
    } catch (error) {
      console.error("❌ Erro ao ativar assinatura:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }

  /**
   * Registrar pagamento
   */
  async recordPayment(
    paymentData: Omit<PaymentRecord, "id" | "created_at">,
  ): Promise<{ payment: PaymentRecord | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([
          {
            ...paymentData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return { payment: null, error: error.message };
      }

      return { payment: data, error: null };
    } catch (error) {
      console.error("❌ Erro ao registrar pagamento:", error);
      return { payment: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Buscar conteúdo disponível
   */
  async getContent(filters?: {
    type?: string;
    genre?: string;
    isPremium?: boolean;
  }): Promise<{ content: ContentItem[]; error: string | null }> {
    try {
      let query = supabase.from("content").select("*");

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (filters?.genre) {
        query = query.contains("genre", [filters.genre]);
      }

      if (filters?.isPremium !== undefined) {
        query = query.eq("is_premium", filters.isPremium);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { content: [], error: error.message };
      }

      return { content: data || [], error: null };
    } catch (error) {
      console.error("❌ Erro ao buscar conteúdo:", error);
      return { content: [], error: "Erro interno do servidor" };
    }
  }

  /**
   * Buscar recomendações baseadas no histórico do usuário
   */
  async getRecommendations(
    userId: string,
  ): Promise<{ content: ContentItem[]; error: string | null }> {
    try {
      // Buscar histórico do usuário
      const { data: history, error: historyError } = await supabase
        .from("user_watch_history")
        .select("content_id, genre")
        .eq("user_id", userId)
        .limit(20);

      if (historyError) {
        console.warn("Erro ao buscar histórico:", historyError);
        // Se não conseguir buscar histórico, retornar conteúdo popular
        return this.getPopularContent();
      }

      // Extrair gêneros mais assistidos
      const genreCount: { [key: string]: number } = {};
      history?.forEach((item) => {
        if (item.genre) {
          item.genre.forEach((g: string) => {
            genreCount[g] = (genreCount[g] || 0) + 1;
          });
        }
      });

      const topGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);

      if (topGenres.length === 0) {
        return this.getPopularContent();
      }

      // Buscar conteúdo dos gêneros preferidos
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .overlaps("genre", topGenres)
        .order("rating", { ascending: false })
        .limit(10);

      if (error) {
        return { content: [], error: error.message };
      }

      return { content: data || [], error: null };
    } catch (error) {
      console.error("❌ Erro ao buscar recomendações:", error);
      return this.getPopularContent();
    }
  }

  /**
   * Buscar conteúdo popular (fallback para recomendações)
   */
  async getPopularContent(): Promise<{
    content: ContentItem[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("views_count", { ascending: false })
        .limit(10);

      if (error) {
        return { content: [], error: error.message };
      }

      return { content: data || [], error: null };
    } catch (error) {
      console.error("❌ Erro ao buscar conteúdo popular:", error);
      return { content: [], error: "Erro interno do servidor" };
    }
  }

  /**
   * Registrar visualização
   */
  async recordView(
    userId: string,
    contentId: string,
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Registrar no histórico do usuário
      await supabase.from("user_watch_history").upsert({
        user_id: userId,
        content_id: contentId,
        watched_at: new Date().toISOString(),
      });

      // Incrementar contador de visualizações
      await supabase.rpc("increment_views", { content_id: contentId });

      return { success: true, error: null };
    } catch (error) {
      console.error("❌ Erro ao registrar visualização:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;
