import express from 'express';
// Note: Analytics models temporarily disabled - would need proper database setup
// import { PlatformAnalytics, CreatorAnalytics } from '../models/Analytics';
// import CreatorBilling from '../models/CreatorBilling';
// import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Analytics da Plataforma (apenas para admin cinexnema@gmail.com) - Dados Mockados
router.get('/platform', async (req, res) => {
  try {
    // Verificar se é o admin da plataforma
    if (req.user?.email !== 'cinexnema@gmail.com') {
      return res.status(403).json({ error: 'Acesso negado. Apenas para administradores da plataforma.' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Buscar analytics do dia atual
    let analytics = await PlatformAnalytics.findOne({
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Se não existir, criar analytics do dia
    if (!analytics) {
      analytics = await generateDailyPlatformAnalytics(today);
    }

    // Dados agregados do mês
    const monthlyData = await PlatformAnalytics.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: '$daily_revenue' },
          total_signups: { $sum: '$daily_signups' },
          total_subscriptions: { $sum: '$daily_subscriptions' },
          total_cancellations: { $sum: '$daily_cancellations' },
          total_creator_fees: { $sum: '$creator_fees_collected' },
          total_commissions_paid: { $sum: '$commission_paid_to_creators' }
        }
      }
    ]);

    res.json({
      today: analytics,
      monthly: monthlyData[0] || {
        total_revenue: 0,
        total_signups: 0,
        total_subscriptions: 0,
        total_cancellations: 0,
        total_creator_fees: 0,
        total_commissions_paid: 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar analytics da plataforma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Analytics do Criador
router.get('/creator/:creator_id', authenticateToken, async (req, res) => {
  try {
    const { creator_id } = req.params;

    // Verificar se é o próprio criador ou admin da plataforma
    if (req.user?.id !== creator_id && req.user?.email !== 'cinexnema@gmail.com') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Buscar analytics do criador
    let analytics = await CreatorAnalytics.findOne({
      creator_id,
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Se não existir, criar analytics do dia
    if (!analytics) {
      analytics = await generateDailyCreatorAnalytics(creator_id);
    }

    // Buscar dados de cobrança
    const billing = await CreatorBilling.findOne({ creator_id });

    // Dados do mês
    const monthlyData = await CreatorAnalytics.aggregate([
      {
        $match: {
          creator_id,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total_referrals_month: { $sum: '$daily_referrals' },
          total_conversions_month: { $sum: '$daily_conversions' },
          total_earnings_month: { $sum: '$earnings_today' }
        }
      }
    ]);

    res.json({
      today: analytics,
      monthly: monthlyData[0] || {
        total_referrals_month: 0,
        total_conversions_month: 0,
        total_earnings_month: 0
      },
      billing: billing || null
    });

  } catch (error) {
    console.error('Erro ao buscar analytics do criador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar analytics diários da plataforma
async function generateDailyPlatformAnalytics(date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Contar usuários totais
  const totalUsers = await User.countDocuments();
  const totalSubscribers = await User.countDocuments({ subscriptionStatus: 'ativo' });
  const totalCreators = await User.countDocuments({ role: 'creator' });

  // Usuários criados hoje
  const dailySignups = await User.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });

  // Assinantes criados hoje (simulado - seria baseado em pagamentos reais)
  const dailySubscriptions = Math.floor(Math.random() * 10) + 1;
  const dailyRevenue = dailySubscriptions * 19.90;

  // Taxas de criadores coletadas
  const creatorsWithBilling = await CreatorBilling.find({ status: 'billing_active' });
  const creatorFeesCollected = creatorsWithBilling.length * 1000;

  // Comissões pagas aos criadores (60% da receita de referrals)
  const commissionsPaid = dailyRevenue * 0.6;

  const analytics = new PlatformAnalytics({
    date: startOfDay,
    total_users: totalUsers,
    total_subscribers: totalSubscribers,
    total_creators: totalCreators,
    daily_signups: dailySignups,
    daily_subscriptions: dailySubscriptions,
    daily_cancellations: Math.floor(Math.random() * 3),
    daily_revenue: dailyRevenue,
    monthly_revenue: dailyRevenue * 30, // Estimativa
    creator_fees_collected: creatorFeesCollected,
    commission_paid_to_creators: commissionsPaid,
    top_content: [
      {
        content_id: 'bhh_ep1',
        title: 'Between Heaven and Hell - Episódio 1',
        views: Math.floor(Math.random() * 1000) + 500,
        revenue_generated: Math.floor(Math.random() * 200) + 100
      },
      {
        content_id: 'bhh_ep2',
        title: 'Between Heaven and Hell - Episódio 2',
        views: Math.floor(Math.random() * 800) + 300,
        revenue_generated: Math.floor(Math.random() * 150) + 75
      }
    ],
    traffic_sources: {
      direct: Math.floor(Math.random() * 100) + 50,
      organic: Math.floor(Math.random() * 80) + 30,
      referrals: Math.floor(Math.random() * 60) + 20,
      creator_links: Math.floor(Math.random() * 40) + 10
    },
    device_stats: {
      mobile: Math.floor(Math.random() * 150) + 100,
      desktop: Math.floor(Math.random() * 100) + 50,
      tablet: Math.floor(Math.random() * 50) + 20,
      tv: Math.floor(Math.random() * 30) + 10
    },
    geographic_data: [
      { state: 'São Paulo', city: 'São Paulo', users: Math.floor(Math.random() * 100) + 50, subscribers: Math.floor(Math.random() * 30) + 15 },
      { state: 'Rio de Janeiro', city: 'Rio de Janeiro', users: Math.floor(Math.random() * 80) + 40, subscribers: Math.floor(Math.random() * 25) + 12 },
      { state: 'Minas Gerais', city: 'Belo Horizonte', users: Math.floor(Math.random() * 60) + 30, subscribers: Math.floor(Math.random() * 20) + 10 }
    ]
  });

  return await analytics.save();
}

// Gerar analytics diários do criador
async function generateDailyCreatorAnalytics(creator_id: string) {
  const creator = await User.findById(creator_id);
  if (!creator) {
    throw new Error('Criador não encontrado');
  }

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Buscar dados de cobrança
  const billing = await CreatorBilling.findOne({ creator_id });

  const dailyReferrals = Math.floor(Math.random() * 20) + 5;
  const dailyConversions = Math.floor(dailyReferrals * 0.3); // 30% de conversão
  const earningsToday = dailyConversions * 19.90 * 0.6; // 60% de comissão

  const analytics = new CreatorAnalytics({
    creator_id,
    creator_email: creator.email,
    date: startOfDay,
    total_referrals: billing?.subscribers_referred || 0,
    successful_conversions: Math.floor((billing?.subscribers_referred || 0) * 0.3),
    conversion_rate: 30,
    daily_referrals: dailyReferrals,
    daily_conversions: dailyConversions,
    earnings_today: earningsToday,
    earnings_month: earningsToday * 30, // Estimativa
    earnings_total: billing?.total_earned || 0,
    commission_rate: billing?.commission_percentage || 60,
    content_performance: [
      {
        content_id: 'creator_content_1',
        title: 'Conteúdo Promocional 1',
        views: Math.floor(Math.random() * 500) + 100,
        engagement_rate: Math.floor(Math.random() * 50) + 20,
        revenue_generated: Math.floor(Math.random() * 100) + 50
      }
    ],
    referral_sources: {
      social_media: Math.floor(dailyReferrals * 0.6),
      direct_link: Math.floor(dailyReferrals * 0.2),
      word_of_mouth: Math.floor(dailyReferrals * 0.15),
      other: Math.floor(dailyReferrals * 0.05)
    },
    billing_status: billing?.status || 'grace_period',
    next_billing_date: billing?.next_payment_date,
    monthly_fee_due: billing?.monthly_fee || 1000
  });

  return await analytics.save();
}

export default router;
