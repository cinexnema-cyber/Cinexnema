import express from 'express';

const router = express.Router();

// Analytics da Plataforma (apenas para admin cinexnema@gmail.com) - Dados Mockados
router.get('/platform', async (req, res) => {
  try {
    // Verificação básica de admin (em produção, usar middleware de auth)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('cinexnema@gmail.com')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas para administradores da plataforma.' });
    }

    console.log('📊 Gerando analytics da plataforma...');

    // Dados mockados para demonstração
    const analytics = {
      today: {
        total_users: 1250,
        total_subscribers: 340,
        total_creators: 25,
        daily_signups: 12,
        daily_subscriptions: 8,
        daily_cancellations: 2,
        daily_revenue: 159.20,
        creator_fees_collected: 5000.00,
        commission_paid_to_creators: 1200.50,
        top_content: [
          {
            title: 'Between Heaven and Hell - Episódio 1',
            views: 1250,
            revenue_generated: 89.50
          },
          {
            title: 'Between Heaven and Hell - Episódio 2',
            views: 980,
            revenue_generated: 67.30
          }
        ],
        traffic_sources: {
          direct: 450,
          organic: 280,
          referrals: 120,
          creator_links: 85
        },
        device_stats: {
          mobile: 650,
          desktop: 380,
          tablet: 150,
          tv: 70
        },
        geographic_data: [
          { state: 'São Paulo', city: 'São Paulo', users: 350, subscribers: 95 },
          { state: 'Rio de Janeiro', city: 'Rio de Janeiro', users: 280, subscribers: 78 },
          { state: 'Minas Gerais', city: 'Belo Horizonte', users: 180, subscribers: 45 }
        ]
      },
      monthly: {
        total_revenue: 4800.50,
        total_signups: 340,
        total_subscriptions: 185,
        total_cancellations: 25,
        total_creator_fees: 15000.00,
        total_commissions_paid: 3600.80
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Erro ao buscar analytics da plataforma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Analytics do Criador - Dados Mockados
router.get('/creator/:creator_id', async (req, res) => {
  try {
    const { creator_id } = req.params;

    console.log('📊 Gerando analytics do criador:', creator_id);

    // Dados mockados para demonstração
    const analytics = {
      today: {
        creator_id,
        creator_email: 'creator@example.com',
        date: new Date().toISOString(),
        total_referrals: 45,
        successful_conversions: 12,
        conversion_rate: 26.7,
        daily_referrals: 5,
        daily_conversions: 2,
        earnings_today: 23.88,
        earnings_month: 450.60,
        earnings_total: 1250.80,
        commission_rate: 60,
        content_performance: [
          {
            content_id: 'creator_content_1',
            title: 'Conteúdo Promocional 1',
            views: 320,
            engagement_rate: 35,
            revenue_generated: 89.50
          }
        ],
        referral_sources: {
          social_media: 28,
          direct_link: 12,
          word_of_mouth: 8,
          other: 2
        },
        billing_status: 'grace_period',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_fee_due: 1000,
        grace_period_remaining_days: 75
      },
      monthly: {
        total_referrals_month: 150,
        total_conversions_month: 42,
        total_earnings_month: 450.60
      },
      billing: {
        creator_id,
        status: 'grace_period',
        monthly_fee: 1000.00,
        grace_period_end: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        total_earned: 1250.80,
        commission_percentage: 60,
        referral_link: `https://cinexnema.com/register?ref=creator_${creator_id}`,
        subscribers_referred: 45
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Erro ao buscar analytics do criador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
