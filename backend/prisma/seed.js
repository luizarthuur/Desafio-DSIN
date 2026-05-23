const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.itemAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.servico.deleteMany();

  await prisma.servico.createMany({
    data: [
      { nome: 'Corte feminino', duracao: 45, preco: 50.0 },
      { nome: 'Corte masculino', duracao: 30, preco: 35.0 },
      { nome: 'Tintura', duracao: 90, preco: 120.0 },
      { nome: 'Escova', duracao: 40, preco: 40.0 },
      { nome: 'Manicure', duracao: 30, preco: 25.0 },
    ],
  });

  const senhaHash = await bcrypt.hash('123456', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  await prisma.cliente.createMany({
    data: [
      { nome: 'Ana Silva', email: 'ana@email.com', telefone: '11999999999', senha: senhaHash, role: 'cliente' },
      { nome: 'João Souza', email: 'joao@email.com', telefone: '11888888888', senha: senhaHash, role: 'cliente' },
      { nome: 'Maria Oliveira', email: 'maria@email.com', telefone: '11777777777', senha: senhaHash, role: 'cliente' },
      { nome: 'Admin Leila', email: 'admin@cabeleila.com', telefone: '11999999999', senha: adminHash, role: 'admin' },
    ],
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());