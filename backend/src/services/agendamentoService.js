const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getWeekStart, podeAlterar } = require('../utils/dateUtils');

class AgendamentoService {
  async criar(data) {
    const { clienteId, dataAgendamento, horaInicio, servicosIds } = data;

    // 0. Verificar conflito de horário (pendente ou confirmado)
    const dataHora = new Date(`${dataAgendamento}T${horaInicio}:00`);
    const conflito = await prisma.agendamento.findFirst({
      where: {
        data: dataHora,
        status: { in: ['pendente', 'confirmado'] },
      },
    });
    if (conflito) {
      throw new Error('Horário indisponível. Já existe um agendamento para esta data/hora.');
    }

    // 1. Verificar agendamentos na mesma semana
    const semanaInicio = getWeekStart(dataAgendamento);
    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaFim.getDate() + 6);

    const agendamentosSemana = await prisma.agendamento.findMany({
      where: {
        clienteId,
        data: {
          gte: semanaInicio,
          lte: semanaFim,
        },
      },
      orderBy: { data: 'asc' },
    });

    let sugestao = null;
    if (agendamentosSemana.length > 0) {
      const primeiro = agendamentosSemana[0];
      sugestao = {
        mensagem: `Você já tem agendamento em ${primeiro.data.toLocaleDateString()}. Deseja usar a mesma data?`,
        dataSugerida: primeiro.data,
      };
    }

    // 2. Criar o agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        data: dataHora,
        status: 'pendente',
        clienteId,
        itens: {
          create: servicosIds.map(servicoId => ({
            servicoId,
            statusServico: 'pendente',
            precoNaHora: 0,
          })),
        },
      },
      include: { itens: true },
    });

    // 3. Atualizar precoNaHora com o preço atual dos serviços
    for (const item of agendamento.itens) {
      const servico = await prisma.servico.findUnique({ where: { id: item.servicoId } });
      await prisma.itemAgendamento.update({
        where: { id: item.id },
        data: { precoNaHora: servico.preco },
      });
    }

    return { agendamento, sugestao };
  }

  async alterar(id, novaData, novaHora, isAdmin = false) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) throw new Error('Agendamento não encontrado');

    if (!isAdmin) {
      const pode = podeAlterar(new Date(agendamento.data));
      if (!pode) {
        throw new Error('Alteração permitida somente por telefone (menos de 2 dias).');
      }
    }

    const novaDataHora = new Date(`${novaData}T${novaHora}:00`);

    // Verificar conflito de horário (ignorando o próprio agendamento)
    const conflito = await prisma.agendamento.findFirst({
      where: {
        data: novaDataHora,
        status: { in: ['pendente', 'confirmado'] },
        id: { not: id },
      },
    });
    if (conflito) {
      throw new Error('Horário indisponível. Escolha outro horário.');
    }

    return await prisma.agendamento.update({
      where: { id },
      data: { data: novaDataHora },
    });
  }

  async historico(clienteId, dataInicio, dataFim) {
    return await prisma.agendamento.findMany({
      where: {
        clienteId,
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim),
        },
      },
      include: {
        itens: {
          include: { servico: true },
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async listarTodos() {
    return await prisma.agendamento.findMany({
      include: {
        cliente: true,
        itens: { include: { servico: true } },
      },
      orderBy: { data: 'desc' },
    });
  }

  async confirmarAgendamento(id) {
    return await prisma.agendamento.update({
      where: { id },
      data: { status: 'confirmado' },
    });
  }

  async atualizarStatusServico(itemId, status) {
    return await prisma.itemAgendamento.update({
      where: { id: itemId },
      data: { statusServico: status },
    });
  }
}

module.exports = new AgendamentoService();