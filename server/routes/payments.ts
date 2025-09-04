import express, { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Video from "../models/Video";
import Subscription from "../models/Subscription";
import Commission from "../models/Commission";

const router = express.Router();

// Interface para dados de pagamento
interface PaymentData {
  userId: string;
  videoId?: string;
  plano: "monthly" | "yearly" | "individual";
  metodo_pagamento: "cartao" | "pix" | "boleto" | "mercadopago" | "stripe";
  transaction_id: string;
  valor: number; // em centavos
  gateway: string;
  dados_adicionais?: any;
}

// POST /payments - Processar pagamento e calcular comissões
router.post("/", async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      videoId,
      plano,
      metodo_pagamento,
      transaction_id,
      valor,
      gateway,
      dados_adicionais,
    }: PaymentData = req.body;

    // Validações básicas
    if (!userId || !plano || !metodo_pagamento || !transaction_id || !valor) {
      await session.abortTransaction();
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios faltando",
      });
    }

    // Verificar se usuário existe
    const usuario = await User.findById(userId).session(session);
    if (!usuario) {
      await session.abortTransaction();
      return res.status(404).json({
        sucesso: false,
        erro: "Usuário não encontrado",
      });
    }

    // Verificar se vídeo existe (para pagamentos individuais)
    let video = null;
    if (videoId) {
      video = await Video.findById(videoId).session(session);
      if (!video) {
        await session.abortTransaction();
        return res.status(404).json({
          sucesso: false,
          erro: "Conteúdo não encontrado",
        });
      }
    }

    // Calcular datas do período
    const agora = new Date();
    let dataFim = new Date();

    switch (plano) {
      case "monthly":
        dataFim.setMonth(dataFim.getMonth() + 1);
        break;
      case "yearly":
        dataFim.setFullYear(dataFim.getFullYear() + 1);
        break;
      case "individual":
        dataFim.setFullYear(dataFim.getFullYear() + 10); // Acesso "permanente"
        break;
    }

    // Criar registro de assinatura
    const novaAssinatura = new Subscription({
      id_usuario: userId,
      id_video: videoId,
      tipo_assinatura: videoId ? "conteudo_individual" : "plataforma",
      valor_pago: valor,
      moeda: "BRL",
      metodo_pagamento,
      status_pagamento: "aprovado", // Assumindo pagamento aprovado
      data_pagamento: agora,
      plano,
      transaction_id,
      detalhes_pagamento: {
        gateway,
        dados_adicionais,
      },
      data_inicio_periodo: agora,
      data_fim_periodo: dataFim,
      ativo: true,
    });

    const assinaturaSalva = await novaAssinatura.save({ session });

    // Atualizar status do usuário
    await User.findByIdAndUpdate(
      userId,
      {
        assinante: true,
        subscriptionStatus: "ativo",
        subscriptionPlan: plano,
        subscriptionStart: agora,
        subscriptionEnd: dataFim,
      },
      { session },
    );

    // Calcular e criar comissões para criadores
    const comissoesCriadas = [];

    if (videoId && video) {
      // Pagamento de conteúdo específico - comissão para o criador do vídeo
      const comissao = await criarComissao(
        video.id_criador,
        assinaturaSalva._id,
        videoId,
        valor,
        session,
      );
      comissoesCriadas.push(comissao);
    } else {
      // Assinatura da plataforma - distribuir comissões
      const videosRecentes = await Video.find({
        status: "ativo",
        data_publicacao: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        }, // últimos 30 dias
      }).session(session);

      // Distribuir valor proporcionalmente entre criadores ativos
      if (videosRecentes.length > 0) {
        const valorPorVideo = Math.floor(valor / videosRecentes.length);

        for (const videoRecente of videosRecentes) {
          const comissao = await criarComissao(
            videoRecente.id_criador,
            assinaturaSalva._id,
            videoRecente._id,
            valorPorVideo,
            session,
          );
          comissoesCriadas.push(comissao);
        }
      }
    }

    await session.commitTransaction();

    res.json({
      sucesso: true,
      assinatura: assinaturaSalva,
      comissoes: comissoesCriadas,
      mensagem: "Pagamento processado com sucesso",
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
      detalhes: error.message,
    });
  } finally {
    session.endSession();
  }
});

