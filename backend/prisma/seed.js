const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes (opcional, evita duplicação)
  await prisma.itemAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.servico.deleteMany();

  // Criar serviços
  await prisma.servico.createMany({
    data: [
      { nome: 'Corte feminino', duracao: 45, preco: 50.0 },
      { nome: 'Corte masculino', duracao: 30, preco: 35.0 },
      { nome: 'Tintura', duracao: 90, preco: 120.0 },
      { nome: 'Escova', duracao: 40, preco: 40.0 },
      { nome: 'Manicure', duracao: 30, preco: 25.0 },
    ],
  });

  // Criar clientes (atenção: modelo é "cliente", não "clientes")
  await prisma.cliente.createMany({
    data: [
      { nome: 'Ana Silva', email: 'ana@email.com', telefone: '11999999999', senha: '123456' },
      { nome: 'João Souza', email: 'joao@email.com', telefone: '11888888888', senha: '123456' },
      { nome: 'Maria Oliveira', email: 'maria@email.com', telefone: '11777777777', senha: '123456' },
    ],
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });