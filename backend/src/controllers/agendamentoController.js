const agendamentoService = require('../services/agendamentoService');

exports.criar = async (req, res) => {
  try {
    const { clienteId, data, horaInicio, servicosIds } = req.body;

    // Verifica permissão: admin pode criar para qualquer cliente; cliente comum só para si mesmo
    if (req.usuario.role !== 'admin' && req.usuario.id !== clienteId) {
      return res.status(403).json({ erro: 'Você só pode criar agendamentos para si mesmo.' });
    }

    const resultado = await agendamentoService.criar({
      clienteId,
      dataAgendamento: data,
      horaInicio,
      servicosIds,
    });
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.alterar = async (req, res) => {
  try {
    const { id } = req.params;
    const { novaData, novaHora, isAdmin } = req.body;

    // Busca o agendamento para verificar o dono
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(id) },
      select: { clienteId: true },
    });
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    // Verifica permissão: admin pode alterar qualquer; cliente só os seus
    if (req.usuario.role !== 'admin' && req.usuario.id !== agendamento.clienteId) {
      return res.status(403).json({ erro: 'Você só pode alterar seus próprios agendamentos.' });
    }

    // Se for admin, força isAdmin = true para ignorar regra dos 2 dias
    const isAdminOverride = req.usuario.role === 'admin' ? true : (isAdmin || false);

    const agendamentoAtualizado = await agendamentoService.alterar(
      parseInt(id),
      novaData,
      novaHora,
      isAdminOverride
    );
    res.json(agendamentoAtualizado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.historico = async (req, res) => {
  try {
    let { clienteId, dataInicio, dataFim } = req.query;
    clienteId = parseInt(clienteId);

    // Admin pode ver histórico de qualquer cliente; cliente comum só o seu
    if (req.usuario.role !== 'admin' && req.usuario.id !== clienteId) {
      return res.status(403).json({ erro: 'Você só pode ver seu próprio histórico.' });
    }

    if (!clienteId || !dataInicio || !dataFim) {
      return res.status(400).json({ erro: 'Parâmetros clienteId, dataInicio e dataFim são obrigatórios.' });
    }

    const historico = await agendamentoService.historico(clienteId, dataInicio, dataFim);
    res.json(historico);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    // Esta rota é protegida por autorizarAdmin, então não precisa verificar novamente
    const agendamentos = await agendamentoService.listarTodos();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.confirmar = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await agendamentoService.confirmarAgendamento(parseInt(id));
    res.json(agendamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.atualizarStatusItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const item = await agendamentoService.atualizarStatusServico(parseInt(itemId), status);
    res.json(item);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};