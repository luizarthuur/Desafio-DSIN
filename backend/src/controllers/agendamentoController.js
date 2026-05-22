const agendamentoService = require('../services/agendamentoService');

exports.criar = async (req, res) => {
  try {
    const { clienteId, data, horaInicio, servicosIds } = req.body;
    const resultado = await agendamentoService.criar({ clienteId, dataAgendamento: data, horaInicio, servicosIds });
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.alterar = async (req, res) => {
  try {
    const { id } = req.params;
    const { novaData, novaHora, isAdmin } = req.body;
    const agendamento = await agendamentoService.alterar(parseInt(id), novaData, novaHora, isAdmin);
    res.json(agendamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.historico = async (req, res) => {
  try {
    const { clienteId, dataInicio, dataFim } = req.query;
    const historico = await agendamentoService.historico(parseInt(clienteId), dataInicio, dataFim);
    res.json(historico);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.listarTodos = async (req, res) => {
  try {
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