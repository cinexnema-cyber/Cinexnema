import express, { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Video from "../models/Video";
import Commission from "../models/Commission";
import Subscription from "../models/Subscription";

const router = express.Router();

// GET /creator/earnings/:creatorId - Ganhos do criador
router.get("/earnings/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { periodo = "30d" } = req.query;

    // Verificar se o criador existe
    const criador = await User.findById(creatorId);
    if (!criador) {
      return res.status(404).json({
        sucesso: false,
        erro: "Criador não encontrado",
      });
    }

    // Calcular data inicial baseada no período
    let dataInicial = new Date();
    switch (periodo) {
      case "7d":
        dataInicial.setDate(dataInicial.getDate() - 7);
        break;
      case "30d":
        dataInicial.setDate(dataInicial.getDate() - 30);
        break;
      case "90d":
        dataInicial.setDate(dataInicial.getDate() - 90);
        break;
      case "1y":
        dataInicial.setFullYear(dataInicial.getFullYear() - 1);
        break;
      default:
        dataInicial.setDate(dataInicial.getDate() - 30);
    }

    // Buscar comissões do período
    const comissoesPeriodo = await Commission.find({
      id_criador: creatorId,
      data_geracao: { $gte: dataInicial },
    })
      .populate("assinatura", "valor_pago metodo_pagamento data_pagamento")
      .populate("video", "titulo thumbnail")
      .sort({ data_geracao: -1 });

    // Calcular estatísticas
    const estatisticas = await Commission.aggregate([
      {
        $match: {
          id_criador: new mongoose.Types.ObjectId(creatorId),
          data_geracao: { $gte: dataInicial },
        },
      },
      {
        $group: {
          _id: null,
          total_ganho: { $sum: "$valor_comissao" },
          total_disponivel: {
            $sum: {
              $cond: [{ $eq: ["$status", "disponivel"] }, "$valor_comissao", 0],
            },
          },
          total_pago: {
            $sum: {
              $cond: [{ $eq: ["$status", "pago"] }, "$valor_comissao", 0],
            },
          },
          quantidade_transacoes: { $sum: 1 },
        },
      },
    ]);

    // Ganhos por dia (últimos 30 dias)
    const ganhosPorDia = await Commission.aggregate([
      {
        $match: {
          id_criador: new mongoose.Types.ObjectId(creatorId),
          data_geracao: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$data_geracao" },
          },
          ganho_dia: { $sum: "$valor_comissao" },
          transacoes: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Ganhos por vídeo
    const ganhosPorVideo = await Commission.aggregate([
      {
        $match: {
          id_criador: new mongoose.Types.ObjectId(creatorId),
          data_geracao: { $gte: dataInicial },
        },
      },
      {
        $group: {
          _id: "$id_video",
          total_ganho: { $sum: "$valor_comissao" },
          quantidade_vendas: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $unwind: "$video",
      },
      {
        $sort: { total_ganho: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      sucesso: true,
      criador: {
        id: criador._id,
        nome: criador.nome,
        saldo_disponivel: criador.saldoDisponivel,
        total_ganho: criador.totalGanho,
        percentual_comissao: criador.comissaoPercentual,
      },
      periodo: {
        inicio: dataInicial,
        fim: new Date(),
        dias: Math.ceil(
          (Date.now() - dataInicial.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
      estatisticas: estatisticas[0] || {
        total_ganho: 0,
        total_disponivel: 0,
        total_pago: 0,
        quantidade_transacoes: 0,
      },
      ganhos_por_dia: ganhosPorDia,
      ganhos_por_video: ganhosPorVideo,
      comissoes_recentes: comissoesPeriodo.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Erro ao buscar ganhos do criador:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar ganhos do criador",
    });
  }
});

// GET /creator/dashboard/:creatorId - Dashboard completo do criador
router.get("/dashboard/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    // Verificar se o criador existe
    const criador = await User.findById(creatorId);
    if (!criador) {
      return res.status(404).json({
        sucesso: false,
        erro: "Criador não encontrado",
      });
    }

    // Estatísticas dos vídeos do criador
    const videosStats = await Video.aggregate([
      {
        $match: { id_criador: new mongoose.Types.ObjectId(creatorId) },
      },
      {
        $group: {
          _id: null,
          total_videos: { $sum: 1 },
          total_visualizacoes: { $sum: "$visualizacoes" },
          total_curtidas: { $sum: "$curtidas" },
          videos_ativos: {
            $sum: { $cond: [{ $eq: ["$status", "ativo"] }, 1, 0] },
          },
        },
      },
    ]);

    // Assinantes do criador (últimos 30 dias)
    const novosAssinantes = await Subscription.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "id_video",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $match: {
          "video.id_criador": new mongoose.Types.ObjectId(creatorId),
          data_pagamento: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          status_pagamento: "aprovado",
        },
      },
      {
        $group: {
          _id: null,
          novos_assinantes: { $sum: 1 },
          receita_total: { $sum: "$valor_pago" },
        },
      },
    ]);

    // Vídeos mais populares
    const videosPopulares = await Video.find({
      id_criador: creatorId,
      status: "ativo",
    })
      .sort({ visualizacoes: -1 })
      .limit(5)
      .select("titulo visualizacoes curtidas thumbnail data_publicacao");

    // Ganhos mensais (últimos 6 meses)
    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

    const ganhosMensais = await Commission.aggregate([
      {
        $match: {
          id_criador: new mongoose.Types.ObjectId(creatorId),
          data_geracao: { $gte: seiseMesesAtras },
        },
      },
      {
        $group: {
          _id: {
            ano: { $year: "$data_geracao" },
            mes: { $month: "$data_geracao" },
          },
          ganho_mensal: { $sum: "$valor_comissao" },
          transacoes: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.ano": 1, "_id.mes": 1 },
      },
    ]);

    res.json({
      sucesso: true,
      criador: {
        id: criador._id,
        nome: criador.nome,
        email: criador.email,
        saldo_disponivel: criador.saldoDisponivel,
        total_ganho: criador.totalGanho,
        percentual_comissao: criador.comissaoPercentual,
        verificado: criador.verificado,
        data_criacao: criador.data_criacao,
      },
      estatisticas_videos: videosStats[0] || {
        total_videos: 0,
        total_visualizacoes: 0,
        total_curtidas: 0,
        videos_ativos: 0,
      },
      assinantes: novosAssinantes[0] || {
        novos_assinantes: 0,
        receita_total: 0,
      },
      videos_populares: videosPopulares,
      ganhos_mensais: ganhosMensais,
    });
  } catch (error: any) {
    console.error("Erro ao buscar dashboard do criador:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar dashboard do criador",
    });
  }
});

// POST /creator/withdraw/:creatorId - Solicitar saque
router.post("/withdraw/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { valor, metodo_pagamento, dados_pagamento } = req.body;

    // Validações
    if (!valor || valor <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Valor inválido",
      });
    }

    if (!metodo_pagamento || !dados_pagamento) {
      return res.status(400).json({
        sucesso: false,
        erro: "Método de pagamento e dados obrigatórios",
      });
    }

    // Verificar se o criador existe e tem saldo suficiente
    const criador = await User.findById(creatorId);
    if (!criador) {
      return res.status(404).json({
        sucesso: false,
        erro: "Criador não encontrado",
      });
    }

    if (criador.saldoDisponivel < valor) {
      return res.status(400).json({
        sucesso: false,
        erro: "Saldo insuficiente",
      });
    }

    // Valor mínimo para saque (R$ 10,00)
    if (valor < 1000) {
      return res.status(400).json({
        sucesso: false,
        erro: "Valor mínimo para saque é R$ 10,00",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Marcar comissões como pagas
      const comissoesDisponiveis = await Commission.find({
        id_criador: creatorId,
        status: "disponivel",
      })
        .sort({ data_geracao: 1 })
        .session(session);

      let valorRestante = valor;
      const comissoesParaMarcar = [];

      for (const comissao of comissoesDisponiveis) {
        if (valorRestante <= 0) break;

        if (comissao.valor_comissao <= valorRestante) {
          comissoesParaMarcar.push(comissao._id);
          valorRestante -= comissao.valor_comissao;
        }
      }

      // Marcar comissões como pagas
      await Commission.updateMany(
        { _id: { $in: comissoesParaMarcar } },
        {
          status: "pago",
          data_pagamento: new Date(),
          metodo_pagamento_criador: metodo_pagamento,
          referencia_pagamento: `SAQUE_${Date.now()}`,
          observacoes: `Saque solicitado via ${metodo_pagamento}`,
        },
        { session },
      );

      // Atualizar saldo do criador
      await User.findByIdAndUpdate(
        creatorId,
        { $inc: { saldoDisponivel: -valor } },
        { session },
      );

      await session.commitTransaction();

      res.json({
        sucesso: true,
        mensagem: "Saque processado com sucesso",
        saque: {
          valor,
          metodo_pagamento,
          data_solicitacao: new Date(),
          status: "processando",
          comissoes_marcadas: comissoesParaMarcar.length,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Erro ao processar saque:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao processar saque",
    });
  }
});

// GET /creator/videos/:creatorId - Vídeos do criador
router.get("/videos/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10, status = "all" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let filtro: any = { id_criador: creatorId };
    if (status !== "all") {
      filtro.status = status;
    }

    const videos = await Video.find(filtro)
      .sort({ data_upload: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(
        "titulo descricao thumbnail status categoria visualizacoes curtidas data_upload tipo",
      );

    const total = await Video.countDocuments(filtro);

    res.json({
      sucesso: true,
      videos,
      paginacao: {
        pagina_atual: Number(page),
        total_paginas: Math.ceil(total / Number(limit)),
        total_registros: total,
        registros_por_pagina: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar vídeos do criador:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar vídeos do criador",
    });
  }
});

// PUT /creator/profile/:creatorId - Atualizar perfil do criador
router.put("/profile/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { nome, bio, comissaoPercentual } = req.body;

    const updateData: any = {};

    if (nome) updateData.nome = nome;
    if (bio) updateData.bio = bio;
    if (
      comissaoPercentual &&
      comissaoPercentual >= 0 &&
      comissaoPercentual <= 100
    ) {
      updateData.comissaoPercentual = comissaoPercentual;
    }

    const criadorAtualizado = await User.findByIdAndUpdate(
      creatorId,
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    if (!criadorAtualizado) {
      return res.status(404).json({
        sucesso: false,
        erro: "Criador não encontrado",
      });
    }

    res.json({
      sucesso: true,
      criador: criadorAtualizado,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao atualizar perfil do criador",
    });
  }
});

export default router;
