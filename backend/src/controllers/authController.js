const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { gerarToken } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) return res.status(401).json({ erro: 'Credenciais inválidas' });

    // Comparação com hash
    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken(cliente);
    res.json({ token, usuario: { id: cliente.id, nome: cliente.nome, email: cliente.email, role: cliente.role } });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Se existir o método criarAdmin, também precisa hashear a senha
exports.criarAdmin = async (req, res) => {
  try {
    const senhaHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.cliente.create({
      data: {
        nome: 'Administrador',
        email: 'admin@cabeleila.com',
        telefone: '11999999999',
        senha: senhaHash,
        role: 'admin',
      },
    });
    res.json(admin);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};