// Função auxiliar para criar comissão
async function criarComissao(
  criadorId: mongoose.Types.ObjectId,
  assinaturaId: mongoose.Types.ObjectId,
  videoId: mongoose.Types.ObjectId,
  valorOriginal: number,
  session: any,
) {
  // Buscar percentual de comissão do criador
  const criador = await User.findById(criadorId).session(session);
  const percentualComissao = criador?.comissaoPercentual || 70;

  const valorComissao = Math.floor((valorOriginal * percentualComissao) / 100);

  const novaComissao = new Commission({
    id_criador: criadorId,
    id_assinatura: assinaturaId,
    id_video: videoId,
    valor_comissao: valorComissao,
    percentual_aplicado: percentualComissao,
    valor_original: valorOriginal,
    moeda: "BRL",
    status: "disponivel", // Disponível imediatamente para demonstração
    data_geracao: new Date(),
    data_disponibilizacao: new Date(),
  });

  return await novaComissao.save({ session });
}

// GET /payments/user/:userId - Histórico de pagamentos do usuário
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const assinaturas = await Subscription.find({ id_usuario: userId })
      .populate("video", "titulo thumbnail")
      .sort({ data_pagamento: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Subscription.countDocuments({ id_usuario: userId });

    res.json({
      sucesso: true,
      assinaturas,
      paginacao: {
        pagina_atual: Number(page),
        total_paginas: Math.ceil(total / Number(limit)),
        total_registros: total,
        registros_por_pagina: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar histórico de pagamentos",
    });
  }
});

// POST /payments/webhook - Webhook para confirmação de pagamento
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const { transaction_id, status, gateway } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        sucesso: false,
        erro: "Transaction ID obrigatório",
      });
    }

    const assinatura = await Subscription.findOne({ transaction_id });

    if (!assinatura) {
      return res.status(404).json({
        sucesso: false,
        erro: "Assinatura não encontrada",
      });
    }

    // Atualizar status da assinatura
    assinatura.status_pagamento = status;

    if (status === "aprovado") {
      assinatura.ativo = true;

      // Ativar comissões relacionadas
      await Commission.updateMany(
        { id_assinatura: assinatura._id },
        {
          status: "disponivel",
          data_disponibilizacao: new Date(),
        },
      );

      // Atualizar usuário
      await User.findByIdAndUpdate(assinatura.id_usuario, {
        assinante: true,
        subscriptionStatus: "ativo",
      });
    } else if (status === "rejeitado" || status === "cancelado") {
      assinatura.ativo = false;

      // Cancelar comissões relacionadas
      await Commission.updateMany(
        { id_assinatura: assinatura._id },
        { status: "cancelado" },
      );
    }

    await assinatura.save();

    res.json({
      sucesso: true,
      mensagem: "Webhook processado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro no webhook:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao processar webhook",
    });
  }
});

// GET /payments/stats - Estatísticas gerais de pagamentos
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          total_receita: { $sum: "$valor_pago" },
          total_assinaturas: { $sum: 1 },
          assinaturas_ativas: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$ativo", true] },
                    { $eq: ["$status_pagamento", "aprovado"] },
                    { $gt: ["$data_fim_periodo", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const comissoesStats = await Commission.aggregate([
      {
        $group: {
          _id: null,
          total_comissoes: { $sum: "$valor_comissao" },
          comissoes_disponiveis: {
            $sum: {
              $cond: [{ $eq: ["$status", "disponivel"] }, "$valor_comissao", 0],
            },
          },
          comissoes_pagas: {
            $sum: {
              $cond: [{ $eq: ["$status", "pago"] }, "$valor_comissao", 0],
            },
          },
        },
      },
    ]);

    res.json({
      sucesso: true,
      estatisticas: {
        pagamentos: stats[0] || {
          total_receita: 0,
          total_assinaturas: 0,
          assinaturas_ativas: 0,
        },
        comissoes: comissoesStats[0] || {
          total_comissoes: 0,
          comissoes_disponiveis: 0,
          comissoes_pagas: 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar estatísticas",
    });
  }
});

export default router;
