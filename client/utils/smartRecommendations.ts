// Sistema Inteligente de Recomendações XNEMA

interface Content {
  id: string;
  title: string;
  category: string;
  genre: string[];
  rating: number;
  duration: number;
  releaseDate: string;
  thumbnail: string;
  description: string;
  views: number;
  tags: string[];
}

interface UserPreferences {
  userId: string;
  watchHistory: WatchHistoryItem[];
  likedGenres: string[];
  watchTime: { [key: string]: number }; // content_id -> minutes watched
  ratings: { [key: string]: number }; // content_id -> rating (1-5)
  devicePreferences: DevicePreference[];
}

interface WatchHistoryItem {
  contentId: string;
  watchedAt: string;
  completionPercentage: number;
  deviceType: string;
  timeOfDay: number; // hour (0-23)
}

interface DevicePreference {
  type: 'mobile' | 'tv' | 'desktop' | 'tablet';
  preferredGenres: string[];
  typicalWatchTime: number; // minutes
}

interface Recommendation {
  content: Content;
  score: number;
  reason: string;
  confidence: number;
}

class SmartRecommendationEngine {
  private static instance: SmartRecommendationEngine;
  private content: Map<string, Content> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();

  static getInstance(): SmartRecommendationEngine {
    if (!SmartRecommendationEngine.instance) {
      SmartRecommendationEngine.instance = new SmartRecommendationEngine();
    }
    return SmartRecommendationEngine.instance;
  }

  // Algoritmo principal de recomendação
  getRecommendations(userId: string, limit: number = 10): Recommendation[] {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) return this.getPopularContent(limit);

    const recommendations: Recommendation[] = [];
    
    for (const [contentId, content] of this.content.entries()) {
      // Skip content já assistido completamente
      const watchHistory = userPref.watchHistory.find(h => h.contentId === contentId);
      if (watchHistory && watchHistory.completionPercentage > 90) continue;

      let score = 0;
      let reasons: string[] = [];

      // 1. Score baseado em gêneros preferidos
      const genreScore = this.calculateGenreScore(content, userPref);
      score += genreScore * 0.3;
      if (genreScore > 0.7) reasons.push("Baseado nos seus gêneros favoritos");

      // 2. Score baseado em histórico de visualização
      const historyScore = this.calculateHistoryScore(content, userPref);
      score += historyScore * 0.25;
      if (historyScore > 0.6) reasons.push("Semelhante ao que você já assistiu");

      // 3. Score baseado em popularidade
      const popularityScore = this.calculatePopularityScore(content);
      score += popularityScore * 0.2;
      if (popularityScore > 0.8) reasons.push("Trending agora");

      // 4. Score baseado em device e horário
      const contextScore = this.calculateContextualScore(content, userPref);
      score += contextScore * 0.15;
      if (contextScore > 0.7) reasons.push("Perfeito para este momento");

      // 5. Score baseado em rating
      const ratingScore = content.rating / 5;
      score += ratingScore * 0.1;
      if (content.rating >= 4.5) reasons.push("Altamente avaliado");

      // Boost para conteúdo não assistido
      if (!watchHistory) {
        score += 0.1;
        reasons.push("Novo para você");
      } else if (watchHistory.completionPercentage < 50) {
        score += 0.05;
        reasons.push("Continue assistindo");
      }

      recommendations.push({
        content,
        score,
        reason: reasons[0] || "Recomendado para você",
        confidence: Math.min(score, 1)
      });
    }

    // Ordena por score e retorna top results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Calcula score baseado em gêneros preferidos
  private calculateGenreScore(content: Content, userPref: UserPreferences): number {
    if (userPref.likedGenres.length === 0) return 0.5; // neutral

    const genreMatches = content.genre.filter(g => 
      userPref.likedGenres.includes(g)
    ).length;

    return genreMatches / Math.max(content.genre.length, userPref.likedGenres.length);
  }

  // Calcula score baseado em histórico
  private calculateHistoryScore(content: Content, userPref: UserPreferences): number {
    let score = 0;
    let count = 0;

    for (const historyItem of userPref.watchHistory) {
      const watchedContent = this.content.get(historyItem.contentId);
      if (!watchedContent) continue;

      // Similaridade de gênero
      const genreSimilarity = this.calculateGenreSimilarity(content, watchedContent);
      
      // Peso baseado na completion percentage
      const weight = historyItem.completionPercentage / 100;
      
      score += genreSimilarity * weight;
      count++;
    }

    return count > 0 ? score / count : 0;
  }

