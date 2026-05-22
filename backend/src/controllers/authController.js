const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { gerarToken } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) return res.status(401).json({ erro: 'Credenciais inválidas' });

    // Comparação com bcrypt (se a senha no banco estiver hasheada)
    // Se você ainda tem senhas em texto plano, use a comparação direta abaixo
    // const senhaValida = await bcrypt.compare(senha, cliente.senha);
    const senhaValida = (senha === cliente.senha); // temporário, depois mude para bcrypt

    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken(cliente);
    res.json({
      token,
      usuario: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        role: cliente.role,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Rota temporária para criar um usuário admin (use apenas para testes)
exports.criarAdmin = async (req, res) => {
  try {
    const admin = await prisma.cliente.create({
      data: {
        nome: 'Administrador',
        email: 'admin@cabeleila.com',
        telefone: '11999999999',
        senha: 'admin123', // depois você pode hashear
        role: 'admin',
      },
    });
    res.json(admin);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};