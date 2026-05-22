const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
};