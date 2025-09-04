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

/**
 * Buscar catálogo de conteúdo
 * GET /api/content/catalog
 */
export const getCatalog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      genre,
      search,
      page = 1,
      limit = 20,
      premium_only = false,
    } = req.query;

    const userId = req.userId;
    let query = supabase.from("content").select("*");

    // Filtros
    if (type) {
      query = query.eq("type", type);
    }

    if (genre) {
      query = query.contains("genre", [genre]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Verificar se usuário tem acesso premium
    let userIsPremium = false;
    if (userId) {
      const { data: user } = await supabase
        .from("users")
        .select("is_premium, subscription_end")
        .eq("id", userId)
        .single();

      if (user) {
        userIsPremium = user.is_premium;
        // Verificar se assinatura não expirou
        if (
          user.subscription_end &&
          new Date() > new Date(user.subscription_end)
        ) {
          userIsPremium = false;
        }
      }
    }

    // Se usuário não é premium, mostrar apenas conteúdo gratuito
    if (!userIsPremium && premium_only !== "true") {
      query = query.eq("is_premium", false);
    } else if (premium_only === "true" && !userIsPremium) {
      // Usuário não premium tentando acessar conteúdo premium
      return res.status(403).json({
        success: false,
        message: "Assinatura premium necessária",
      });
    }

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: content, error } = await query;

    if (error) {
      console.error("❌ Erro ao buscar catálogo:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar conteúdo",
      });
    }

    // Contar total de itens para paginação
    let countQuery = supabase
      .from("content")
      .select("*", { count: "exact", head: true });

    if (type) countQuery = countQuery.eq("type", type);
    if (genre) countQuery = countQuery.contains("genre", [genre]);
    if (search)
      countQuery = countQuery.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`,
      );
    if (!userIsPremium && premium_only !== "true")
      countQuery = countQuery.eq("is_premium", false);

    const { count } = await countQuery;

    res.json({
      success: true,
      content: content || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
      userIsPremium,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar catálogo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar detalhes de um conteúdo específico
 * GET /api/content/:id
 */
export const getContentById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID do conteúdo é obrigatório",
      });
    }

    // Buscar conteúdo
    const { data: content, error } = await supabase
      .from("content")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !content) {
      return res.status(404).json({
        success: false,
        message: "Conteúdo não encontrado",
      });
    }

    // Verificar se usuário tem acesso
    let userIsPremium = false;
    if (userId) {
      const { data: user } = await supabase
        .from("users")
        .select("is_premium, subscription_end")
        .eq("id", userId)
        .single();

      if (user) {
        userIsPremium = user.is_premium;
        if (
          user.subscription_end &&
          new Date() > new Date(user.subscription_end)
        ) {
          userIsPremium = false;
        }
      }
    }

    // Se conteúdo é premium e usuário não tem acesso
    if (content.is_premium && !userIsPremium) {
      return res.json({
        success: true,
        content: {
          ...content,
          video_url: null, // Remover URL do vídeo
          accessRequired: "premium",
        },
        userIsPremium,
      });
    }

    res.json({
      success: true,
      content,
      userIsPremium,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar conteúdo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Registrar visualização de conteúdo
 * POST /api/content/:id/watch
 */
export const recordWatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login necessário",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID do conteúdo é obrigatório",
      });
    }

    // Verificar se conteúdo existe
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("*")
      .eq("id", id)
      .single();

    if (contentError || !content) {
      return res.status(404).json({
        success: false,
        message: "Conteúdo não encontrado",
      });
    }

    // Verificar acesso premium se necessário
    if (content.is_premium) {
      const { data: user } = await supabase
        .from("users")
        .select("is_premium, subscription_end")
        .eq("id", userId)
        .single();

      if (!user || !user.is_premium) {
        return res.status(403).json({
          success: false,
          message: "Assinatura premium necessária",
        });
      }

      if (
        user.subscription_end &&
        new Date() > new Date(user.subscription_end)
      ) {
        return res.status(403).json({
          success: false,
          message: "Assinatura expirada",
        });
      }
    }

    // Registrar visualização no histórico
    await supabase.from("user_watch_history").upsert(
      {
        user_id: userId,
        content_id: id,
        watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,content_id",
      },
    );

    // Incrementar contador de visualizações
    await supabase
      .from("content")
      .update({
        views_count: (content.views_count || 0) + 1,
      })
      .eq("id", id);

    console.log("✅ Visualização registrada:", { userId, contentId: id });

    res.json({
      success: true,
      message: "Visualização registrada",
    });
  } catch (error) {
    console.error("❌ Erro ao registrar visualização:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar histórico de visualizações do usuário
 * GET /api/content/watch-history
 */
export const getWatchHistory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login necessário",
      });
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Buscar histórico com detalhes do conteúdo
    const { data: history, error } = await supabase
      .from("user_watch_history")
      .select(
        `
        *,
        content:content_id (
          id,
          title,
          description,
          type,
          genre,
          poster_url,
          duration_minutes,
          rating
        )
      `,
      )
      .eq("user_id", userId)
      .order("watched_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error("❌ Erro ao buscar histórico:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar histórico",
      });
    }

    res.json({
      success: true,
      history: history || [],
    });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar gêneros disponíveis
 * GET /api/content/genres
 */
export const getGenres = async (req: Request, res: Response) => {
  try {
    // Buscar todos os gêneros únicos
    const { data: content, error } = await supabase
      .from("content")
      .select("genre");

    if (error) {
      console.error("❌ Erro ao buscar gêneros:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar gêneros",
      });
    }

    // Extrair gêneros únicos
    const genresSet = new Set<string>();
    content?.forEach((item) => {
      if (item.genre && Array.isArray(item.genre)) {
        item.genre.forEach((g) => genresSet.add(g));
      }
    });

    const genres = Array.from(genresSet).sort();

    res.json({
      success: true,
      genres,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar gêneros:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar conteúdo em destaque
 * GET /api/content/featured
 */
export const getFeaturedContent = async (
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

      if (user) {
        userIsPremium = user.is_premium;
        if (
          user.subscription_end &&
          new Date() > new Date(user.subscription_end)
        ) {
          userIsPremium = false;
        }
      }
    }

    // Buscar conteúdo mais popular
    let query = supabase
      .from("content")
      .select("*")
      .order("views_count", { ascending: false })
      .limit(10);

    // Se usuário não é premium, filtrar apenas conteúdo gratuito
    if (!userIsPremium) {
      query = query.eq("is_premium", false);
    }

    const { data: featured, error } = await query;

    if (error) {
      console.error("❌ Erro ao buscar conteúdo em destaque:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar conteúdo em destaque",
      });
    }

    res.json({
      success: true,
      featured: featured || [],
      userIsPremium,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar conteúdo em destaque:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
