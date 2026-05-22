const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
};