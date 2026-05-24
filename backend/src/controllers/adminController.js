const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listarClientes = async (req, res) => {
  const clientes = await prisma.cliente.findMany({ select: { id: true, nome: true, email: true, telefone: true, role: true } });
  res.json(clientes);
};
exports.atualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, role } = req.body;
  const cliente = await prisma.cliente.update({ where: { id: parseInt(id) }, data: { nome, email, telefone, role } });
  res.json(cliente);
};
exports.deletarCliente = async (req, res) => {
  const { id } = req.params;
  await prisma.cliente.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
};

exports.listarServicosAdmin = async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
};
exports.criarServico = async (req, res) => {
  const { nome, descricao, duracao, preco, imagemUrl } = req.body;
  const servico = await prisma.servico.create({ data: { nome, descricao, duracao, preco, imagemUrl } });
  res.status(201).json(servico);
};
exports.atualizarServico = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, duracao, preco, imagemUrl } = req.body;
  const servico = await prisma.servico.update({ where: { id: parseInt(id) }, data: { nome, descricao, duracao, preco, imagemUrl } });
  res.json(servico);
};
exports.deletarServico = async (req, res) => {
  const { id } = req.params;
  await prisma.servico.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
};

exports.cancelarAgendamento = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const agendamento = await prisma.agendamento.update({
    where: { id: parseInt(id) },
    data: { status: 'cancelado', motivoCancelamento: motivo }
  });
  res.json(agendamento);
};