import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl =
  process.env.SUPABASE_URL || "https://gardjxolnrykvxxtatdq.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmRqeG9sbnJ5a3Z4eHRhdGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM3NjcyNywiZXhwIjoyMDcwOTUyNzI3fQ.L5P2vYFnqSU1n6aTKRsWg2M7kxO1tF6y0l4K3S_HpQA";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}

interface ContentItem {
  id: string;
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

interface UserPreference {
  userId: string;
  genres: { [genre: string]: number };
  types: { [type: string]: number };
  avgRating: number;
  watchTime: number;
}

/**
 * Buscar recomendações personalizadas para o usuário
 * GET /api/recommendations/for-you
 */
export const getPersonalizedRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login necessário",
      });
    }

    console.log("🎯 Gerando recomendações para usuário:", userId);

    // Verificar se usuário é premium
    const { data: user } = await supabase
      .from("users")
      .select("is_premium, subscription_end")
      .eq("id", userId)
      .single();

    const userIsPremium =
      user?.is_premium &&
      (!user.subscription_end || new Date() <= new Date(user.subscription_end));

    // Analisar preferências do usuário
    const preferences = await analyzeUserPreferences(userId);

    // Gerar recomendações baseadas nas preferências
    const recommendations = await generateRecommendations(
      userId,
      preferences,
      userIsPremium,
    );

    res.json({
      success: true,
      recommendations,
      userPreferences: preferences,
      userIsPremium,
    });
  } catch (error) {
    console.error("❌ Erro ao gerar recomendações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Analisar preferências do usuário baseado no histórico
 */
async function analyzeUserPreferences(userId: string): Promise<UserPreference> {
  try {
    // Buscar histórico de visualizações
    const { data: history } = await supabase
      .from("user_watch_history")
      .select(
        `
        *,
        content:content_id (
          id,
          type,
          genre,
          rating,
          duration_minutes
        )
      `,
      )
      .eq("user_id", userId)
      .order("watched_at", { ascending: false })
      .limit(50); // Analisar últimas 50 visualizações

    const preferences: UserPreference = {
      userId,
      genres: {},
      types: {},
      avgRating: 0,
      watchTime: 0,
    };

    if (!history || history.length === 0) {
      return preferences;
    }

    let totalRating = 0;
    let ratingCount = 0;
    let totalDuration = 0;

    // Analisar cada item do histórico
    history.forEach((item) => {
      const content = item.content as any;
      if (!content) return;

      // Contar gêneros
      if (content.genre && Array.isArray(content.genre)) {
        content.genre.forEach((genre: string) => {
          preferences.genres[genre] = (preferences.genres[genre] || 0) + 1;
        });
      }

      // Contar tipos
      if (content.type) {
        preferences.types[content.type] =
          (preferences.types[content.type] || 0) + 1;
      }

      // Somar ratings
      if (content.rating && content.rating > 0) {
        totalRating += content.rating;
        ratingCount++;
      }

      // Somar duração
      if (content.duration_minutes) {
        totalDuration += content.duration_minutes;
      }
    });

    // Calcular médias
    preferences.avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    preferences.watchTime = totalDuration;

    console.log("📊 Preferências analisadas:", preferences);
    return preferences;
  } catch (error) {
    console.error("❌ Erro ao analisar preferências:", error);
    return {
      userId,
      genres: {},
      types: {},
      avgRating: 0,
      watchTime: 0,
    };
  }
}

/**
 * Gerar recomendações baseadas nas preferências
 */
async function generateRecommendations(
  userId: string,
  preferences: UserPreference,
  userIsPremium: boolean,
): Promise<ContentItem[]> {
  try {
    const recommendations: ContentItem[] = [];

    // Se usuário não tem histórico, recomendar conteúdo popular
    if (Object.keys(preferences.genres).length === 0) {
      return getPopularContent(userIsPremium);
    }

    // Buscar conteúdo já assistido para evitar duplicatas
    const { data: watchedContent } = await supabase
      .from("user_watch_history")
      .select("content_id")
      .eq("user_id", userId);

    const watchedIds = watchedContent?.map((item) => item.content_id) || [];

    // Ordenar gêneros por preferência
    const topGenres = Object.entries(preferences.genres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    // Buscar recomendações por gênero favorito
    for (const genre of topGenres) {
      let query = supabase
        .from("content")
        .select("*")
        .contains("genre", [genre])
        .not("id", "in", `(${watchedIds.join(",") || "null"})`)
        .order("rating", { ascending: false })
        .limit(3);

      if (!userIsPremium) {
        query = query.eq("is_premium", false);
      }

      const { data: genreContent } = await query;
      if (genreContent) {
        recommendations.push(...genreContent);
      }
    }

    // Buscar por tipo favorito
    const topType = Object.entries(preferences.types).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];

    if (topType) {
      let query = supabase
        .from("content")
        .select("*")
        .eq("type", topType)
        .not("id", "in", `(${watchedIds.join(",") || "null"})`)
        .gte("rating", Math.max(preferences.avgRating - 1, 3))
        .order("views_count", { ascending: false })
        .limit(3);

      if (!userIsPremium) {
        query = query.eq("is_premium", false);
      }

      const { data: typeContent } = await query;
      if (typeContent) {
        recommendations.push(...typeContent);
      }
    }

    // Buscar conteúdo com alta avaliação
    let highRatedQuery = supabase
      .from("content")
      .select("*")
      .not("id", "in", `(${watchedIds.join(",") || "null"})`)
      .gte("rating", 4.5)
      .order("rating", { ascending: false })
      .limit(2);

    if (!userIsPremium) {
      highRatedQuery = highRatedQuery.eq("is_premium", false);
    }

    const { data: highRated } = await highRatedQuery;
    if (highRated) {
      recommendations.push(...highRated);
    }

    // Remover duplicatas e limitar
    const uniqueRecommendations = recommendations
      .filter(
        (item, index, self) =>
          self.findIndex((t) => t.id === item.id) === index,
      )
      .slice(0, 10);

    console.log(`✅ ${uniqueRecommendations.length} recomendações geradas`);
    return uniqueRecommendations;
  } catch (error) {
    console.error("❌ Erro ao gerar recomendações:", error);
    return getPopularContent(userIsPremium);
  }
}

/**
 * Buscar conteúdo popular (fallback)
 */
async function getPopularContent(
  userIsPremium: boolean,
): Promise<ContentItem[]> {
  try {
    let query = supabase
      .from("content")
      .select("*")
      .order("views_count", { ascending: false })
      .limit(10);

    if (!userIsPremium) {
      query = query.eq("is_premium", false);
    }

    const { data: popular } = await query;
    return popular || [];
  } catch (error) {
    console.error("❌ Erro ao buscar conteúdo popular:", error);
    return [];
  }
}

/**
 * Buscar conteúdo similar a um item específico
 * GET /api/recommendations/similar/:contentId
 */
export const getSimilarContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { limit = 5 } = req.query;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "ID do conteúdo é obrigatório",
      });
    }

    // Buscar o conteúdo base
    const { data: baseContent, error: baseError } = await supabase
      .from("content")
      .select("*")
      .eq("id", contentId)
      .single();

    if (baseError || !baseContent) {
      return res.status(404).json({
        success: false,
        message: "Conteúdo não encontrado",
      });
    }

    // Buscar conteúdo similar por gênero e tipo
    const { data: similarContent, error } = await supabase
      .from("content")
      .select("*")
      .neq("id", contentId)
      .eq("type", baseContent.type)
      .overlaps("genre", baseContent.genre || [])
      .order("rating", { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error("❌ Erro ao buscar conteúdo similar:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar conteúdo similar",
      });
    }

    res.json({
      success: true,
      baseContent,
      similarContent: similarContent || [],
    });
  } catch (error) {
    console.error("❌ Erro ao buscar conteúdo similar:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar tendências atuais
 * GET /api/recommendations/trending
 */
export const getTrendingContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    // Verificar se usuário é premium
    let userIsPremium = false;
    if (userId) {
      const { data: user } = await supabase
        .from("users")
        .select("is_premium, subscription_end")
        .eq("id", userId)
        .single();

      userIsPremium =
        user?.is_premium &&
        (!user.subscription_end ||
          new Date() <= new Date(user.subscription_end));
    }

    // Buscar conteúdo com mais visualizações nas últimas 2 semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let query = supabase
      .from("content")
      .select("*")
      .gte("created_at", twoWeeksAgo.toISOString())
      .order("views_count", { ascending: false })
      .limit(10);

    if (!userIsPremium) {
      query = query.eq("is_premium", false);
    }

    const { data: trending, error } = await query;

    if (error) {
      console.error("❌ Erro ao buscar tendências:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar tendências",
      });
    }

    res.json({
      success: true,
      trending: trending || [],
      userIsPremium,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar tendências:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Avaliar conteúdo (para melhorar recomendações)
 * POST /api/recommendations/rate/:contentId
 */
export const rateContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const { rating } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login necessário",
      });
    }

    if (!contentId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "ID do conteúdo e rating (1-5) são obrigatórios",
      });
    }

    // Registrar ou atualizar avaliação
    const { error } = await supabase.from("user_ratings").upsert(
      {
        user_id: userId,
        content_id: contentId,
        rating: rating,
        rated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,content_id",
      },
    );

    if (error) {
      console.error("❌ Erro ao avaliar conteúdo:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao avaliar conteúdo",
      });
    }

    // Recalcular rating médio do conteúdo
    await updateContentAverageRating(contentId);

    console.log("✅ Avaliação registrada:", { userId, contentId, rating });

    res.json({
      success: true,
      message: "Avaliação registrada com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao avaliar conteúdo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Atualizar rating médio do conteúdo
 */
async function updateContentAverageRating(contentId: string): Promise<void> {
  try {
    // Calcular nova média
    const { data: ratings } = await supabase
      .from("user_ratings")
      .select("rating")
      .eq("content_id", contentId);

    if (ratings && ratings.length > 0) {
      const average =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      // Atualizar no conteúdo
      await supabase
        .from("content")
        .update({ rating: Math.round(average * 10) / 10 }) // Arredondar para 1 casa decimal
        .eq("id", contentId);
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar rating médio:", error);
  }
}
