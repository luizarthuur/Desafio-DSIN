const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
};

exports.criar = async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;
    const existe = await prisma.cliente.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        senha: senhaHash,
        role: 'cliente',
      },
    });
    const { senha: _, ...clienteSemSenha } = cliente;
    res.status(201).json(clienteSemSenha);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};