  // Calcula similaridade entre gêneros
  private calculateGenreSimilarity(content1: Content, content2: Content): number {
    const intersection = content1.genre.filter(g => content2.genre.includes(g));
    const union = [...new Set([...content1.genre, ...content2.genre])];
    return intersection.length / union.length;
  }

  // Calcula score de popularidade
  private calculatePopularityScore(content: Content): number {
    const maxViews = Math.max(...Array.from(this.content.values()).map(c => c.views));
    return maxViews > 0 ? content.views / maxViews : 0;
  }

  // Calcula score contextual (device, horário)
  private calculateContextualScore(content: Content, userPref: UserPreferences): number {
    const currentHour = new Date().getHours();
    const currentDevice = this.getCurrentDevice(); // detecta device atual
    
    let score = 0;

    // Preferências por horário
    const timeBasedHistory = userPref.watchHistory.filter(h => 
      Math.abs(h.timeOfDay - currentHour) <= 2
    );

    if (timeBasedHistory.length > 0) {
      const avgCompletion = timeBasedHistory.reduce((sum, h) => 
        sum + h.completionPercentage, 0
      ) / timeBasedHistory.length;
      
      score += avgCompletion / 100 * 0.5;
    }

    // Preferências por device
    const devicePref = userPref.devicePreferences.find(d => d.type === currentDevice);
    if (devicePref) {
      const genreMatch = content.genre.some(g => devicePref.preferredGenres.includes(g));
      if (genreMatch) score += 0.3;

      // Duration match
      const durationDiff = Math.abs(content.duration - devicePref.typicalWatchTime);
      const durationScore = Math.max(0, 1 - (durationDiff / 60)); // normalize by hour
      score += durationScore * 0.2;
    }

    return Math.min(score, 1);
  }

  // Detecta tipo de device atual
  private getCurrentDevice(): 'mobile' | 'tv' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;

