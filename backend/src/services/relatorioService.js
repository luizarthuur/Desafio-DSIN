const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getWeekStart } = require('../utils/dateUtils');

class RelatorioService {
  async desempenhoSemanal(dataReferencia = new Date()) {
    const semanaInicio = getWeekStart(dataReferencia);
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6);
    semanaFim.setHours(23, 59, 59, 999);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data: {
          gte: semanaInicio,
          lte: semanaFim,
        },
      },
      include: {
        itens: {
          include: { servico: true },
        },
      },
    });

    const totalAgendamentos = agendamentos.length;
    let receitaTotal = 0;
    const servicosContagem = new Map();
    let totalCancelados = 0;
    let totalConfirmados = 0;
    let totalPendentes = 0;

    for (const ag of agendamentos) {
      for (const item of ag.itens) {
        receitaTotal += item.precoNaHora;
        const nomeServico = item.servico.nome;
        servicosContagem.set(nomeServico, (servicosContagem.get(nomeServico) || 0) + 1);
      }

      if (ag.status === 'cancelado') totalCancelados++;
      else if (ag.status === 'confirmado') totalConfirmados++;
      else if (ag.status === 'pendente') totalPendentes++;
    }

    const servicosOrdenados = Array.from(servicosContagem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome, quantidade]) => ({ nome, quantidade }));

    return {
      semana: {
        inicio: semanaInicio.toISOString().split('T')[0],
        fim: semanaFim.toISOString().split('T')[0],
      },
      totalAgendamentos,
      receitaTotal,
      servicosMaisSolicitados: servicosOrdenados,
      cancelamentos: totalCancelados,
      confirmados: totalConfirmados,
      pendentes: totalPendentes,
    };
  }
}

module.exports = new RelatorioService();