    if (/mobile|android|iphone/.test(userAgent) && screenWidth < 768) {
      return 'mobile';
    } else if (screenWidth >= 1920 || /smart-tv|tv/.test(userAgent)) {
      return 'tv';
    } else if (/tablet|ipad/.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Conteúdo popular como fallback
  private getPopularContent(limit: number): Recommendation[] {
    return Array.from(this.content.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map(content => ({
        content,
        score: content.views / Math.max(...Array.from(this.content.values()).map(c => c.views)),
        reason: "Popular na XNEMA",
        confidence: 0.8
      }));
  }

  // Atualiza preferências do usuário
  updateUserPreferences(userId: string, contentId: string, action: 'watch' | 'like' | 'rate', data: any): void {
    let userPref = this.userPreferences.get(userId);
    if (!userPref) {
      userPref = {
        userId,
        watchHistory: [],
        likedGenres: [],
        watchTime: {},
        ratings: {},
        devicePreferences: []
      };
    }

    const content = this.content.get(contentId);
    if (!content) return;

    switch (action) {
      case 'watch':
        const existingWatch = userPref.watchHistory.find(h => h.contentId === contentId);
        if (existingWatch) {
          existingWatch.completionPercentage = data.completionPercentage;
          existingWatch.watchedAt = new Date().toISOString();
        } else {
          userPref.watchHistory.push({
            contentId,
            watchedAt: new Date().toISOString(),
            completionPercentage: data.completionPercentage,
            deviceType: this.getCurrentDevice(),
            timeOfDay: new Date().getHours()
          });
        }

        // Atualiza gêneros preferidos baseado no tempo assistido
        if (data.completionPercentage > 70) {
          content.genre.forEach(genre => {
            if (!userPref!.likedGenres.includes(genre)) {
              userPref!.likedGenres.push(genre);
            }
          });
        }
        break;

      case 'rate':
        userPref.ratings[contentId] = data.rating;
        break;
    }

    this.userPreferences.set(userId, userPref);
  }

  // Inicializa conteúdo de exemplo
  initializeMockContent(): void {
    const mockContent: Content[] = [
      {
        id: 'bhh-s1e1',
        title: 'Between Heaven and Hell - T1E01',
        category: 'Between Heaven and Hell',
        genre: ['Drama', 'Sobrenatural', 'Thriller'],
        rating: 4.9,
        duration: 45,
        releaseDate: '2024-12-01',
        thumbnail: 'https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=400',
        description: 'O início da saga épica entre o bem e o mal',
        views: 15420,
        tags: ['exclusivo', 'premium', 'novo']
      },
      {
        id: 'horizonte-infinito',
        title: 'Horizonte Infinito',
        category: 'Filme',
        genre: ['Ficção Científica', 'Ação'],
        rating: 4.8,
        duration: 135,
        releaseDate: '2024-11-15',
        thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
        description: 'Uma jornada épica através do espaço',
        views: 12800,
        tags: ['4k', 'premium']
      },
      {
        id: 'misterios-cidade',
        title: 'Mistérios da Cidade',
        category: 'Filme',
        genre: ['Thriller', 'Crime'],
        rating: 4.6,
        duration: 105,
        releaseDate: '2024-10-20',
        thumbnail: 'https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=400&h=600&fit=crop',
        description: 'Um thriller urbano cheio de suspense',
        views: 9200,
        tags: ['suspense', 'crime']
      }
    ];

    mockContent.forEach(content => {
      this.content.set(content.id, content);
    });

    // Mock user preferences
    this.userPreferences.set('joao.silva@email.com', {
      userId: 'joao.silva@email.com',
      watchHistory: [
        {
          contentId: 'bhh-s1e1',
          watchedAt: '2024-12-20T20:30:00Z',
          completionPercentage: 85,
          deviceType: 'tv',
          timeOfDay: 20
        }
      ],
      likedGenres: ['Drama', 'Sobrenatural'],
      watchTime: { 'bhh-s1e1': 38 },
      ratings: { 'bhh-s1e1': 5 },
      devicePreferences: [
        {
          type: 'tv',
          preferredGenres: ['Drama', 'Ação'],
          typicalWatchTime: 60
        },
        {
          type: 'mobile',
          preferredGenres: ['Comédia', 'Documentário'],
          typicalWatchTime: 25
        }
      ]
    });
  }

  // Obtém recomendações personalizadas para diferentes contextos
  getContextualRecommendations(userId: string, context: 'continue' | 'new' | 'trending' | 'quick'): Recommendation[] {
    const userPref = this.userPreferences.get(userId);
    
    switch (context) {
      case 'continue':
        return this.getContinueWatching(userId);
      
      case 'new':
        return this.getNewContent(userId);
      
      case 'trending':
        return this.getTrendingContent();
      
      case 'quick':
        return this.getQuickWatch(userId);
      
      default:
        return this.getRecommendations(userId);
    }
  }

  private getContinueWatching(userId: string): Recommendation[] {
    const userPref = this.userPreferences.get(userId);
    if (!userPref) return [];

    return userPref.watchHistory
      .filter(h => h.completionPercentage < 90 && h.completionPercentage > 10)
      .map(h => {
        const content = this.content.get(h.contentId);
        if (!content) return null;
        
        return {
          content,
          score: 1 - (h.completionPercentage / 100),
          reason: "Continue assistindo",
          confidence: 0.9
        };
      })
      .filter((r): r is Recommendation => r !== null)
      .sort((a, b) => b.score - a.score);
  }

  private getNewContent(userId: string): Recommendation[] {
    const userPref = this.userPreferences.get(userId);
    const watchedIds = userPref?.watchHistory.map(h => h.contentId) || [];

    return Array.from(this.content.values())
      .filter(content => !watchedIds.includes(content.id))
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 10)
      .map(content => ({
        content,
        score: 0.8,
        reason: "Novo na XNEMA",
        confidence: 0.7
      }));
  }

  private getTrendingContent(): Recommendation[] {
    return Array.from(this.content.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(content => ({
        content,
        score: content.views / Math.max(...Array.from(this.content.values()).map(c => c.views)),
        reason: "Trending agora",
        confidence: 0.8
      }));
  }

  private getQuickWatch(userId: string): Recommendation[] {
    const currentDevice = this.getCurrentDevice();
    const maxDuration = currentDevice === 'mobile' ? 30 : 60; // minutes

    return Array.from(this.content.values())
      .filter(content => content.duration <= maxDuration)
      .map(content => ({
        content,
        score: 1 - (content.duration / maxDuration),
        reason: `Perfeito para ${currentDevice}`,
        confidence: 0.8
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

// Exporta instância singleton
export const recommendationEngine = SmartRecommendationEngine.getInstance();

// Funções utilitárias
export const getPersonalizedRecommendations = (userId: string, limit?: number) => {
  return recommendationEngine.getRecommendations(userId, limit);
};

export const getContextualRecommendations = (userId: string, context: 'continue' | 'new' | 'trending' | 'quick') => {
  return recommendationEngine.getContextualRecommendations(userId, context);
};

export const trackUserActivity = (userId: string, contentId: string, action: 'watch' | 'like' | 'rate', data: any) => {
  recommendationEngine.updateUserPreferences(userId, contentId, action, data);
};

export const initializeRecommendationSystem = () => {
  recommendationEngine.initializeMockContent();
};

// Tipos exportados
export type { Content, UserPreferences, Recommendation, WatchHistoryItem };
